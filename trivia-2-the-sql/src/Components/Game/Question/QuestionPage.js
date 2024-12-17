import React from 'react'
import './styles.css'
import { useAxios } from '../../../Providers/AxiosProvider.js'
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GameService } from '../../../Services/Game.js';
import {getCurrentUserStatus} from '../../../Services/User.js'
import {getQuestionById} from '../../../Services/Question.js'

const QuestionPage =  () => {
    const axios = useAxios();
    const location = useLocation();
    const navigate = useNavigate();
    const [answer, setAnswer] = useState("");
    const [active, setActive] = useState("");
    const [question, setQuestion] = useState("");
    const [isHost, setIsHost] = useState(null);
    const [scores, setScores] = useState([]);
    const [options, setOptions] = useState({"a": [], "b": [], "c": [], "d": []});
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [aEnabled, setAEnabled] = useState(true);
    const [bEnabled, setBEnabled] = useState(true);
    const [cEnabled, setCEnabled] = useState(true);
    const [dEnabled, setDEnabled] = useState(true);
    const [roundNumber, setRoundNumber] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(0);
    const questionNumberRef = useRef(0);
    const [timeRemaining, setTimeRemaining] = useState(0);

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const answerQuestion = (letter) => {
        try {
            setActive(letter);
            setAnswer(options[letter][0]);
            GameService.submitAnswer(axios,location.state.gameId,{"round_number":roundNumber,"question_number":questionNumber,"answer":options[letter][1]}).catch((error)=>{
                console.error(error);
            });
        } catch (error) {
            console.error(error);
        }
    };

    // get new question or round info
    const getGameStatus = () => {
        getCurrentUserStatus(axios).then((data) => {
            if (data.game_status===null || data.game_status.status === 'complete'){
                navigate("/score/"+location.state.joinCode, { state: { gameId : location.state.gameId } });
            }
            if (data?.game_status?.time_remaining){
                setTimeRemaining(data.game_status.time_remaining);
            }
            if (data.game_status){
                setRoundNumber(data.game_status.round_number);
                if (questionNumberRef.current!=Number(data.game_status.question_number)){
                    GameService.getGameScores(axios, location.state.gameId).then((s) => {
                        setScores(s);
                    });
                    setQuestionNumber(Number(data.game_status.question_number));
                    questionNumberRef.current = Number(data.game_status.question_number);
                    setActive("");
                    getQuestionById(axios, data.game_status.question_id).then((resp) => {
                        setQuestion(resp.question);
                        setCorrectAnswer(resp.a);
                        const shuffledOptions = shuffleArray([[resp.a, "a"], [resp.b, "b"], [resp.c, "c"], [resp.d, "d"]])
                        setOptions({ "a": shuffledOptions[0], "b": shuffledOptions[1], "c": shuffledOptions[2], "d": shuffledOptions[3] })
                        console.log(isHost);
                        if (!isHost){
                            setAEnabled(options["a"][0] ? true : false);
                            setBEnabled(options["b"][0] ? true : false);
                            setCEnabled(options["c"][0] ? true : false);
                            setDEnabled(options["d"][0] ? true : false);
                        }
                    });
                }
            } else {
                console.error("Game Status is null:",data)
            }
            if (data?.game_status?.team_answer != null && data.game_status.team_answer.length > 0){
                for (const [key, value] of Object.entries(options)) {
                    if (data.game_status.team_answer == value[1]) {
                        setAnswer(value[0]);
                    }
                  }
            };
        });
    };

    // Timeout to see if question has changed
    useEffect(() => {
        const interval = setInterval(() => {
          getGameStatus();
        }, 1000);
        return () => clearInterval(interval);
      }, []);

    const nextQuestion = () => {
        GameService.moveToNextQuestion(axios, location.state.gameId).then((resp) => {
            getGameStatus();
        });
    };

    const endGame = () => {
        GameService.endGame(axios, location.state.gameId).then((resp) => {
            navigate("/score/"+location.state.joinCode, { state: { gameId : location.state.gameId } });
        });
    };
    

    function leaveGame(){
        const confirmed = window.confirm("Are you sure you want to leave?");
        if (confirmed){
            GameService.leaveGame(axios, location.state.gameId).then((resp) => {
                navigate('/');
            });
        };
    };

    return (
        <div className='question-page'>
            <div className='center'>
                <h2>Time Remaining: {timeRemaining}</h2>
                <br />
                <h1 className='question-text'>Round {roundNumber}</h1>
                <h1 className='question-text'>Question {questionNumber}: {question}</h1>
                <br/>
            </div>
                <div className='question-grid-container'>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion('a')}} disabled={!aEnabled}
                            className={active == "a" ? 'selected-answer-button' : ""}>
                                <strong>A</strong> {options["a"][0]}
                        </button>
                    </div>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion('b')}} disabled={!bEnabled}
                            className={active == "b" ? 'selected-answer-button' : ""}>
                            <strong>B</strong> {options["b"][0]}
                        </button>
                    </div>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion('c')}} disabled={!cEnabled}
                            className={active == "c" ? 'selected-answer-button' : ""}>
                            <strong>C</strong> {options["c"][0]}
                        </button>
                    </div>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion('d')}} disabled={!dEnabled}
                            className={active == "d" ? 'selected-answer-button' : ""}>
                            <strong>D</strong> {options["d"][0]}
                        </button>
                    </div>
                </div>
            <div className='next-question-button'>
               {isHost && (
                <>
                    <button onClick={()=>{nextQuestion()}} disabled={!isHost}>Next Question</button>
                    <button onClick={() => {endGame()}} disable={!isHost}>End Game</button>
                </>
                )}
                {!isHost && (
                <button onClick={leaveGame} disabled={isHost}>Leave Game</button>
                )}
            </div>
            <div>
                <h1>Scores</h1>
                <ul>
                    {scores ? 
                    scores.map((s) => (
                    <li key={s.name}>
                        <h3>{s.name}: {s.score}</h3>
                    </li>
                    ))
                    : (<p>No Scores Found</p>)
                    }
                </ul>
            </div>
        </div>
    );
};
export default QuestionPage;