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
    const [question, setQuestion] = useState("");
    const [isHost, setIsHost] = useState(null);
    const [scores, setScores] = useState([]);
    const [a, setA] = useState("");
    const [b, setB] = useState("");
    const [c, setC] = useState("");
    const [d, setD] = useState("");
    const [aEnabled, setAEnabled] = useState(true)
    const [bEnabled, setBEnabled] = useState(true)
    const [cEnabled, setCEnabled] = useState(true)
    const [dEnabled, setDEnabled] = useState(true)
    const [roundNumber, setRoundNumber] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(0);
    const questionNumberRef = useRef(0);
    const [timeRemaining, setTimeRemaining] = useState(0);

    
    let qnum = 0
    const answerQuestion = (text,letter) => {
        try{
            setAnswer(letter);
            GameService.submitAnswer(axios,location.state.gameId,{"round_number":roundNumber,"question_number":questionNumber,"answer":letter}).catch((error)=>{
                console.error(error);
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        console.log("question number", questionNumber)
    }, [questionNumber]);
    // Get Status from /User/Status should be called on a time out to get the current question number (1-3s)
    // get question by id from user/status (/question/questionid)

    // get new question or round info
    const getGameStatus = () => {
        getCurrentUserStatus(axios).then((data) => {
            console.log("User Status",data);
            if (isHost === null){
                setIsHost( (data.user_status == 'hosting') ? true : false )
                if (isHost){
                    setAEnabled(false);
                    setBEnabled(false);
                    setCEnabled(false);
                    setDEnabled(false);
                }
            }
            if (data.game_status === 'complete' || data.game_status===null){
                navigate("/score/"+location.state.joinCode, { state: { gameId : location.state.gameId } });
            }
            if (data?.game_status?.time_remaining){
                setTimeRemaining(data.game_status.time_remaining);
            }
            if (data.game_status){
                setRoundNumber(data.game_status.round_number);
                setAnswer(data.game_status.team_answer);
                if (questionNumberRef.current!=Number(data.game_status.question_number)){
                    //setAnswer("")
                    setQuestionNumber(Number(data.game_status.question_number));
                    questionNumberRef.current = Number(data.game_status.question_number)
                    getQuestionById(axios, data.game_status.question_id).then((resp) => {
                        setQuestion(resp.question);
                        setA(resp.a);
                        setB(resp.b);
                        setC(resp.c);
                        setD(resp.d);
                        if (!isHost){
                            setAEnabled((resp.a) ? true : false);
                            setBEnabled((resp.b) ? true : false);
                            setCEnabled((resp.c) ? true : false);
                            setDEnabled((resp.d) ? true : false);
                        }
                    });
                }
            } else {
                console.error("Game Status is null:",data)
            }
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
            GameService.getGameScores(axios, location.state.gameId).then((s) => {
                setScores(s);
                console.log(s)
            });
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
                <h1 className='question-text'>Question {questionNumber}: {question}</h1>
                <br/>
            </div>
                <div className='question-grid-container'>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion(a,'a')}} disabled={!aEnabled}
                            className={answer===a ? 'selected-answer-button' : ""}>
                                <strong>A</strong> {a}
                        </button>
                    </div>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion(b,'b')}} disabled={!bEnabled}
                            className={answer===b ? 'selected-answer-button' : ""}>
                            <strong>B</strong> {b}
                        </button>
                    </div>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion(c,'c')}} disabled={!cEnabled}
                            className={answer===c ? 'selected-answer-button' : ""}>
                            <strong>C</strong> {c}
                        </button>
                    </div>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion(d,'d')}} disabled={!dEnabled}
                            className={answer===d ? 'selected-answer-button' : ""}>
                            <strong>D</strong> {d}
                        </button>
                    </div>
                </div>
            <div className='center'>
                Current Answer: <br/>
                {answer == 'a' ? a : answer == 'b' ? b : answer == 'c' ? c : answer == 'd' ? d : "No Answer"}
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
            <div className='margin-left'>
                {isHost && (<h3>Team Score: {scores[location["state"]["teamId"]]}</h3>)}
            </div>
            {!isHost && 
            (<div>
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
            </div>)}
        </div>
    );
};
export default QuestionPage;