from pydantic import BaseModel
from uuid import UUID

class TeamMember(BaseModel):
    team: UUID
    user: UUID