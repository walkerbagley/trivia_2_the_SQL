from os import getenv
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    jwt_secret: str

    # realtime additions
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str

    class Config:
        env_file = ".env"


_settings = None


@lru_cache()
def get_settings():
    global _settings
    if _settings is None:
        load_dotenv()
        _settings = Settings()
    return _settings
