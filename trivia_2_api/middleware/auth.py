import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from jwt.exceptions import InvalidTokenError
from psycopg.rows import class_row
from typing import Annotated

from ..config import get_settings
from ..db import db
from ..models import  AuthUser, TokenData
from ..utils.jwt import ALGORITHM, oauth2_scheme

async def authenticate_user(request: Request, call_next):
    if request.url.path == "/auth/login" or request.url.path == "/auth/register" or request.url.path == "/" or request.url.path == "/docs" or request.url.path == "/openapi.json":
        response = await call_next(request)
        return response
    token = request.headers.get("Authorization", None)
    if not token:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"error": "Not authenticated"})
    token = token.replace("Bearer ", "")
    
    try:
        user = await get_current_user(token=token)
        headers = dict(request.scope["headers"])
        headers[b"X-Authenticated-User"] = user.id.bytes
        request.scope["headers"] = [(k,v) for k,v in headers.items()]
        response = await call_next(request)
        return response
    except HTTPException as e:
        return JSONResponse(status_code=e.status_code, content={"error": e.detail})


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> AuthUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token.encode('utf-8'), get_settings().jwt_secret, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError as e:
        raise credentials_exception
    async with db.connection() as conn:
        async with conn.cursor(row_factory=class_row(AuthUser)) as cur:
            await cur.execute('''SELECT id, user_name, hashed_password FROM "Users" WHERE user_name = %s''', (username,))
            user = await cur.fetchone()
            if not user:
                raise credentials_exception         
            return user