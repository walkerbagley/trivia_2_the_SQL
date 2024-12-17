from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from psycopg.rows import class_row, dict_row
from uuid import UUID

from trivia_2_api.models.user import GameStatus, User
from trivia_2_api.routers.game import next_question

from ..db import db
from ..models import Deck, UserRequest, UserResponse, UserStatus, UserGameScores

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

async def next_question_if_needed(game_id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(''' 
                        SELECT g.host_id, g.current_round, g.current_question, dr.num_questions, g.question_time_sec - EXTRACT(EPOCH FROM (now() - g.last_question_start))::int as time_remaining
                        FROM "Games" as g
                        INNER JOIN "Decks" as d ON g.deck_id = d.id
                        INNER JOIN "DeckRounds" as dr ON d.id = dr.deck_id
                        WHERE g.id = %s and dr.round_number = g.current_round''', (game_id,))
            game = cur.fetchone()

            if game is None:
                raise HTTPException(status_code=404, detail="Game not found")
            
            if game.get("time_remaining", None) > 0:
                return
            
            if game.get("current_question", None) < game.get("num_questions", None):
                cur.execute('''UPDATE "Games" SET current_question = current_question + 1 WHERE id = %s''', (game_id,))
                return
            
            else:
                cur.execute(''' SELECT count(*) as rounds FROM "DeckRounds" as dr WHERE dr.deck_id = (SELECT g.deck_id FROM "Games" as g WHERE g.id = %s)''', (game_id,))

                results = cur.fetchone()
                if results is None:
                    raise HTTPException(status_code=404, detail="Game not found")
                
                if results.get("rounds", None) > game.get("current_round", None):
                    cur.execute('''UPDATE "Games" SET current_round = current_round + 1, current_question = 1 WHERE id = %s''', (game_id,))
                    return
                
                else:
                    cur.execute('''UPDATE "Games" SET status = 'complete', end_time = %s WHERE id = %s''', (datetime.now(), game_id))
                    return
            
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
                        AND gp.is_active = true
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
                            SELECT g.id, g.status, g.current_round as round_number, g.current_question as question_number, q.id as question_id, 
                            CASE WHEN g.status = 'in_progress'
                                THEN g.question_time_sec - EXTRACT(EPOCH FROM (now() - g.last_question_start))::int
                                ELSE null
                            END as time_remaining
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
                            SELECT g.id, g.status, g.current_round as round_number, g.current_question as question_number, q.id as question_id, shuffle_answer(a.answer::text, q.first_answer::int) as team_answer, 
                            CASE WHEN g.status = 'in_progress'
                                THEN g.question_time_sec - EXTRACT(EPOCH FROM (now() - g.last_question_start))::int
                                ELSE null
                            END as time_remaining
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


@router.get("/{user_id}/scores")
async def get_user_scores(user_id: UUID) -> list[UserGameScores]:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(UserGameScores)) as cur:
            cur.execute('''
                        select g.id as game_id, t.name as team_name, g.start_time::Date as date, sum(CASE WHEN a.answer = 'a' THEN 1 ELSE 0 END) as score, (sum(CASE WHEN a.answer = 'a' THEN 1 ELSE 0 END) / sum(dr.num_questions) * 100)::integer as percentage
                        FROM "GamePlayers" as gp
                        LEFT OUTER JOIN "Teams" as t ON gp.team_id = t.id
                        LEFT OUTER JOIN "Games" as g on gp.game_id = g.id
                        LEFT OUTER JOIN "Answers" as a on a.game_id = g.id and a.team_id = gp.team_id
                        LEFT OUTER JOIN "Questions" as q on a.question_id = q.id
                        LEFT OUTER JOIN "DeckRounds" as dr on dr.deck_id = g.deck_id
                        where gp.player_id = %s
                        group by g.id, t.name
                        order by date desc''', (user_id,))
            return cur.fetchall()





        