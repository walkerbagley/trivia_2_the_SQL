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
    user_name: str


class AuthUser(BaseModel):
    id: UUID
    user_name: str
    hashed_password: str


# Realtime
class DualTokenResponse(BaseModel):
    fastapi_token: str
    supabase_token: str
    refresh_token: str  # For refreshing Supabase token
    id: UUID
    token_type: str = "bearer"
