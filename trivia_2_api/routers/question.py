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
async def get_questions(category: Annotated[Union[list[str], None], Query()] = None, attribute: Annotated[Union[list[str], None], Query()] = None, limit:int = 10) -> list[Question]:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Question)) as cur:
            query = '''with answers as (select id as question_id, ARRAY[a,b,c,d] as answer_arr from "Questions")

                            SELECT q.id, question, difficulty, 
                            a.answer_arr[shuffle_answer_index(1, q.first_answer::int)] as a,
                            a.answer_arr[shuffle_answer_index(2, q.first_answer::int)] as b,
                            a.answer_arr[shuffle_answer_index(3, q.first_answer::int)] as c,
                            a.answer_arr[shuffle_answer_index(4, q.first_answer::int)] as d,
                            category, ARRAY(SELECT attribute FROM "QuestionAttributes" WHERE question_id = q.id) as attributes 
                            FROM "Questions" as q
                            INNER JOIN answers as a ON a.question_id = q.id
                            WHERE TRUE '''
            arguments = []
            
            if category is not None:
                query += " AND category = ANY(%s)"
                arguments.append(category)
            
            if attribute is not None:
                query += " AND q.id IN (SELECT question_id FROM \"QuestionAttributes\" WHERE attribute = ANY(%s))"
                arguments.append(attribute)
            
            query += " LIMIT %s"
            arguments.append(limit)

            cur.execute(query, arguments)
            return cur.fetchall()

@router.get("/{id}")
async def get_question(id: UUID) -> Question:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Question)) as cur:
            cur.execute('''
                            with answers as (select id as question_id, ARRAY[a,b,c,d] as answer_arr from "Questions" where id = %s)

                            SELECT q.id, question, difficulty, 
                            a.answer_arr[shuffle_answer_index(1, q.first_answer::int)] as a,
                            a.answer_arr[shuffle_answer_index(2, q.first_answer::int)] as b,
                            a.answer_arr[shuffle_answer_index(3, q.first_answer::int)] as c,
                            a.answer_arr[shuffle_answer_index(4, q.first_answer::int)] as d,
                            category, ARRAY(SELECT attribute FROM "QuestionAttributes" WHERE question_id = q.id) as attributes 
                            FROM "Questions" as q
                            INNER JOIN answers as a ON a.question_id = q.id
                            WHERE q.id = %s ''', (id, id))
            question = cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="Question not found")
            return question

@router.post("/")
async def create_question(question: QuestionRequest) -> UUID:
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute('''INSERT INTO "Questions" (question, difficulty, a, b, c, d, category) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id''',
                              (question.question, question.difficulty, question.a, question.b, question.c, question.d, question.category))
            question_id = (cur.fetchone()).get("id", None)
            if question_id is None:
                raise HTTPException(status_code=500, detail="Failed to create question")
            
            if len(question.attributes) > 0:
                cur.executemany('''INSERT INTO "QuestionAttributes" (question_id, attribute) VALUES (%s,%s)''', [(question_id, attribute) for attribute in question.attributes])
            
            return JSONResponse(status_code=201, content={"id": str(question_id)})
            
@router.put("/{id}")
async def update_question(id: UUID, question: QuestionRequest) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''UPDATE "Questions" SET question = %s, difficulty = %s, a = %s, b = %s, c = %s, d = %s, category = %s WHERE id = %s''',
                              (question.question, question.difficulty, question.a, question.b, question.c, question.d, question.category, id))
            
            cur.execute('''DELETE FROM "QuestionAttributes" WHERE question_id = %s''', (id,))

            if len(question.attributes) > 0:
                cur.executemany('''INSERT INTO "QuestionAttributes" (question_id, attribute) VALUES (%s,%s)''', [(id, attribute) for attribute in question.attributes])

@router.delete("/{id}")
async def delete_question(id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''DELETE FROM "Questions" WHERE id = %s''', (id,))


        