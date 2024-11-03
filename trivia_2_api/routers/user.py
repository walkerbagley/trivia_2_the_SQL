from fastapi import APIRouter, HTTPException
from psycopg.rows import class_row
from uuid import UUID

from trivia_2_fast_api.models.user import UserRequest

from ..db import db
from ..models import User

router = APIRouter(
    prefix="/user",
    tags=["user"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_user() -> list[User]:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(User)) as cur:
            await cur.execute('''SELECT id, user_name, hashed_password FROM "Users"''')
            return await cur.fetchall()

@router.get("/{id}")
async def get_user(id: UUID) -> User:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(User)) as cur:
            await cur.execute('''SELECT id, user_name, hashed_password FROM "Users" WHERE id = %s''', (id,))
            question = await cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="User not found")
            return question

@router.post("/")
async def create_user(user: UserRequest) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''INSERT INTO "Users" (user_name, hashed_password) VALUES (%s, %s)''',
                              (user.user_name, user.hashed_password))
            
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
        