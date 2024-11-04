from pydantic import BaseModel
from uuid import UUID

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    id: UUID

class RegisterRequest(BaseModel):
    username: str
    password: str

class RegisterResponse(BaseModel):
    id: UUID

class AuthUser(BaseModel):
    id: UUID
    user_name: str
    hashed_password: str