from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from psycopg.rows import class_row
from uuid import UUID

from ..db import db
from ..models import Game, GameRequest

router = APIRouter(
    prefix="/game",
    tags=["game"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_game() -> list[Game]:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Game)) as cur:
            await cur.execute('''SELECT id, deck_id, host_id, start_time, end_time FROM "Games"''')
            return await cur.fetchall()

@router.get("/{id}")
async def get_game(id: UUID) -> Game:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Game)) as cur:
            await cur.execute('''SELECT id, deck_id, host_id, start_time, end_time FROM "Games" WHERE id = %s''', (id,))
            question = await cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="Game not found")
            return question

@router.post("/")
async def create_game(game: GameRequest) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''INSERT INTO "Games" (deck_id, host_id, start_time, end_time) VALUES (%s, %s, %s, %s) RETURNING id''',
                              (game.deck_id, game.host_id, game.start_time, game.end_time))
            game_id = (await cur.fetchone()).get("id", None)
            if game_id is None:
                raise HTTPException(status_code=500, detail="Failed to create game")
            
            return JSONResponse(status_code=201, content={"id": str(game_id)})
            
@router.put("/{id}")
async def update_game(id: UUID, game: GameRequest) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''UPDATE "Games" SET deck_id = %s, host_id = %s, start_time = %s, end_time = %s WHERE id = %s''',
                              (game.deck_id, game.host_id, game.start_time, game.end_time, id))

@router.delete("/{id}")
async def delete_game(id: UUID) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''DELETE FROM "Games" WHERE id = %s''', (id,))
        