from pydantic import BaseModel
from typing import Optional
from uuid import UUID

from trivia_2_api.models.question import Question

class Deck(BaseModel):
    id: UUID
    name: str
    description: str
    owner_id: UUID

class DeckRoundRequest(BaseModel):
    categories: Optional[list[str]] = None
    attributes: Optional[list[str]] = None
    num_questions: Optional[int] = 10


class DeckRequest(BaseModel):
    name: str
    description: str
    rounds: list[DeckRoundRequest]

class DeckQuestion(Question):
    round: int
    question_number: int