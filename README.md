# trivia_2_the_SQL
Database Concepts Project: Trivia Web Application
Walker Bagley, Dagny Brand, Zach Brown, Patrick Schlosser


### Question Details
Questions should have the following attributes in the database:
{
        "id": "question_id"
        "category": "category name",
        "difficulty": 1-3,
        "question": "question statement",
        "A": "correct answer",
        "B": "distractor 1"
        "C": "distractor 2"
        "D": "distractor 3"
}

Questions are classified in the following ways:
Categories: eng/lit/humanities, general, pop culture/celebrities/people, tv/movies, history, stem, world/geography, brain-teaser, entertainment, kids, hobbies, music, religion, sports, videogames, newest? rated?
Difficulties: scale from 1 to 3
The correct answer will always be under the A mc option and answers will need to be shuffled on load if they are being used. 