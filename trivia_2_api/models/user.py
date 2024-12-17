from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class User(BaseModel):
    id: UUID
    user_name: str
    hashed_password: str

class UserRequest(BaseModel):
    user_name: str
    hashed_password: str

class UserResponse(BaseModel):
    id: UUID
    user_name: str

class GameStatus(BaseModel):
    id: UUID
    status: str
    round_number: int
    question_number: int
    question_id: Optional[UUID] = None
    team_answer: Optional[str] = None
    time_remaining: Optional[int] = None

class UserStatus(BaseModel):
    user_status: str
    game_status: Optional[GameStatus] = None    


class UserGameScores(BaseModel):
    game_id: UUID
    team_name: str
    date: datetime
    score: Optional[int] = None
    percentage: Optional[float] = None

