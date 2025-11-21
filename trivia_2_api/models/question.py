from re import U
from unittest.mock import Base
from pydantic import BaseModel
from typing import Optional
from uuid import UUID


# class GameQuestion(BaseModel):
#     id: UUID
#     question: str
#     a: Optional[str]
#     b: Optional[str]
#     c: Optional[str]
#     d: Optional[str]
#     first_answer: Optional[int] = None


class Question(BaseModel):
    id: UUID
    question: str
    difficulty: int
    a: Optional[str]
    b: Optional[str]
    c: Optional[str]
    d: Optional[str]
    category: str
    review_status: Optional[int]
    created_by: Optional[UUID]
    # attributes: list[str]
    first_answer: Optional[int] = None


class QuestionRequest(BaseModel):
    question: str
    difficulty: int
    a: str
    b: str
    c: Optional[str]
    d: Optional[str]
    category: str
    attributes: list[str] = []
    review_status: Optional[int]
    created_by: Optional[UUID]
