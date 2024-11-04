from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from psycopg.rows import class_row
from uuid import UUID

from ..db import db
from ..models import Team, TeamRequest

router = APIRouter(
    prefix="/team",
    tags=["team"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_team() -> list[Team]:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Team)) as cur:
            await cur.execute('''SELECT id, name FROM "Teams"''')
            return await cur.fetchall()

@router.get("/{id}")
async def get_team(id: UUID) -> Team:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Team)) as cur:
            await cur.execute('''SELECT id, name FROM "Teams" WHERE id = %s''', (id,))
            question = await cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="Team not found")
            return question

@router.post("/")
async def create_team(team: TeamRequest) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''INSERT INTO "Teams" (name) VALUES (%s) RETURNING id''',
                              (team.name,))
            team_id = (await cur.fetchone()).get("id", None)
            if team_id is None:
                raise HTTPException(status_code=500, detail="Failed to create team")

            return JSONResponse(status_code=201, content={"id": str(team_id)}) 
            
@router.put("/{id}")
async def update_team(id: UUID, team: TeamRequest) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''UPDATE "Teams" SET name = %s WHERE id = %s''',
                              (team.name, id))

@router.delete("/{id}")
async def delete_team(id: UUID) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''DELETE FROM "Teams" WHERE id = %s''', (id,))
        