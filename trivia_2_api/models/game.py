from datetime import datetime
from shlex import join
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class Game(BaseModel):
    id: UUID
    deck_id: UUID
    host_id: UUID
    join_code: str
    start_time: datetime
    end_time: Optional[datetime] = None

class GameRequest(BaseModel):
    deck_id: UUID
    start_time: datetime