import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from psycopg.rows import class_row
from typing import Annotated


from ..db import db
from ..models import AuthUser, RegisterRequest, RegisterResponse, Token
from ..utils.hash import hash_password, verify_password
from ..utils.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)

@router.post("/register")
async def register(user: RegisterRequest) -> None:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(RegisterResponse)) as cur:
            await cur.execute('''SELECT id, user_name, hashed_password FROM "Users" WHERE user_name = %s''', (user.username,))
            user = await cur.fetchone()
            if user is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username already exists",
                )
            
            await cur.execute('''INSERT INTO "Users" (user_name, hashed_password) VALUES (%s, %s) RETURNING id''',
                              (user.username, hash_password(user.password)))
            return await cur.fetchone()

@router.post("/login")
async def login_for_access_token(
    request: RegisterRequest,
) -> Token:
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(AuthUser)) as cur:
            await cur.execute('''SELECT id, user_name, hashed_password FROM "Users" WHERE user_name = %s''', (request.username,))
            user = await cur.fetchone() 
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )  
            elif not verify_password(request.password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )   
   
            access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": str(user.id)}, expires_delta=access_token_expires
            )
            return Token(token=access_token, token_type="bearer")

