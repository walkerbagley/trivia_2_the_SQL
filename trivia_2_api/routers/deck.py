from operator import add
from fastapi import APIRouter, HTTPException, Request, Query
from fastapi.responses import JSONResponse
from psycopg.connection import Cursor
from psycopg.rows import class_row, dict_row
from typing import Annotated, Optional, Union
from uuid import UUID

from trivia_2_api.models import deck
from trivia_2_api.models.question import Question

from ..db import db
from ..models import (
    Deck,
    DeckRequest,
    DeckRoundRequest,
    DeckQuestion,
    DeckUpdateRequest,
    Round,
)

router = APIRouter(
    prefix="/deck",
    tags=["deck"],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
async def get_deck() -> list[Deck]:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Deck)) as cur:
            cur.execute(
                """SELECT d.id, d.name, d.description, d.owner_id, count(distinct dr.round_id) as rounds
                            FROM "Decks" as d
                            LEFT OUTER JOIN "DeckRounds" as dr ON d.id = dr.deck_id
                            GROUP BY d.id"""
            )
            return cur.fetchall()


@router.get("/{id}")
async def get_deck(id: UUID) -> Deck:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Deck)) as cur:
            cur.execute(
                """SELECT d.id, d.name, d.description, d.owner_id, count(distinct dr.round_id) as rounds
                            FROM "Decks" as d
                            LEFT OUTER JOIN "DeckRounds" as dr ON d.id = dr.deck_id
                            WHERE d.id = %s
                            GROUP BY d.id""",
                (id,),
            )
            question = cur.fetchone()
            if question is None:
                raise HTTPException(status_code=404, detail="Deck not found")
            return question


@router.post("/")
async def create_deck(request: Request, deck: DeckRequest) -> None:
    if request.state.user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """INSERT INTO "Decks" (name, description, owner_id) VALUES (%s, %s, %s) RETURNING id""",
                (deck.name, deck.description, request.state.user.id),
            )
            deck_id = (cur.fetchone()).get("id", None)
            if deck_id is None:
                raise HTTPException(status_code=500, detail="Failed to create deck")

            for index, round in enumerate(deck.rounds):
                add_round(cur=cur, deck_id=deck_id, round=round, round_number=index + 1)

    return JSONResponse(status_code=201, content={"id": str(deck_id)})


def add_round(
    cur: Cursor, deck_id: UUID, round: DeckRoundRequest, round_number: int | None = None
) -> None:
    if round_number is not None:
        cur.execute(
            """
                UPDATE "DeckRounds" SET round_number = round_number + 1 WHERE deck_id = %s AND round_number >= %s
                """,
            (deck_id, round_number),
        )
    print("round number set")

    cur.execute(
        """
                INSERT INTO "DeckRounds" 
                (deck_id, round_number, num_questions, categories, attributes) 
                VALUES (%s::uuid, COALESCE(%s, (SELECT MAX(round_number) FROM "DeckRounds" WHERE deck_id = %s)) ,%s, COALESCE(%s, '{}'::text[]), COALESCE(%s, '{}'::text[])) RETURNING round_id""",
        (
            deck_id,
            round_number,
            deck_id,
            round.num_questions,
            round.categories,
            round.attributes,
        ),
    )

    round_id = cur.fetchone().get("round_id", None)
    if round_id is None:
        raise HTTPException(status_code=500, detail="Failed to add round")

    generate_random_questions(cur, deck_id, round_id, round)
    return None


def generate_random_questions(
    cur: Cursor, deck_id: UUID, round_id: UUID, round: DeckRoundRequest
) -> None:
    query = """INSERT INTO "RoundQuestions"(round_id, question_id, question_number) 
                    SELECT %s::uuid as round_id, 
                    q.id as question_id, 
                    ROW_NUMBER() OVER() as question_number
                    FROM 
                    (SELECT q.id
                    FROM "Questions" as q
                    WHERE NOT q.id = ANY(SELECT rq.question_id FROM "DeckRounds" as dr INNER JOIN "RoundQuestions" as rq ON dr.round_id = rq.round_id WHERE dr.deck_id = %s)"""
    arguments = [round_id, deck_id]

    if round.categories is not None:
        query += " AND category = ANY(%s)"
        arguments.append(round.categories)

    print(round.attributes)
    if round.attributes is not None and len(round.attributes) != 0:
        query += """ AND q.id IN (SELECT question_id FROM "QuestionAttributes" WHERE attribute = ANY(%s))"""
        arguments.append(round.attributes)

    query += " ORDER BY RANDOM()"

    query += " LIMIT %s"
    arguments.append(round.num_questions)

    query += ") as q "

    print(query)
    print(arguments)

    cur.execute(query, arguments)
    return None


