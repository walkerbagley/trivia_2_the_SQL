import string

from datetime import datetime  
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from psycopg.rows import class_row, dict_row
from random import choices
from uuid import UUID

from trivia_2_api.models import question
from trivia_2_api.models.game import AnswerRequest

from ..db import db
from ..models import Game, GameRequest, JoinGameRequest

answer_choices = ['a', 'b', 'c', 'd']

router = APIRouter(
    prefix="/game",
    tags=["game"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_game() -> list[Game]:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Game)) as cur:
            cur.execute('''SELECT id, deck_id, host_id, join_code, question_time_sec, status, current_round, current_question, start_time, end_time FROM "Games"''')
            return cur.fetchall()

@router.get("/{id}")
async def get_game(id: UUID) -> Game:
    with db.connection() as conn:
        with conn.cursor(row_factory=class_row(Game)) as cur:
            cur.execute('''SELECT id, deck_id, host_id, join_code, question_time_sec, status, current_round, current_question, start_time, end_time FROM "Games" WHERE id = %s''', (id,))
            question = cur.fetchone() 
            if question is None:
                raise HTTPException(status_code=404, detail="Game not found")
            return question

@router.post("/")
async def create_game(request: Request, game: GameRequest) -> None:
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            join_code = ''.join(choices(string.ascii_uppercase + string.digits, k=6))
            cur.execute('''INSERT INTO "Games" (deck_id, host_id, start_time, join_code, question_time_sec) VALUES (%s, %s, %s, %s, %s) RETURNING id''',
                              (game.deck_id, request.state.user.id, datetime.now(), join_code, game.question_time_sec))
            game_id = (cur.fetchone()).get("id", None)
            if game_id is None:
                raise HTTPException(status_code=500, detail="Failed to create game")
            
            return JSONResponse(status_code=201, content={"id": str(game_id), "join_code": str(join_code)})

@router.post("/join")
async def join_game(request:Request, game: JoinGameRequest) -> None:
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute('''SELECT id, host_id, status, join_code FROM "Games" WHERE join_code = %s and status = 'open' ''', (game.join_code, ))

            results = cur.fetchone()
            if results is None:
                raise HTTPException(status_code=404, detail="Game not found")
            
            if results.get("host_id", None) == request.state.user.id:
                print('is host account')
                raise HTTPException(status_code=400, detail="Host cannot join game")
            
            if game.join_code != results.get("join_code", None):
                print('invalid join code')
                raise HTTPException(status_code=400, detail="Invalid join code")
            
            cur.execute('''
                        SELECT count(*) as count
                        FROM "GamePlayers" as gp 
                        INNER JOIN "Games" as g 
                        ON gp.game_id = g.id
                        WHERE player_id = %s AND (g.status = 'open' or g.status = 'in_progress')
                        ''', (request.state.user.id, ))
            count = cur.fetchone().get("count", None)
            if count > 0:
                print('player is already in the game')
                raise HTTPException(status_code=400, detail="Player already in game")
            
            cur.execute('''INSERT INTO "GamePlayers" (game_id, player_id, team_id, is_active) VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING''', (results.get("id", None), request.state.user.id, game.team_id, True))
            
            return JSONResponse(status_code=201, content={"game_id": str(results.get("id", None))})


@router.post("/{game_id}/start")
async def start_game(game_id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''UPDATE "Games" SET status = 'in_progress', last_question_start = now() WHERE id = %s''', (game_id,))

@router.put("/{game_id}/leave")
async def leave_game(request: Request, game_id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''UPDATE "GamePlayers" SET is_active = false WHERE game_id = %s and player_id = %s''', (game_id, request.state.user.id))

