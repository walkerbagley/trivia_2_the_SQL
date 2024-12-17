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
    const [currAnswer, setCurrAnswer] = useState("");
    const [active, setActive] = useState("");
    const [question, setQuestion] = useState("");
    const [scores, setScores] = useState([]);
    const [options, setOptions] = useState({"a": [], "b": [], "c": [], "d": []});
    const liveOptions = useRef({"a": [], "b": [], "c": [], "d": []});
    const [roundNumber, setRoundNumber] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(0);
    const questionNumberRef = useRef(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const randomNumRef = useRef(Math.floor(Math.random() * (4)));

    function shuffleArray(arr) {
        const length = arr.length;
        const shuffled = new Array(length); // Create an empty array of the same length
        // Adjust the offset in case it's larger than the array length
        const normalizedOffset = ((randomNumRef % length) + length) % length;
    
        for (let i = 0; i < length; i++) {
            const newIndex = (i + normalizedOffset) % length; // Calculate new position
            shuffled[newIndex] = arr[i]; // Move the element to its new position
        }
        return shuffled;
    }

    const answerQuestion = (letter) => {
        try {
            GameService.submitAnswer(axios,location.state.gameId,{"round_number":roundNumber,"question_number":questionNumber,"answer":options[letter][1]}).catch((error)=>{
                console.error(error);
            });
            console.log("submitted ", letter);
        } catch (error) {
            console.error(error);
        }
    };

    const getGameStatus = () => {
        getCurrentUserStatus(axios).then((data) => {
            console.log('options ', options);
            if (data===null || data.game_status===null || data.game_status.status === 'complete'){
                navigate("/score/"+location.state.joinCode, { state: { gameId : location.state.gameId } });
            }
            if (data?.game_status?.time_remaining){
                setTimeRemaining(data.game_status.time_remaining);
            }
            if (data?.game_status?.team_answer !== null){
                // console.log(data.game_status.team_answer, typeof(data.game_status.team_answer))
                setActive(liveOptions.current[data.game_status.team_answer][1]);
                // setActive(data.game_status.team_answer);
            }
            setRoundNumber(data?.game_status?.round_number);
            setQuestionNumber(Number(data.game_status.question_number));
            GameService.getGameScores(axios, location.state.gameId).then((s) => {
                setScores(s);
            }).catch((error)=>{
                console.error(error);
            });
            if (questionNumberRef.current!=Number(data.game_status.question_number)){
                questionNumberRef.current = Number(data.game_status.question_number);
                setActive("");
                getQuestionById(axios, data.game_status.question_id).then((resp) => {
                    randomNumRef.current = Math.floor(Math.random() * (4));
                    setQuestion(resp.question);
                    // const NonshuffledOptions = ([[resp.a, "a"], [resp.b, "b"],[resp.c, "c"], [resp.d, "d"]]);
                    const shuffledOptions = shuffleArray([[resp.a, "a"], [resp.b, "b"], [resp.c, "c"], [resp.d, "d"]]);
                    liveOptions.current = { "a": shuffledOptions[0], "b": shuffledOptions[1], "c": shuffledOptions[2], "d": shuffledOptions[3] };
                    setOptions({ "a": shuffledOptions[0], "b": shuffledOptions[1], "c": shuffledOptions[2], "d": shuffledOptions[3] });
                }).catch((error)=>{
                    console.error(error);
                });
            }
        }).catch((error)=>{
            console.error(error);
        });
    };

      useEffect(() => { // set team answer when active changes
        try{
            console.log("active ",active, typeof(active))
            if (active === "" || active === null){
                setCurrAnswer("No Answer");
                return;
            }
            if (options[active] === null || options[active] === undefined ) {
                return;
            }
            setCurrAnswer(options[active][0])
            console.log('curr answer set')
        } catch{
            console.log('error with options')
        }
      }, [active])


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
                        <button onClick={()=>{answerQuestion('a')}} disabled={location.state.host}
                            className={active == "a" ? 'selected-answer-button' : ""}>
                                <strong>A</strong> {options["a"][0]}
                        </button>
                    </div>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion('b')}} disabled={location.state.host}
                            className={active == "b" ? 'selected-answer-button' : ""}>
                            <strong>B</strong> {options["b"][0]}
                        </button>
                    </div>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion('c')}} disabled={location.state.host}
                            className={active == "c" ? 'selected-answer-button' : ""}>
                            <strong>C</strong> {options["c"][0]}
                        </button>
                    </div>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion('d')}} disabled={location.state.host}
                            className={active == "d" ? 'selected-answer-button' : ""}>
                            <strong>D</strong> {options["d"][0]}
                        </button>
                    </div>
                </div>
            <div className='next-question-button'>
               {location.state.host && (
                <>
                    <button onClick={()=>{nextQuestion()}} >Next Question</button>
                    <button onClick={() => {endGame()}} >End Game</button>
                </>
                )}
                {!location.state.host && (
                <button onClick={leaveGame} >Leave Game</button>
                )}
            </div>
            <div className='center'>
                <p>Current Answer: </p>
                <p>{currAnswer}</p>
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