from pydantic import BaseModel
from uuid import UUID

class HostDeck(BaseModel):
    host: UUID
    deck: UUID