@router.put("/rejoin")
async def rejoin_game(request: Request) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''UPDATE "GamePlayers" SET is_active = true WHERE game_id = 
                        (SELECT id FROM "Games" as g 
                            INNER JOIN "GamePlayers" as gp ON gp.game_id = g.id
                            WHERE gp.player_id = %s
                            ORDER BY g.start_time DESC
                            LIMIT 1
                        ) and player_id = %s''', (request.state.user.id, request.state.user.id))


@router.put("/{game_id}/end")
async def end_game(request: Request, game_id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute('''SELECT g.host_id FROM "Games" as g WHERE g.id = %s''', (game_id,))
            results = cur.fetchone()

            if results is None:
                raise HTTPException(status_code=404, detail="Game not found")
            
            if results.get("host_id", None) != request.state.user.id:
                raise HTTPException(status_code=401, detail="Only host can end game")
            
            cur.execute('''UPDATE "Games" SET status = 'complete', end_time = %s WHERE id = %s''', (datetime.now(), game_id))

@router.delete("/{id}")
async def delete_game(id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor() as cur:
            cur.execute('''DELETE FROM "Games" WHERE id = %s''', (id,))

@router.get("/{game_id}/team")
async def get_team_names(game_id: UUID) -> list[str]:
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute('''
                        SELECT t.name 
                        FROM "GamePlayers" as gp
                        INNER JOIN "Teams" as t
                        ON gp.team_id = t.id
                        WHERE game_id = %s''', (game_id,))
            return [row.get("name") for row in cur.fetchall()]

@router.post("/{game_id}/answer")
async def answer_question(request:Request, game_id: UUID, answer: AnswerRequest) -> None:
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute('''SELECT current_round, current_question FROM "Games" WHERE id = %s''', (game_id,))
            results = cur.fetchone()
            if results is None:
                raise HTTPException(status_code=404, detail="Game not found")
            
            if results.get("current_round", None) != answer.round_number or results.get("current_question", None) != answer.question_number:
                raise HTTPException(status_code=400, detail="Invalid round or question number")
            
            cur.execute(''' SELECT q.id, q.first_answer 
                            FROM "Games" as g
                            INNER JOIN "Decks" as d ON g.deck_id = d.id
                            INNER JOIN "DeckRounds" as dr ON d.id = dr.deck_id
                            INNER JOIN "RoundQuestions" as rq ON dr.round_id = rq.round_id
                            INNER JOIN "Questions" as q ON rq.question_id = q.id
                            WHERE g.id = %s and dr.round_number = %s and rq.question_number = %s''', (game_id, answer.round_number, answer.question_number))
            results = cur.fetchone()
            if results is None:
                raise HTTPException(status_code=404, detail="Question not found")
            
            question_id = results.get("id", None)
            first_answer = results.get("first_answer", None)
            if first_answer is None or question_id is None:
                raise HTTPException(status_code=500, detail="Failed to get question")
            
            
            cur.execute('''
                        INSERT INTO "Answers" 
                        (game_id, team_id, round_number, question_number, question_id, answer)
                        SELECT %s, gp.team_id, %s, %s, %s, 
                        unshuffle_answer(%s::text, (SELECT first_answer FROM "Questions" WHERE id = %s)::int)
                        FROM "GamePlayers" as gp
                        WHERE gp.player_id = %s and gp.is_active = true and gp.game_id = %s
                        ON CONFLICT (game_id, team_id, round_number, question_number) DO UPDATE SET answer = EXCLUDED.answer''', (game_id, answer.round_number, answer.question_number, question_id, answer.answer, question_id, request.state.user.id, game_id))
            

@router.post("/{game_id}/next")
async def next_question(request: Request, game_id: UUID) -> None:
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(''' 
                        SELECT g.host_id, g.current_round, g.current_question, dr.num_questions
                        FROM "Games" as g
                        INNER JOIN "Decks" as d ON g.deck_id = d.id
                        INNER JOIN "DeckRounds" as dr ON d.id = dr.deck_id
                        WHERE g.id = %s and dr.round_number = g.current_round''', (game_id,))
            game = cur.fetchone()

            if game is None:
                raise HTTPException(status_code=404, detail="Game not found")
            
            if game.get("host_id", None) != request.state.user.id:
                raise HTTPException(status_code=401, detail="Only host can move to next question")
            
            if game.get("current_question", None) < game.get("num_questions", None):
                cur.execute('''UPDATE "Games" SET current_question = current_question + 1, last_question_start = now() WHERE id = %s''', (game_id,))
                return
            
            else:
                cur.execute(''' SELECT count(*) as rounds FROM "DeckRounds" as dr WHERE dr.deck_id = (SELECT g.deck_id FROM "Games" as g WHERE g.id = %s)''', (game_id,))

                results = cur.fetchone()
                if results is None:
                    raise HTTPException(status_code=404, detail="Game not found")
                
                if results.get("rounds", None) > game.get("current_round", None):
                    cur.execute('''UPDATE "Games" SET current_round = current_round + 1, current_question = 1, last_question_start = now() WHERE id = %s''', (game_id,))
                    return
                
                else:
                    cur.execute('''UPDATE "Games" SET status = 'complete', end_time = %s WHERE id = %s''', (datetime.now(), game_id))
                    return

@router.get("/{game_id}/score")
async def get_game_scores(game_id: UUID) -> list[dict]:
    with db.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(''' 
                        SELECT t.name, sum(CASE WHEN a.answer = 'a' THEN 1 ELSE 0 END) as score
                        FROM "GamePlayers" as gp
                        INNER JOIN "Teams" as t ON gp.team_id = t.id
                        INNER JOIN "Games" as g ON gp.game_id = g.id
                        LEFT OUTER JOIN "Answers" as a ON g.id = a.game_id and gp.team_id = a.team_id
                        INNER JOIN "Questions" as q ON a.question_id = q.id
                        WHERE g.id = %s
                        GROUP BY t.id
                        ''', (game_id,))
            return cur.fetchall()



            