@router.put("/{id}")
async def update_deck(id: UUID, deck: DeckUpdateRequest) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """UPDATE "Decks" SET name = %s, description = %s WHERE id = %s""",
                (deck.name, deck.description, id),
            )


@router.delete("/{id}")
async def delete_deck(id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""DELETE FROM "Decks" WHERE id = %s""", (id,))


@router.get("/{deck_id}/question")
async def get_deck_questions(
    deck_id: UUID, round: Annotated[Union[int, None], Query()] = None
) -> list[DeckQuestion]:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(DeckQuestion)) as cur:
            query = """SELECT q.id, q.question, q.difficulty, q.a, q.b, q.c, q.d, q.category, ARRAY(SELECT attribute FROM "QuestionAttributes" WHERE question_id = q.id) as attributes,
                        dr.round_number, rq.question_number
                        FROM "DeckRounds" as dr
                        INNER JOIN "RoundQuestions" as rq ON dr.round_id = rq.round_id
                        LEFT OUTER JOIN "Questions" as q ON rq.question_id = q.id
                        WHERE dr.deck_id = %s
                        """
            params = [deck_id]

            if round is not None:
                query += " AND dr.round_number = %s"
                params.append(round)

            query += " ORDER BY dr.round_number, rq.question_number"
            cur.execute(query, params)
            return cur.fetchall()


@router.get("/{deck_id}/round")
async def get_deck_rounds(deck_id: UUID) -> list[Round]:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Round)) as cur:
            cur.execute(
                """SELECT round_id as id, round_number, num_questions, categories, attributes FROM "DeckRounds" WHERE deck_id = %s ORDER BY round_number""",
                (deck_id,),
            )
            return cur.fetchall()


@router.delete("/round/{round_id}")
async def delete_deck_round(round_id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """UPDATE "DeckRounds" SET round_number = round_number - 1 WHERE round_number > (SELECT round_number FROM "DeckRounds" WHERE round_id = %s)""",
                (round_id,),
            )
            cur.execute("""DELETE FROM "DeckRounds" WHERE round_id = %s""", (round_id,))


@router.post("/{deck_id}/round")
async def add_deck_round(
    deck_id: UUID,
    round: DeckRoundRequest,
    round_number: Annotated[Union[int, None], Query()] = None,
) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            add_round(cur, deck_id, round, round_number)
    return None


@router.put("/round/{round_id}")
async def update_deck_round(round_id: UUID, round: DeckRoundRequest) -> None:
    ret = await _update_deck_round(round_id, round)
    return ret


async def _update_deck_round(round_id: UUID, round: DeckRoundRequest) -> None:
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """UPDATE "DeckRounds" SET num_questions = %s, categories = %s, attributes = %s WHERE round_id = %s RETURNING deck_id, round_number""",
                (round.num_questions, round.categories, round.attributes, round_id),
            )
            results = cur.fetchone()
            round_number = results.get("round_number", None)
            deck_id = results.get("deck_id", None)
            if round_number is None or deck_id is None:
                raise HTTPException(status_code=404, detail="Round not found")

            cur.execute(
                """DELETE FROM "RoundQuestions" WHERE round_id = %s""", (round_id,)
            )

            print("deleted questions")
            generate_random_questions(cur, deck_id, round_id, round)
            print("added questions")

    return None


@router.get("/question/")
async def roll_question(
    category: Optional[str] = None, difficulty: Optional[int] = None
) -> Question:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(DeckQuestion)) as cur:
            query = """SELECT q.id, q.question, q.difficulty, q.a, q.b, q.c, q.d, q.category
                        FROM "Questions" as q
                        WHERE 1=1
                        """
            params = []

            if category is not None:
                query += " AND q.category = %s"
                params.append(category)

            if difficulty and difficulty > 0 and difficulty < 4:
                query += " AND q.difficulty = %s"
                params.append(difficulty)

            query += " ORDER BY RANDOM() LIMIT 1"
            cur.execute(query, params)
            question = cur.fetchone()
            if question is None:
                raise HTTPException(
                    status_code=404, detail="No question found matching criteria"
                )
            return question


# @router.post("/question/{question_num}/{question_id}/round/{round_id}")
# async def add_question_to_round(
#     question_num: int, question_id: UUID, round_id: UUID
# ) -> None:
#     with db.connection() as conn:
#         with conn.cursor() as cur:
#             cur.execute(
#                 """INSERT INTO "RoundQuestions" (round_id, question_id, question_number) VALUES (%s, %s, %s)""",
#                 (round_id, question_id, question_num),
#             )

#     await _update_deck_round(round_id, DeckRoundRequest())
#     return None
