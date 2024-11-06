from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from psycopg.rows import class_row
from uuid import UUID


from ..db import db
from ..models import Deck, User, UserRequest, UserResponse

router = APIRouter(
    prefix="/user",
    tags=["user"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_user() -> list[UserResponse]:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(UserResponse)) as cur:
            await cur.execute('''SELECT id, user_name FROM "Users"''')
            return await cur.fetchall()

@router.get("/{id}")
async def get_user(id: UUID) -> UserResponse:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(UserResponse)) as cur:
            await cur.execute('''SELECT id, user_name FROM "Users" WHERE id = %s''', (id,))
            question = await cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="User not found")
            return question
            
@router.put("/{id}")
async def update_user(id: UUID, user: UserRequest) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''UPDATE "Users" SET user_name = %s, hashed_password=%s WHERE id = %s''',
                              (user.user_name, user.hashed_password, id))

@router.delete("/{id}")
async def delete_user(id: UUID) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''DELETE FROM "Users" WHERE id = %s''', (id,))

@router.get("/{user_id}/deck")
async def get_user_decks(user_id: UUID) -> list[Deck]:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Deck)) as cur:
            await cur.execute('''
                              SELECT d.id, d.name, d.description FROM "Decks" as d 
                              LEFT OUTER JOIN "UserDecks" as ud ON d.id = ud.deck_id
                              WHERE ud.user_id = %s''', (user_id,))

            decks = await cur.fetchall()

            return decks

@router.post("/{user_id}/deck/{deck_id}")
async def add_user_deck(user_id: UUID, deck_id: UUID) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''INSERT INTO "UserDecks" (user_id, deck_id) VALUES (%s, %s)''',
                              (user_id, deck_id))
            return JSONResponse(status_code=201, content=None)

@router.delete("/{user_id}/deck/{deck_id}")
async def remove_user_deck(user_id: UUID, deck_id: UUID) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''DELETE FROM "UserDecks" WHERE user_id = %s AND deck_id = %s''', (user_id, deck_id))
        