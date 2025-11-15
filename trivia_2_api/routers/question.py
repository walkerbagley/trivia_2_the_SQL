from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from psycopg.rows import class_row, dict_row
from typing import Annotated, Optional, Union
from uuid import UUID

from ..db import db
from ..models import Question, QuestionRequest

router = APIRouter(
    prefix="/question",
    tags=["question"],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
async def get_questions(
    category: Annotated[Union[list[str], None], Query()] = None,
    attribute: Annotated[Union[list[str], None], Query()] = None,
    limit: int = 10,
) -> list[Question]:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Question)) as cur:
            query = """with answers as (select id as question_id, ARRAY[a,b,c,d] as answer_arr from "Questions")

                            SELECT q.id, question, difficulty, q.a,q.b,q.c,q.d,
                            category, ARRAY(SELECT attribute FROM "QuestionAttributes" WHERE question_id = q.id) as attributes 
                            FROM "Questions" as q
                            INNER JOIN answers as a ON a.question_id = q.id
                            WHERE TRUE """
            arguments = []

            if category is not None:
                query += " AND category = ANY(%s)"
                arguments.append(category)

            if attribute is not None:
                query += ' AND q.id IN (SELECT question_id FROM "QuestionAttributes" WHERE attribute = ANY(%s))'
                arguments.append(attribute)

            query += " LIMIT %s"
            arguments.append(limit)

            cur.execute(query, arguments)
            return cur.fetchall()


@router.get("/{id}")
async def get_question(id: UUID) -> Question:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Question)) as cur:
            cur.execute(
                """
                            with answers as (select id as question_id, ARRAY[a,b,c,d] as answer_arr from "Questions" where id = %s)

                            SELECT q.id, question, difficulty, q.a,q.b,q.c,q.d,
                            category, ARRAY(SELECT attribute FROM "QuestionAttributes" WHERE question_id = q.id) as attributes 
                            FROM "Questions" as q
                            INNER JOIN answers as a ON a.question_id = q.id
                            WHERE q.id = %s """,
                (id, id),
            )
            question = cur.fetchone()
            if question is None:
                raise HTTPException(status_code=404, detail="Question not found")
            return question


@router.post("/")
async def create_question(question: QuestionRequest) -> UUID:
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """INSERT INTO "Questions" (question, difficulty, a, b, c, d, category) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                (
                    question.question,
                    question.difficulty,
                    question.a,
                    question.b,
                    question.c,
                    question.d,
                    question.category,
                ),
            )
            question_id = (cur.fetchone()).get("id", None)
            if question_id is None:
                raise HTTPException(status_code=500, detail="Failed to create question")

            if len(question.attributes) > 0:
                cur.executemany(
                    """INSERT INTO "QuestionAttributes" (question_id, attribute) VALUES (%s,%s)""",
                    [(question_id, attribute) for attribute in question.attributes],
                )

            return JSONResponse(status_code=201, content={"id": str(question_id)})


@router.put("/{id}")
async def update_question(id: UUID, question: QuestionRequest) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """UPDATE "Questions" SET question = %s, difficulty = %s, a = %s, b = %s, c = %s, d = %s, category = %s WHERE id = %s""",
                (
                    question.question,
                    question.difficulty,
                    question.a,
                    question.b,
                    question.c,
                    question.d,
                    question.category,
                    id,
                ),
            )

            cur.execute(
                """DELETE FROM "QuestionAttributes" WHERE question_id = %s""", (id,)
            )

            if len(question.attributes) > 0:
                cur.executemany(
                    """INSERT INTO "QuestionAttributes" (question_id, attribute) VALUES (%s,%s)""",
                    [(id, attribute) for attribute in question.attributes],
                )


@router.delete("/{id}")
async def delete_question(id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""DELETE FROM "Questions" WHERE id = %s""", (id,))


@router.get("/categories/")
async def get_categories() -> list[str]:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT DISTINCT category FROM "Questions" ORDER BY category"""
            )
            categories = [row[0] for row in cur.fetchall()]
            return categories


@router.get("/new/")
async def roll_question(
    category: Optional[str] = None, difficulty: Optional[int] = None
) -> Question:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Question)) as cur:
            query = """SELECT q.id, q.question, q.difficulty, q.a, q.b, q.c, q.d, q.category
                        FROM "Questions" as q
                        WHERE 1=1
                        """
            params = []

            if category is not None:
                query += " AND q.category = %s"
                params.append(category)

            if difficulty and difficulty > 0 and difficulty < 4:
                query += " AND q.difficulty = %s"
                params.append(difficulty)

            query += " ORDER BY RANDOM() LIMIT 1"
            cur.execute(query, params)
            question = cur.fetchone()
            if question is None:
                raise HTTPException(
                    status_code=404, detail="No question found matching criteria"
                )
            return question
