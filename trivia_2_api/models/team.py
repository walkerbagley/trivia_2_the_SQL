from pydantic import BaseModel
from uuid import UUID

class Team(BaseModel):
    id: UUID
    name: str

class TeamRequest(BaseModel):
    name: str