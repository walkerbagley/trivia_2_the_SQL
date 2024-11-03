from contextlib import asynccontextmanager
from fastapi import FastAPI

from .routers import deck, game, host, question, score, team, user
from .db import db

@asynccontextmanager
async def lifespan(instance: FastAPI):
    await db.open()
    yield
    await db.close()

app = FastAPI(lifespan=lifespan)

app.include_router(deck.router)
app.include_router(game.router)
app.include_router(host.router)
app.include_router(question.router)
app.include_router(score.router)
app.include_router(team.router)
app.include_router(user.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}

