import datetime
from fastapi import APIRouter, HTTPException, status
from psycopg.rows import class_row, dict_row

from ..db import db
from ..models import AuthUser, LoginResponse, RegisterRequest, RegisterResponse, Token
from ..utils.hash import hash_password, verify_password
from ..utils.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)

@router.post("/register")
async def register(request: RegisterRequest) -> None:
    print('request', request)
    with db.connection() as conn:
            with conn.cursor(row_factory=class_row(RegisterResponse)) as cur:
                cur.execute('''SELECT id, user_name FROM "Users" WHERE user_name = %s''', (request.username,))
                user = cur.fetchone()
                print('user in func ', user)
                if user is not None:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Username already exists",
                    )
            with conn.cursor(row_factory=dict_row) as cur: 
                cur.execute('''INSERT INTO "Users" (user_name, hashed_password) VALUES (%s, %s) RETURNING id''',
                                (request.username, hash_password(request.password)))
                id =  (cur.fetchone()).get('id')
                access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
                access_token = create_access_token(
                    data={"sub": str(id)}, expires_delta=access_token_expires
                )
                return Token(token=access_token, token_type="bearer")
        


@router.post("/login")
async def login_for_access_token(
    request: RegisterRequest,
) -> LoginResponse:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(AuthUser)) as cur:
            cur.execute('''SELECT id, user_name, hashed_password FROM "Users" WHERE user_name = %s''', (request.username,))
            user = cur.fetchone() 
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
            return LoginResponse(token=access_token, id = user.id)
