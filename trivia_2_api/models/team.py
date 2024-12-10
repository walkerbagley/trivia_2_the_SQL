from pydantic import BaseModel
from uuid import UUID

class Team(BaseModel):
    id: UUID
    name: str
    member_ids: list[UUID]

class TeamRequest(BaseModel):
    name: str
    member_ids: list[UUID] = []