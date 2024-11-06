from pydantic import BaseModel, Field
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
