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
    status: str
    round_number: int
    question_number: int
    question_id: Optional[UUID] = None
    team_answer: Optional[str] = None

class UserStatus(BaseModel):
    user_status: str
    game_status: Optional[GameStatus] = None    


