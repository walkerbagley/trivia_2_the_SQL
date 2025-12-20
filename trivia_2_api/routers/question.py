from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from psycopg.rows import class_row, dict_row
from typing import Annotated, Optional, Union
from uuid import UUID

from ..db import db
from ..models import Question, QuestionRequest, CreateQuestionRequest
import random

router = APIRouter(
    prefix="/question",
    tags=["question"],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
async def get_questions(
    include_user_created: bool = False,
    category: Annotated[Union[list[str], None], Query()] = None,
    attribute: Annotated[Union[list[str], None], Query()] = None,
    difficulty: Annotated[Union[list[int], None], Query()] = None,
    review_status: Annotated[Union[list[str], None], Query()] = None,
    page_size: int = Query(10, ge=1, le=100, alias="page_size"),
    page_num: int = Query(1, ge=1, alias="page_num"),
) -> list[Question]:
    offset = (page_num - 1) * page_size

    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Question)) as cur:
            query = """SELECT q.id, question, difficulty, q.a, q.b, q.c, q.d,
                            category, created_by, review_status,
                            ARRAY(SELECT attribute FROM "QuestionAttributes" WHERE question_id = q.id) as attributes 
                            FROM "Questions" as q
                            WHERE 1=1"""
            arguments = []

            if not include_user_created:
                query += " AND created_by IS NULL"

            if category is not None:
                query += " AND category = ANY(%s)"
                arguments.append(category)

            if attribute is not None:
                query += ' AND q.id IN (SELECT question_id FROM "QuestionAttributes" WHERE attribute = ANY(%s))'
                arguments.append(attribute)

            if difficulty is not None:
                query += " AND difficulty = ANY(%s)"
                arguments.append(difficulty)

            if review_status is not None:
                query += " AND review_status = ANY(%s)"
                arguments.append(review_status)

            query += " LIMIT %s OFFSET %s"
            arguments.extend([page_size, offset])

            cur.execute(query, arguments)
            return cur.fetchall()


@router.get("/my/{user_id}")
async def get_my_questions(user_id: UUID) -> list[Question]:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Question)) as cur:
            cur.execute(
                """SELECT q.id, question, difficulty, q.a, q.b, q.c, q.d,
                            category, created_by, review_status, first_answer,
                            ARRAY(SELECT attribute FROM "QuestionAttributes" WHERE question_id = q.id) as attributes 
                            FROM "Questions" as q
                            WHERE created_by = %s
                            ORDER BY q.id DESC""",
                (user_id,),
            )
            return cur.fetchall()


@router.get("/{id}")
async def get_question(id: UUID) -> Question:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Question)) as cur:
            cur.execute(
                """
                            with answers as (select id as question_id, ARRAY[a,b,c,d] as answer_arr from "Questions" where id = %s)

                            SELECT q.id, question, difficulty, q.a,q.b,q.c,q.d,
                            category, review_status, created_by, ARRAY(SELECT attribute FROM "QuestionAttributes" WHERE question_id = q.id) as attributes 
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
async def create_question(question: CreateQuestionRequest) -> UUID:
    if len(question.distractors) != 3:
        raise HTTPException(
            status_code=400, detail="Exactly 3 distractors are required"
        )

    if not question.category:
        question.category = "general"
    question.category = question.category.lower()

    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """INSERT INTO "Questions" (question, difficulty, a, b, c, d, category, first_answer, is_private, created_by) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                (
                    question.question,
                    question.difficulty,
                    question.correct_answer,
                    question.distractors[0],
                    question.distractors[1],
                    question.distractors[2],
                    question.category,
                    1,
                    question.is_private,
                    question.created_by,
                ),
            )
            question_id = (cur.fetchone()).get("id", None)
            if question_id is None:
                raise HTTPException(status_code=500, detail="Failed to create question")

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


# TODO: ensure the question does not already exist in the user's deck
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
