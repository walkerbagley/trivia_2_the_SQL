from fastapi import APIRouter, HTTPException, Request, Query
from fastapi.responses import JSONResponse
from psycopg.rows import class_row, dict_row
from typing import Annotated, Union
from uuid import UUID

from trivia_2_api.models.deck import DeckUpdateRequest

from ..db import db
from ..models import Deck, DeckRequest, DeckRoundRequest, DeckQuestion

router = APIRouter(
    prefix="/deck",
    tags=["deck"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_deck() -> list[Deck]:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Deck)) as cur:
            cur.execute('''SELECT d.id, d.name, d.description, d.owner_id, count(distinct dq.round) as rounds
                            FROM "Decks" as d
                            LEFT OUTER JOIN "DeckQuestions" as dq ON d.id = dq.deck_id
                            GROUP BY d.id''')
            return cur.fetchall()

@router.get("/{id}")
async def get_deck(id: UUID) -> Deck:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Deck)) as cur:
            cur.execute('''SELECT d.id, d.name, d.description, d.owner_id, count(distinct dq.round) as rounds
                            FROM "Decks" as d
                            LEFT OUTER JOIN "DeckQuestions" as dq ON d.id = dq.deck_id
                            WHERE d.id = %s
                            GROUP BY d.id''', (id,))
            question = cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="Deck not found")
            return question

@router.post("/")
async def create_deck(request:Request, deck: DeckRequest) -> None:
    if request.state.user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute('''INSERT INTO "Decks" (name, description, owner_id) VALUES (%s, %s, %s) RETURNING id''',
                              (deck.name, deck.description, request.state.user.id))
            deck_id = (cur.fetchone()).get("id", None)
            if deck_id is None:
                raise HTTPException(status_code=500, detail="Failed to create deck")

    for round in deck.rounds:
        add_round(deck_id, round)
    
        
    return JSONResponse(status_code=201, content={"id": str(deck_id)})

def add_round(deck_id: UUID, round: DeckRoundRequest) -> None:
    print("ADDING ROUND", round)
    with db.connection() as conn:
        with conn.cursor() as cur:
            query = '''INSERT INTO "DeckQuestions"(deck_id, question_id, round, question_number) 
                            SELECT q.*, ROW_NUMBER() OVER() as question_number FROM 
                            (SELECT %s::uuid, q.id, 
                            (SELECT COALESCE(max(dq.round), 0) + 1 FROM "DeckQuestions" as dq WHERE dq.deck_id = %s) as round
                            FROM "Questions" as q
                            WHERE NOT q.id = ANY(SELECT question_id FROM "DeckQuestions" WHERE deck_id = %s)'''
            arguments = [deck_id, deck_id, deck_id]
            
            if round.categories is not None:
                query += " AND category = ANY(%s)"
                arguments.append(round.categories)
            
            if round.attributes is not None:
                query += ''' AND q.id IN (SELECT question_id FROM "QuestionAttributes" WHERE attribute = ANY(%s))'''
                arguments.append(round.attributes)
            
            query += " ORDER BY RANDOM()"

            query += " LIMIT %s"
            arguments.append(round.num_questions)

            query += ") as q"

            cur.execute(query, arguments)
            return None
        
@router.put("/{id}")
async def update_deck(id: UUID, deck: DeckUpdateRequest) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''UPDATE "Decks" SET name = %s, description = %s WHERE id = %s''',
                              (deck.name, deck.description, id))

@router.delete("/{id}")
async def delete_deck(id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''DELETE FROM "Decks" WHERE id = %s''', (id,))

@router.get("/{deck_id}/question")
async def get_deck_questions(deck_id: UUID, round: Annotated[Union[int, None], Query()] = None) -> list[DeckQuestion]:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(DeckQuestion)) as cur:
            query = '''SELECT q.id, q.question, q.difficulty, q.a, q.b, q.c, q.d, q.category, ARRAY(SELECT attribute FROM "QuestionAttributes" WHERE question_id = q.id) as attributes,
                        dq.round, dq.question_number
                        FROM "DeckQuestions" as dq 
                        LEFT OUTER JOIN "Questions" as q 
                        ON dq.question_id = q.id
                        WHERE dq.deck_id = %s
                        '''
            params = [deck_id]
            
            if round is not None:
                query += " AND dq.round = %s"
                params.append(round)
            
            query += " ORDER BY dq.round, dq.question_number"
            cur.execute(query, params)
            return cur.fetchall()

@router.delete("/{deck_id}/round/{round_number}")
async def delete_deck_round(deck_id: UUID, round_number: int) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''DELETE FROM "DeckQuestions" WHERE deck_id = %s AND round = %s''', (deck_id, round_number))

            cur.execute('''UPDATE "DeckQuestions" SET round = round - 1 WHERE deck_id = %s AND round > %s''', (deck_id, round_number))
        