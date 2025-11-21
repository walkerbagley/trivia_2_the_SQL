from fastapi import APIRouter, HTTPException, Request, Query
from fastapi.responses import JSONResponse
from psycopg.connection import Cursor
from psycopg.rows import class_row, dict_row
from typing import Annotated, Union
from uuid import UUID

from ..db import db
from ..models import (
    Deck,
    DeckRequest,
    DeckRoundRequest,
    DeckQuestion,
    DeckUpdateRequest,
    Round,
)
from .question import roll_question

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
    if not round_number:
        raise HTTPException(status_code=400, detail="Round number must be provided")
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
                VALUES (%s::uuid, COALESCE(%s, (SELECT COALESCE(MAX(round_number), 0) + 1 FROM "DeckRounds" WHERE deck_id = %s)) ,%s, COALESCE(%s, '{}'::text[]), COALESCE(%s, '{}'::text[])) RETURNING round_id""",
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
    if not round.num_questions or round.num_questions <= 0:
        raise HTTPException(
            status_code=400, detail="Number of questions must be positive"
        )
    if not deck_id or not round_id:
        raise HTTPException(status_code=400, detail="Invalid parameters")
    query = """INSERT INTO "RoundQuestions"(round_id, question_id, question_number) 
                    SELECT %s::uuid as round_id, 
                    q.id as question_id, 
                    ROW_NUMBER() OVER() as question_number
                    FROM 
                    (SELECT q.id
                    FROM "Questions" as q
                    WHERE NOT q.id = ANY(SELECT rq.question_id FROM "DeckRounds" as dr INNER JOIN "RoundQuestions" as rq ON dr.round_id = rq.round_id WHERE dr.deck_id = %s)"""
    arguments = [round_id, deck_id]

    if round.categories is not None and len(round.categories) > 0:
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

    cur.execute(query, arguments)

    # Check if any rows were inserted
    rows_inserted = cur.rowcount

    if rows_inserted == 0:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate questions for the round with the given filters",
        )

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
            query = """SELECT q.id, q.question, q.difficulty, q.a, q.b, q.c, q.d, q.category, q.review_status, q.created_by, ARRAY(SELECT attribute FROM "QuestionAttributes" WHERE question_id = q.id) as attributes,
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
            cur.execute(
                """DELETE FROM "RoundQuestions" WHERE round_id = %s""", (round_id,)
            )
            cur.execute("""DELETE FROM "DeckRounds" WHERE round_id = %s""", (round_id,))


@router.post("/{deck_id}/round")
async def add_deck_round(
    deck_id: UUID,
    round: DeckRoundRequest,
    round_number: int,
) -> None:
    if not round_number or round_number <= 0:
        raise HTTPException(status_code=400, detail="Invalid round number")
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
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
    return True


@router.post("/round/{round_id}/{question_num}")
async def add_question_to_round(
    round_id: UUID, question_num: int, category: str = None, difficulty: int = None
) -> dict:
    if not all([question_num, round_id]):
        raise HTTPException(status_code=400, detail="Invalid parameters")

    try:
        question = await roll_question(category=category, difficulty=difficulty)
    except HTTPException:
        raise HTTPException(
            status_code=404, detail="No questions available for the selected filters"
        )

    round_req = DeckRoundRequest()
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """INSERT INTO "RoundQuestions" (round_id, question_id, question_number) VALUES (%s, %s, %s)""",
                (round_id, question.id, question_num),
            )
            # Check if the insert was successful by checking rowcount
            if cur.rowcount == 0:
                raise HTTPException(
                    status_code=500, detail="Failed to add question to round"
                )
            cur.execute(
                """SELECT * from "DeckRounds" WHERE round_id = %s""", (round_id,)
            )
            result = cur.fetchone()
            if not result:
                raise HTTPException(
                    status_code=500, detail="Failed to add question to round"
                )
            round_req.num_questions = result["num_questions"] + 1
            round_req.categories = result["categories"] if result["categories"] else []
            round_req.attributes = result["attributes"] if result["attributes"] else []

            if question.category not in round_req.categories:
                round_req.categories.append(question.category)

    ret = await _update_deck_round(round_id, round_req)
    if ret:
        # Return the question data for the frontend to use
        return {
            "success": True,
            "question": {
                "id": str(question.id),
                "question": question.question,
                "difficulty": question.difficulty,
                "a": question.a,
                "b": question.b,
                "c": question.c,
                "d": question.d,
                "category": question.category,
                "question_number": question_num,
                "round_number": None,  # Frontend will set this
            },
        }
    raise HTTPException(status_code=500, detail="Failed to update round")


