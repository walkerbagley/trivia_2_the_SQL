from pydantic import BaseModel
from uuid import UUID

class DeckQuestion(BaseModel):
    deck: UUID
    question: UUID