from contextlib import asynccontextmanager
from fastapi import FastAPI

from .middleware import authenticate_user
from .routers import auth, deck, game, host, question, score, team, user
from .db import db

@asynccontextmanager
async def lifespan(instance: FastAPI):
    await db.open()
    yield
    await db.close()

app = FastAPI(lifespan=lifespan)

app.include_router(auth.router)
app.include_router(deck.router)
app.include_router(game.router)
app.include_router(host.router)
app.include_router(question.router)
app.include_router(score.router)
app.include_router(team.router)
app.include_router(user.router)

@app.middleware("http")
async def authenicate_middleware(request, call_next):
    try:
        response = await authenticate_user(request, call_next)
        return response
    except Exception as e:
        raise e


@app.get("/")
async def root():
    return {"message": "Hello World"}