@router.put("/round/{round_id}/question/{question_id}/{question_number}")
async def replace_question_in_round(
    round_id: UUID,
    question_id: UUID,
    question_number: int,
    category: str = None,
    difficulty: int = None,
) -> dict:
    """
    Please ensure that the new question will have the same category as the old question
    """
    if not all([question_id, round_id]):
        raise HTTPException(status_code=400, detail="Invalid parameters")

    try:
        new_question = await roll_question(category=category, difficulty=difficulty)
    except HTTPException:
        raise HTTPException(
            status_code=404, detail="No questions available for the selected filters"
        )

    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """UPDATE "RoundQuestions" SET question_id = %s 
                   WHERE round_id = %s AND question_id = %s""",
                (new_question.id, round_id, question_id),
            )

            if cur.rowcount == 0:
                raise HTTPException(
                    status_code=500, detail="Failed to replace question in round"
                )
        return {
            "success": True,
            "question": {
                "id": str(new_question.id),
                "question": new_question.question,
                "difficulty": new_question.difficulty,
                "a": new_question.a,
                "b": new_question.b,
                "c": new_question.c,
                "d": new_question.d,
                "category": new_question.category,
                "question_number": question_number,
                "round_number": None,  # Frontend will set this
            },
        }
    raise HTTPException(status_code=500, detail="Failed to update round")


# @router.post("/round/{round_id}/{question_num}/{question_id}")
# async def add_question_to_round(
#     question_num: int, question_id: UUID, round_id: UUID
# ) -> None:
#     if not all([question_num, question_id, round_id]):
#         raise HTTPException(status_code=400, detail="Invalid parameters")
#     round_req = DeckRoundRequest()
#     with db.connection() as conn:
#         with conn.cursor(row_factory=dict_row) as cur:
#             cur.execute(
#                 """INSERT INTO "RoundQuestions" (round_id, question_id, question_number) VALUES (%s, %s, %s)""",
#                 (round_id, question_id, question_num),
#             )
#             # Check if the insert was successful by checking rowcount
#             if cur.rowcount == 0:
#                 raise HTTPException(
#                     status_code=500, detail="Failed to add question to round"
#                 )
#             cur.execute(
#                 """SELECT * from "DeckRounds" WHERE round_id = %s""", (round_id,)
#             )
#             result = cur.fetchone()
#             if not result:
#                 raise HTTPException(
#                     status_code=500, detail="Failed to add question to round"
#                 )
#             round_req.num_questions = result["num_questions"] + 1
#             round_req.categories = result["categories"] if result["categories"] else []
#             round_req.attributes = result["attributes"] if result["attributes"] else []
#             cur.execute("""SELECT * from "Questions" WHERE id = %s""", (question_id,))
#             result = cur.fetchone()
#             if not result:
#                 raise HTTPException(
#                     status_code=500, detail="Failed to add question to round"
#                 )
#             if result["category"] not in round_req.categories:
#                 round_req.categories.append(result["category"])
#     ret = await _update_deck_round(round_id, round_req)
#     if ret:
#         return True
#     return None


@router.delete("/round/{round_id}/question/{question_id}")
async def remove_question_from_round(question_id: UUID, round_id: UUID) -> None:
    if not all([question_id, round_id]):
        raise HTTPException(status_code=400, detail="Invalid parameters")
    round_req = DeckRoundRequest()
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            # First, get the question being removed to find its position
            cur.execute(
                """SELECT rq.question_number FROM "RoundQuestions" rq 
                   WHERE rq.round_id = %s AND rq.question_id = %s""",
                (round_id, question_id),
            )
            question_position = cur.fetchone()
            if not question_position:
                raise HTTPException(
                    status_code=404, detail="Question not found in round"
                )
            removed_question_num = question_position["question_number"]

            cur.execute("""SELECT * from "Questions" WHERE id = %s""", (question_id,))
            question_result = cur.fetchone()
            if not question_result:
                raise HTTPException(status_code=404, detail="Question not found")

            cur.execute(
                """DELETE FROM "RoundQuestions" WHERE round_id = %s AND question_id = %s""",
                (round_id, question_id),
            )
            if cur.rowcount == 0:
                raise HTTPException(
                    status_code=404, detail="Question not found in round"
                )
            print(f"Successfully removed question {question_id} from round {round_id}")

            # Update question numbers for all subsequent questions in the same round
            cur.execute(
                """UPDATE "RoundQuestions" 
                   SET question_number = question_number - 1 
                   WHERE round_id = %s AND question_number > %s""",
                (round_id, removed_question_num),
            )
            print(
                f"Updated {cur.rowcount} question numbers after position {removed_question_num}"
            )

            cur.execute(
                """SELECT * from "DeckRounds" WHERE round_id = %s""", (round_id,)
            )
            result = cur.fetchone()
            if not result:
                raise HTTPException(
                    status_code=500, detail="Failed to remove question from round"
                )
            round_req.num_questions = result["num_questions"] - 1
            round_req.categories = result["categories"] if result["categories"] else []
            round_req.attributes = result["attributes"] if result["attributes"] else []

            # Only remove if no other questions in this round have this category
            cur.execute(
                """SELECT COUNT(*) as count FROM "RoundQuestions" rq 
                   JOIN "Questions" q ON rq.question_id = q.id 
                   WHERE rq.round_id = %s AND q.category = %s""",
                (round_id, question_result["category"]),
            )
            category_count = cur.fetchone()
            if category_count and category_count["count"] == 0:
                if question_result["category"] in round_req.categories:
                    round_req.categories.remove(question_result["category"])

    ret = await _update_deck_round(round_id, round_req)
    if ret:
        return True
    return None
