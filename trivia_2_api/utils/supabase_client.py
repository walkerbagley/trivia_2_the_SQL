from supabase import create_client, Client
from ..config import get_settings

_supabase_client = None


def get_supabase_client() -> Client:
    """Get singleton Supabase client using service key"""
    global _supabase_client
    if _supabase_client is None:
        settings = get_settings()
        _supabase_client = create_client(
            settings.supabase_url, settings.supabase_service_key
        )
    return _supabase_client
