from pydantic import BaseModel
from uuid import UUID

class Score(BaseModel):
    team_id: UUID
    game_id: UUID
    score: int

class ScoreRequest(BaseModel):
    score: int