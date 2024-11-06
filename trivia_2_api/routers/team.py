from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from psycopg.rows import class_row, dict_row
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
            await cur.execute('''SELECT t.id, t.name, ARRAY(SELECT user_id FROM "TeamMembers" WHERE team_id = t.id) as member_ids FROM "Teams" as t''')
            return await cur.fetchall()

@router.get("/{id}")
async def get_team(id: UUID) -> Team:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Team)) as cur:
            await cur.execute('''SELECT t.id, t.name, ARRAY(SELECT user_id FROM "TeamMembers" WHERE team_id = t.id) as member_ids FROM "Teams" as t WHERE id = %s''', (id,))
            question = await cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="Team not found")
            return question

@router.post("/")
async def create_team(team: TeamRequest) -> None:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute('''INSERT INTO "Teams" (name) VALUES (%s) RETURNING id''',
                              (team.name,))
            team_id = (await cur.fetchone()).get("id", None)
            if team_id is None:
                raise HTTPException(status_code=500, detail="Failed to create team")
            
            await cur.executemany('''INSERT INTO "TeamMembers" (team_id, user_id) VALUES (%s, %s)''', ((team_id, user_id) for user_id in team.member_ids))

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


@router.post("/{team_id}/member/{user_id}")
async def add_member(team_id: UUID, user_id: UUID) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''INSERT INTO "TeamMembers" (team_id, user_id) VALUES (%s, %s)''',
                              (team_id, user_id))
            return JSONResponse(status_code=201, content=None)

@router.delete("/{team_id}/member/{user_id}")
async def remove_member(team_id: UUID, user_id: UUID) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''DELETE FROM "TeamMembers" WHERE team_id = %s AND user_id = %s''', (team_id, user_id))
        