import datetime
import re
from fastapi import APIRouter, HTTPException, status
from psycopg.rows import class_row, dict_row

from ..db import db
from ..models import AuthUser, RegisterRequest, DualTokenResponse
from ..utils.hash import hash_password, verify_password
from ..utils.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from ..utils.supabase_client import get_supabase_client

EMAIL_DOMAIN = "taas.internal"

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)


def validate_username(username: str) -> bool:
    # Allow letters, numbers, dots, hyphens, underscores
    pattern = r"^[a-zA-Z0-9._-]+$"
    return bool(re.match(pattern, username))


@router.post("/register")
async def register(request: RegisterRequest) -> DualTokenResponse:
    if not validate_username(request.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username can only contain letters, numbers, dots, hyphens, and underscores",
        )

    supabase = get_supabase_client()

    with db.connection() as conn:
        # Check if username exists
        with conn.cursor(row_factory=class_row(AuthUser)) as cur:
            cur.execute(
                """SELECT id, user_name FROM "Users" WHERE user_name = %s""",
                (request.username,),
            )
            existing_user = cur.fetchone()
            if existing_user is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username already exists",
                )

        # Create user in your database
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """INSERT INTO "Users" (user_name, hashed_password) VALUES (%s, %s) RETURNING id""",
                (request.username, hash_password(request.password)),
            )
            user_id = (cur.fetchone()).get("id")

            # Create FastAPI token
            access_token_expires = datetime.timedelta(
                minutes=ACCESS_TOKEN_EXPIRE_MINUTES
            )
            fastapi_token = create_access_token(
                data={"sub": str(user_id)}, expires_delta=access_token_expires
            )

            # Create Supabase user with metadata linking to your user
            try:
                # Use a unique email format: username@yourgame.internal
                supabase_response = supabase.auth.sign_up(
                    {
                        "email": f"{request.username}@{EMAIL_DOMAIN}",
                        "password": request.password,
                        "options": {
                            "data": {
                                "app_user_id": str(user_id),  # Link to your Users table
                                "username": request.username,
                            }
                        },
                    }
                )

                if supabase_response.user is None:
                    raise Exception("Supabase user creation failed")

                supabase_token = supabase_response.session.access_token
                refresh_token = supabase_response.session.refresh_token

            except Exception as e:
                # Rollback: delete user from your database
                conn.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create Supabase user: {str(e)}",
                )

            return DualTokenResponse(
                fastapi_token=fastapi_token,
                supabase_token=supabase_token,
                refresh_token=refresh_token,
                id=user_id,
            )


@router.post("/login")
async def login(request: RegisterRequest) -> DualTokenResponse:
    supabase = get_supabase_client()

    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(AuthUser)) as cur:
            cur.execute(
                """SELECT id, user_name, hashed_password FROM "Users" WHERE user_name = %s""",
                (request.username,),
            )
            user = cur.fetchone()

            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            if not verify_password(request.password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Create FastAPI token
            access_token_expires = datetime.timedelta(
                minutes=ACCESS_TOKEN_EXPIRE_MINUTES
            )
            fastapi_token = create_access_token(
                data={"sub": str(user.id)}, expires_delta=access_token_expires
            )

            # Sign in to Supabase
            try:
                supabase_response = supabase.auth.sign_in_with_password(
                    {
                        "email": f"{request.username}@{EMAIL_DOMAIN}",
                        "password": request.password,
                    }
                )

                if supabase_response.session is None:
                    raise Exception("Supabase authentication failed")

                supabase_token = supabase_response.session.access_token
                refresh_token = supabase_response.session.refresh_token

            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to authenticate with Supabase: {str(e)}",
                )

            return DualTokenResponse(
                fastapi_token=fastapi_token,
                supabase_token=supabase_token,
                refresh_token=refresh_token,
                id=user.id,
            )


@router.post("/refresh-supabase-token")
async def refresh_supabase_token(refresh_token: str) -> dict:
    """Refresh Supabase token when it expires"""
    supabase = get_supabase_client()

    try:
        response = supabase.auth.refresh_session(refresh_token)

        return {
            "supabase_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )
