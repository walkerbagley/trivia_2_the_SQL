from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class Deck(BaseModel):
    id: UUID
    name: str
    description: str
    owner_id: UUID

class DeckRequest(BaseModel):
    name: str
    description: str
    category: Optional[str] = None
    num_questions: Optional[int] = 10