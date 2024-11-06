from pydantic import BaseModel
from typing import Union

class Token(BaseModel):
    token: str
    token_type: str

class TokenData(BaseModel):
    username: Union[str, None] = None