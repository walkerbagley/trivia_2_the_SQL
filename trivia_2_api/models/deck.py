from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class Deck(BaseModel):
    id: UUID
    name: str
    description: str

class DeckRequest(BaseModel):
    name: str
    description: str