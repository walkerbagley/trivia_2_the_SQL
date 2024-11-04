from fastapi import APIRouter, HTTPException
from psycopg.rows import class_row
from uuid import UUID

from ..db import db
from ..models import Host, HostRequest

router = APIRouter(
    prefix="/host",
    tags=["host"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_host() -> list[Host]:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Host)) as cur:
            await cur.execute('''SELECT id, host_name, hashed_password FROM "Hosts"''')
            return await cur.fetchall()

@router.get("/{id}")
async def get_host(id: UUID) -> Host:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Host)) as cur:
            await cur.execute('''SELECT id, host_name, hashed_password FROM "Hosts" WHERE id = %s''', (id,))
            question = await cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="Host not found")
            return question

@router.post("/")
async def create_host(host: HostRequest) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''INSERT INTO "Hosts" (host_name, hashed_password) VALUES (%s, %s)''',
                              (host.host_name, host.hashed_password))
            
@router.put("/{id}")
async def update_host(id: UUID, host: HostRequest) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''UPDATE "Hosts" SET host_name = %s, hashed_password = %s WHERE id = %s''',
                              (host.host_name, host.hashed_password, id))

@router.delete("/{id}")
async def delete_host(id: UUID) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''DELETE FROM "Hosts" WHERE id = %s''', (id,))
        