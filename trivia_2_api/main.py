from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .middleware import authenticate_user
from .routers import auth, deck, game, question, score, team, user
from .db import db

@asynccontextmanager
async def lifespan(instance: FastAPI):
    db.open()
    yield
    db.close()

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(deck.router)
app.include_router(game.router)
app.include_router(question.router)
app.include_router(score.router)
app.include_router(team.router)
app.include_router(user.router)

@app.middleware("http")
async def authenicate_middleware(request, call_next):
    try:
        response = await authenticate_user(request, call_next)
        return response
    except HTTPException as e:
        return JSONResponse(status_code=e.status_code, content={"error": str(e)}, headers={"Access-Control-Allow-Origin": "*"})


@app.get("/")
async def root():
    return {"message": "Hello World"}

