from pydantic import BaseModel
from typing import Union
from uuid import UUID

class Token(BaseModel):
    token: str
    token_type: str

class TokenData(BaseModel):
    id: Union[UUID, None] = None