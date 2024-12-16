from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from psycopg.rows import class_row, dict_row
from uuid import UUID

from trivia_2_api.models.user import GameStatus

from ..db import db
from ..models import Deck, UserRequest, UserResponse, UserStatus

answer_choices = ['a', 'b', 'c', 'd']

router = APIRouter(
    prefix="/user",
    tags=["user"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_user() -> list[UserResponse]:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(UserResponse)) as cur:
            cur.execute('''SELECT id, user_name FROM "Users"''')
            return cur.fetchall()

@router.get("/status")
async def get_current_user_status(request: Request) -> UserStatus:
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute('''
                        SELECT g.id, g.host_id, g.status
                        FROM "Games" as g
                        LEFT OUTER JOIN "GamePlayers" as gp ON g.id = gp.game_id
                        WHERE (gp.player_id = %s OR g.host_id = %s)
                        AND (g.status = 'open' OR g.status = 'in_progress')
                        ORDER BY g.start_time desc
                        LIMIT 1
                        ''', (request.state.user.id,request.state.user.id,))
            game = cur.fetchone()

            if game is None:
                return UserStatus(user_status="home")
        
            game_id = game.get("id", None)
            host_id = game.get("host_id", None)
            status = game.get("status", None)
            if game_id is None or host_id is None or status is None:
                raise HTTPException(status_code=500, detail="Failed to get game status")

            if status == 'open':
                return UserStatus(user_status="hosting" if host_id == request.state.user.id else "playing", game_status=GameStatus(id=game_id, status="open", round_number=0, question_number=0, question_id=None))
            
            elif host_id == request.state.user.id:
                cur.execute('''
                            SELECT g.id, g.status, g.current_round as round_number, g.current_question as question_number, q.id as question_id
                            FROM "Games" as g
                            LEFT OUTER JOIN "Decks" as d ON g.deck_id = d.id
                            LEFT OUTER JOIN "DeckRounds" as dr ON dr.deck_id = d.id and dr.round_number = g.current_round
                            LEFT OUTER JOIN "RoundQuestions" as rq ON dr.round_id = rq.round_id and rq.question_number = g.current_question
                            LEFT OUTER JOIN "Questions" as q ON rq.question_id = q.id
                            WHERE g.id = %s''', (game_id,))
                game_status = cur.fetchone()
                return UserStatus(user_status="hosting", game_status=game_status)
            else:
                cur.execute('''
                            SELECT id, status, current_round as round_number, current_question as question_number, q.id as question_id, 
                            CASE WHEN (q.a = 'False' and q.b = 'True') or (q.a = 'True' and q.b = 'False')
                                THEN a.answer::text
                            ELSE
                                shuffle_answer(a.answer::text, q.first_answer::int)
                            END as team_answer
                            FROM "Games" as g
                            INNER JOIN "GamePlayers" as gp ON g.id = gp.game_id and gp.player_id = %s
                            LEFT OUTER JOIN "Answers" as a ON g.id = a.game_id and gp.team_id = a.team_id and a.round_number = g.current_round and a.question_number = g.current_question
                            LEFT OUTER JOIN "Decks" as d ON g.deck_id = d.id
                            LEFT OUTER JOIN "DeckRounds" as dr ON dr.deck_id = d.id and dr.round_number = g.current_round
                            LEFT OUTER JOIN "RoundQuestions" as rq ON dr.round_id = rq.round_id and rq.question_number = g.current_question
                            LEFT OUTER JOIN "Questions" as q ON rq.question_id = q.id
                            WHERE g.id = %s''', (request.state.user.id, game_id,))
                game_status = cur.fetchone()

                return UserStatus(user_status="playing", game_status=game_status)

@router.get("/{id}")
async def get_user(id: UUID) -> UserResponse:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(UserResponse)) as cur:
            cur.execute('''SELECT id, user_name FROM "Users" WHERE id = %s''', (id,))
            question = cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="User not found")
            return question
            
@router.put("/{id}")
async def update_user(id: UUID, user: UserRequest) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''UPDATE "Users" SET user_name = %s, hashed_password=%s WHERE id = %s''',
                              (user.user_name, user.hashed_password, id))

@router.delete("/{id}")
async def delete_user(id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''DELETE FROM "Users" WHERE id = %s''', (id,))

@router.get("/{user_id}/deck")
async def get_user_decks(user_id: UUID) -> list[Deck]:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Deck)) as cur:
            cur.execute('''
                              SELECT d.id, d.name, d.description, d.owner_id,
                              (SELECT count(*) FROM "DeckRounds" as dr where dr.deck_id = d.id) as rounds 
                              FROM "Decks" as d 
                              LEFT OUTER JOIN "UserDecks" as ud ON d.id = ud.deck_id
                              WHERE ud.user_id = %s''', (user_id,))

            decks = cur.fetchall()

            return decks

@router.post("/{user_id}/deck/{deck_id}")
async def add_user_deck(user_id: UUID, deck_id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''INSERT INTO "UserDecks" (user_id, deck_id) VALUES (%s, %s)''',
                              (user_id, deck_id))
            return JSONResponse(status_code=201, content=None)

@router.delete("/{user_id}/deck/{deck_id}")
async def remove_user_deck(user_id: UUID, deck_id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''DELETE FROM "UserDecks" WHERE user_id = %s AND deck_id = %s''', (user_id, deck_id))





        