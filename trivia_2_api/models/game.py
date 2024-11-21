from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

from trivia_2_api.models import question

class Game(BaseModel):
    id: UUID
    deck_id: UUID
    host_id: UUID
    join_code: str
    status: str = "open"
    current_round: int = 1
    current_question: int = 1
    start_time: datetime
    end_time: Optional[datetime] = None

class GameRequest(BaseModel):
    deck_id: UUID
    question_time_sec: Optional[int] = 20

class JoinGameRequest(BaseModel):
    join_code: str
    team_id: UUID