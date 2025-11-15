# trivia_2_the_SQL
Database Concepts Project: Trivia Web Application

Walker Bagley, Dagny Brand, Zach Brown, Patrick Schlosser

### Running the project locally

- Start the backend API (FastAPI / Uvicorn):

```powershell
cd trivia_2_api
uvicorn trivia_2_api.main:app --reload --host 127.0.0.1 --port 8000
```

- Start the frontend (React dev server):

```powershell
cd trivia-2-the-sql
npm start
```
The API will be available at http://127.0.0.1:8000. The automatic docs (if enabled) are usually at http://127.0.0.1:8000/docs.

This starts the React dev server (usually on http://localhost:3000) and proxies API requests to the backend if configured.

#### Troubleshooting

- ensure packages installed with uv and .venv is active
- DB connection refused: verify Postgres is running and POSTGRES_* env vars are correct.
- Port conflicts: change the `--port` argument for `uvicorn` or the dev server port for React.
- Missing env vars: create a `.env` file in the repo root or set the variables in your shell session.


### Question Details
Questions should have the following attributes in the database:
```json
{
        "id": "question_id",
        "category": "category name",
        "difficulty": 1-3,
        "question": "question statement",
        "A": "correct answer",
        "B": "distractor 1"
        "C": "distractor 2"
        "D": "distractor 3"
}
```

Questions are classified in the following ways:
- Categories: eng/lit/humanities, general, pop culture/celebrities/people, tv/movies, history, stem, world/geography, brain-teaser, entertainment, kids, hobbies, music, religion, sports, videogames, newest? rated?
- Difficulties: scale from 1 to 3
- The correct answer will always be under the A mc option and answers will need to be shuffled on load if they are being used. 

Current categories and attributes (10/7/2024):
- Categories: `{'hobbies', 'sports', 'kids', 'world', 'tv', 'newest', 'general', 'pop culture', 'brain-teasers', 'religion', 'entertainment', 'humanities', 'stem', 'history'}`
- Attributes: `{'music', 'literature', 'animals', 'chemistry', 'max', 'math', 'quotes', 'cartoon', 'geography', 'biology', 'politics', 'tv', 'physics', 'movies', 'video-games', 'mythology', 'celebrities', 'cs', 'videogames', 'people', 'usa'}`


### Dev Plan fa2024
Oct 9th: Clean and parse data, standup database
Oct 17th: Working MVP with basic CRUD functionality
Nov 6th: Stage 3 - basic functionality done
Nov 25th: Develop advanced functions
Dec 6th: First draft of report written
Dec 10th: Review functionality and ensure a bug free experience
Dec 15th: Stage 4 - finish report, make video, and clean up code

