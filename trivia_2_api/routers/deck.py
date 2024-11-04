from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from psycopg.rows import class_row
from uuid import UUID

from ..db import db
from ..models import Deck, DeckRequest

router = APIRouter(
    prefix="/deck",
    tags=["deck"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_deck() -> list[Deck]:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Deck)) as cur:
            await cur.execute('''SELECT id, name, description FROM "Decks"''')
            return await cur.fetchall()

@router.get("/{id}")
async def get_deck(id: UUID) -> Deck:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Deck)) as cur:
            await cur.execute('''SELECT id, name, description FROM "Decks" WHERE id = %s''', (id,))
            question = await cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="Deck not found")
            return question

@router.post("/")
async def create_deck(deck: DeckRequest) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''INSERT INTO "Decks" (name, description) VALUES (%s, %s) RETURNING id''',
                              (deck.name, deck.description))
            deck_id = (await cur.fetchone()).get("id", None)
            if deck_id is None:
                raise HTTPException(status_code=500, detail="Failed to create deck")
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
        