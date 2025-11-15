from pydantic import BaseModel
from typing import Optional
from uuid import UUID

from .question import Question


class Deck(BaseModel):
    id: UUID
    name: str
    description: str
    owner_id: UUID
    rounds: int


class Round(BaseModel):
    id: UUID
    round_number: int
    num_questions: int
    categories: list[str] | None
    attributes: list[str] | None


class DeckRoundRequest(BaseModel):
    categories: Optional[list[str]] = None
    attributes: Optional[list[str]] = None
    num_questions: Optional[int] = 10


class DeckRequest(BaseModel):
    name: str
    description: str
    rounds: list[DeckRoundRequest]


class DeckUpdateRequest(BaseModel):
    name: str
    description: str


class DeckQuestion(Question):
    round_number: int
    question_number: int
