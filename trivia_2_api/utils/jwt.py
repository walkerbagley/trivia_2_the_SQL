import datetime
import jwt
from fastapi.security import OAuth2PasswordBearer
from typing import Union

from ..config import get_settings


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 3000

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data:dict, expires_delta: Union[datetime.timedelta, None] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, get_settings().jwt_secret, algorithm=ALGORITHM)
    return encoded_jwt