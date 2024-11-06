from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from psycopg.rows import class_row, dict_row
from typing import Annotated, Union
from uuid import UUID

from ..db import db
from ..models import Question, QuestionRequest

router = APIRouter(
    prefix="/question",
    tags=["question"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_questions(category: Annotated[Union[str, None], Query()] = None, attribute: Annotated[Union[list[str], None], Query()] = None, limit:int = 10) -> list[Question]:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Question)) as cur:
            query = '''SELECT id, question, difficulty, a, b, c, d, category, ARRAY(SELECT attribute FROM "QuestionAttributes" WHERE question_id = q.id) as attributes 
                            FROM "Questions" as q
                            WHERE TRUE'''
            arguments = []
            
            if category is not None:
                query += " AND category = %s"
                arguments.append(category)
            
            if attribute is not None:
                query += " AND q.id IN (SELECT question_id FROM \"QuestionAttributes\" WHERE attribute = ANY(%s))"
                arguments.append(attribute)
            
            query += " LIMIT %s"
            arguments.append(limit)

            await cur.execute(query, arguments)
            return await cur.fetchall()

@router.get("/{id}")
async def get_question(id: UUID) -> Question:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(Question)) as cur:
            await cur.execute('''
                              SELECT id, question, difficulty, a, b, c, d, category, ARRAY(SELECT attribute FROM "QuestionAttributes" WHERE question_id = q.id) as attributes 
                              FROM "Questions" as q
                              WHERE id = %s''', (id,))
            question = await cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="Question not found")
            return question

@router.post("/")
async def create_question(question: QuestionRequest) -> UUID:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute('''INSERT INTO "Questions" (question, difficulty, a, b, c, d, category) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id''',
                              (question.question, question.difficulty, question.a, question.b, question.c, question.d, question.category))
            question_id = (await cur.fetchone()).get("id", None)
            if question_id is None:
                raise HTTPException(status_code=500, detail="Failed to create question")
            
            if len(question.attributes) > 0:
                await cur.executemany('''INSERT INTO "QuestionAttributes" (question_id, attribute) VALUES (%s,%s)''', [(question_id, attribute) for attribute in question.attributes])
            
            return JSONResponse(status_code=201, content={"id": str(question_id)})
            
@router.put("/{id}")
async def update_question(id: UUID, question: QuestionRequest) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''UPDATE "Questions" SET question = %s, difficulty = %s, a = %s, b = %s, c = %s, d = %s, category = %s WHERE id = %s''',
                              (question.question, question.difficulty, question.a, question.b, question.c, question.d, question.category, id))
            
            await cur.execute('''DELETE FROM "QuestionAttributes" WHERE question_id = %s''', (id,))

            if len(question.attributes) > 0:
                await cur.executemany('''INSERT INTO "QuestionAttributes" (question_id, attribute) VALUES (%s,%s)''', [(id, attribute) for attribute in question.attributes])

@router.delete("/{id}")
async def delete_question(id: UUID) -> None:
    async with db.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute('''DELETE FROM "Questions" WHERE id = %s''', (id,))


        