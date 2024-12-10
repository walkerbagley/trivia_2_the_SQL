from os import getenv
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    jwt_secret: str

@lru_cache()
def get_settings():
    load_dotenv()
    
    return Settings(jwt_secret=getenv('JWT_SECRET'))