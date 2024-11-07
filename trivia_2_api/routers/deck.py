from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from psycopg.rows import class_row, dict_row
from uuid import UUID

from trivia_2_api.routers.question import get_questions

from ..db import db
from ..models import Deck, DeckRequest, Question

router = APIRouter(
    prefix="/deck",
    tags=["deck"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_deck() -> list[Deck]:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Deck)) as cur:
            await cur.execute('''SELECT id, name, description, owner_id FROM "Decks"''')
            return await cur.fetchall()

@router.get("/{id}")
async def get_deck(id: UUID) -> Deck:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Deck)) as cur:
            await cur.execute('''SELECT id, name, description, owner_id FROM "Decks" WHERE id = %s''', (id,))
            question = await cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="Deck not found")
            return question

@router.post("/")
async def create_deck(request:Request, deck: DeckRequest) -> None:
    user = dict(request.scope["headers"]).get(b"X-Authenticated-User", None)
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    async with db.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute('''INSERT INTO "Decks" (name, description, owner_id) VALUES (%s, %s, %s) RETURNING id''',
                              (deck.name, deck.description, UUID(user.decode('utf-8'))))
            deck_id = (await cur.fetchone()).get("id", None)
            if deck_id is None:
                raise HTTPException(status_code=500, detail="Failed to create deck")
            
            questions = await get_questions(category=deck.category, limit=deck.num_questions)

            await cur.executemany('''INSERT INTO "DeckQuestions" (deck_id, question_id) VALUES (%s, %s)''', [(deck_id, q.id) for q in questions])
            
            return JSONResponse(status_code=201, content={"id": str(deck_id)})
            
@router.put("/{id}")
async def update_deck(id: UUID, deck: DeckRequest) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''UPDATE "Decks" SET name = %s, description = %s WHERE id = %s''',
                              (deck.name, deck.description, id))

@router.delete("/{id}")
async def delete_deck(id: UUID) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''DELETE FROM "Decks" WHERE id = %s''', (id,))

@router.get("/{deck_id}/question")
async def get_deck_questions(deck_id: UUID) -> list[Question]:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Question)) as cur:
            await cur.execute('''
                              SELECT q.id, q.question, q.difficulty, q.a, q.b, q.c, q.d, q.category, ARRAY(SELECT attribute FROM "QuestionAttributes" WHERE question_id = q.id) as attributes
                              FROM "DeckQuestions" as dq 
                              LEFT OUTER JOIN "Questions" as q 
                              ON dq.question_id = q.id
                              WHERE dq.deck_id = %s''', (deck_id,))
            return await cur.fetchall()

@router.post("/{deck_id}/question/{question_id}")
async def add_question(deck_id: UUID, question_id: UUID) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''INSERT INTO "DeckQuestions" (deck_id, question_id) VALUES (%s, %s)''',
                              (deck_id, question_id))
            return JSONResponse(status_code=201, content=None)

@router.delete("/{deck_id}/question/{question_id}")
async def remove_question(deck_id: UUID, question_id: UUID) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''DELETE FROM "DeckQuestions" WHERE deck_id = %s AND question_id = %s''', (deck_id, question_id))
        