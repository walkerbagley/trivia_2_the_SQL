from fastapi import APIRouter, HTTPException
from psycopg.rows import class_row
from uuid import UUID

from trivia_2_fast_api.models.question import QuestionRequest

from ..db import db
from ..models import Question

router = APIRouter(
    prefix="/question",
    tags=["question"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_questions() -> list[Question]:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Question)) as cur:
            await cur.execute('''SELECT id, question, difficulty, a, b, c, d, category FROM "Questions"''')
            return await cur.fetchall()

@router.get("/{id}")
async def get_question(id: UUID) -> Question:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Question)) as cur:
            await cur.execute('''SELECT id, question, difficulty, a, b, c, d, category FROM "Questions" WHERE id = %s''', (id,))
            question = await cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="Question not found")
            return question

@router.post("/")
async def create_question(question: QuestionRequest) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''INSERT INTO "Questions" (question, difficulty, a, b, c, d, category) VALUES (%s, %s, %s, %s, %s, %s, %s)''',
                              (question.question, question.difficulty, question.a, question.b, question.c, question.d, question.category))
            
@router.put("/{id}")
async def update_question(id: UUID, question: QuestionRequest) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''UPDATE "Questions" SET question = %s, difficulty = %s, a = %s, b = %s, c = %s, d = %s, category = %s WHERE id = %s''',
                              (question.question, question.difficulty, question.a, question.b, question.c, question.d, question.category, id))

@router.delete("/{id}")
async def delete_question(id: UUID) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''DELETE FROM "Questions" WHERE id = %s''', (id,))
        