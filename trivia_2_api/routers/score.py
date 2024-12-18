from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from psycopg.rows import class_row
from uuid import UUID

from ..db import db
from ..models import Score, ScoreRequest

router = APIRouter(
    prefix="/score",
    tags=["score"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_score() -> list[Score]:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Score)) as cur:
            cur.execute('''SELECT team_id, game_id, score FROM "Scores"''')
            return cur.fetchall()

@router.get("/{game_id}/{team_id}")
async def get_score(game_id: UUID, team_id:UUID) -> Score:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Score)) as cur:
            cur.execute('''SELECT team_id, game_id, score FROM "Scores" WHERE team_id = %s and game_id = %s''', (team_id, game_id,))
            question = cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="Score not found")
            return question

@router.post("/")
async def create_score(score: Score) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''INSERT INTO "Scores" (team_id, game_id, score) VALUES (%s, %s, %s)''',
                              (score.team_id, score.game_id, score.score))
            
            return JSONResponse(status_code=201)
            
@router.put("/{game_id}/{team_id}")
async def update_score(game_id: UUID, team_id:UUID, score: ScoreRequest) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''UPDATE "Scores" SET score = %s WHERE team_id = %s and game_id = %s''',
                              (score.score, team_id, game_id))

@router.delete("/{game_id}/{team_id}")
async def delete_score(game_id: UUID, team_id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''DELETE FROM "Scores" WHERE team_id = %s and game_id = %s''', (team_id, game_id))
        