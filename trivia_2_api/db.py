from dotenv import load_dotenv
from os import getenv, path
from psycopg_pool import ConnectionPool

# Load environment variables at module level
# Look for .env file in the same directory as this script
script_dir = path.dirname(path.abspath(__file__))
env_path = path.join(script_dir, ".env")
load_dotenv(env_path)


def get_db_conn_str():
    # return getenv("connection_uri")
    return f"""
    dbname={getenv('POSTGRES_DB')}
    user={getenv('POSTGRES_USER')}
    password={getenv('POSTGRES_PASSWORD')}
    host={getenv('POSTGRES_HOST')}
    port={getenv('POSTGRES_PORT')}
    """


db = ConnectionPool(conninfo=get_db_conn_str(), open=False)
