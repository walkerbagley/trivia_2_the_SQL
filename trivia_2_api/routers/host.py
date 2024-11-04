from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from psycopg.rows import class_row
from uuid import UUID

from ..db import db
from ..models import Host, HostRequest, Deck

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
            await cur.execute('''INSERT INTO "Hosts" (host_name, hashed_password) VALUES (%s, %s) RETURNING id''',
                              (host.host_name, host.hashed_password))
            host_id = (await cur.fetchone()).get("id", None)

            if host_id is None:
                raise HTTPException(status_code=500, detail="Failed to create host")
            
            return JSONResponse(status_code=201, content={"id": str(host_id)})
            
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

@router.get("/{host_id}/deck")
async def get_host_decks(host_id: UUID) -> list[Deck]:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Deck)) as cur:
            await cur.execute('''
                              SELECT d.id, d.name, d.description FROM "Decks" as d 
                              LEFT OUTER JOIN "HostDecks" as hd ON d.id = hd.deck_id
                              WHERE hd.host_id = %s''', (host_id,))

            decks = await cur.fetchall()

            return decks

@router.post("/{host_id}/deck/{deck_id}")
async def add_host_deck(host_id: UUID, deck_id: UUID) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''INSERT INTO "HostDecks" (host_id, deck_id) VALUES (%s, %s)''',
                              (host_id, deck_id))
            return JSONResponse(status_code=201, content=None)

@router.delete("/{host_id}/deck/{deck_id}")
async def remove_host_deck(host_id: UUID, deck_id: UUID) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''DELETE FROM "HostDecks" WHERE host_id = %s AND deck_id = %s''', (host_id, deck_id))
