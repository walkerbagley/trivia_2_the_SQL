from dotenv import load_dotenv
from os import getenv
from psycopg_pool import AsyncConnectionPool


def get_db_conn_str():
    load_dotenv()

    return f"""
    dbname={getenv('POSTGRES_DB')}
    user={getenv('POSTGRES_USER')}
    password={getenv('POSTGRES_PASSWORD')}
    host={getenv('POSTGRES_HOST')}
    port={getenv('POSTGRES_PORT')}
    """

db = AsyncConnectionPool(conninfo=get_db_conn_str(), open=False)



