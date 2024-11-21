from shlex import join
import string

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from psycopg.rows import class_row, dict_row
from random import choices
from uuid import UUID

from ..db import db
from ..models import Game, GameRequest, JoinGameRequest

router = APIRouter(
    prefix="/game",
    tags=["game"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_game() -> list[Game]:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Game)) as cur:
            cur.execute('''SELECT id, deck_id, host_id, join_code, status, current_round, current_question, start_time, end_time FROM "Games"''')
            return cur.fetchall()

@router.get("/{id}")
async def get_game(id: UUID) -> Game:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Game)) as cur:
            cur.execute('''SELECT id, deck_id, host_id, join_code, status, current_round, current_question, start_time, end_time FROM "Games" WHERE id = %s''', (id,))
            question = cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="Game not found")
            return question

@router.post("/")
async def create_game(request: Request, game: GameRequest) -> None:
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            join_code = ''.join(choices(string.ascii_uppercase + string.digits, k=6))
            cur.execute('''INSERT INTO "Games" (deck_id, host_id, start_time, join_code) VALUES (%s, %s, %s, %s) RETURNING id''',
                              (game.deck_id, request.state.user.id, game.start_time, join_code))
            game_id = (cur.fetchone()).get("id", None)
            if game_id is None:
                raise HTTPException(status_code=500, detail="Failed to create game")
            
            return JSONResponse(status_code=201, content={"id": str(game_id)})

@router.post("/{game_id}/join")
async def join_game(request:Request, game: JoinGameRequest, game_id:UUID) -> None:
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute('''SELECT id, status, join_code FROM "Games" WHERE id = %s''', (game_id, ))

            results = cur.fetchone()
            if results is None:
                raise HTTPException(status_code=404, detail="Game not found")
            
            if results.get("status", None) != "open":
                raise HTTPException(status_code=400, detail="Game is not open")
            
            if game.join_code != results.get("join_code", None):
                raise HTTPException(status_code=400, detail="Invalid join code")
            
            cur.execute('''INSERT INTO "GamePlayers" (game_id, player_id, team_id) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING''', (results.get("id", None), request.state.user.id, game.team_id))
            


@router.post("/{game_id}/start")
async def start_game(game_id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''UPDATE "Games" SET status = 'started' WHERE id = %s''', (game_id,))

@router.delete("/{id}")
async def delete_game(id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''DELETE FROM "Games" WHERE id = %s''', (id,))
        