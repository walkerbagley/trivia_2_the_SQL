import React from 'react'
import './styles.css'
import { useAxios } from '../../../Providers/AxiosProvider.js'
import { useState, useEffect } from 'react';
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
    
    let qnum = 0
    const answerQuestion = (text,letter) => {
        setAnswer(text);
        console.log('Submitting answer:',location.state.gameId,{roundNumber,questionNumber,letter,text})
        GameService.submitAnswer(axios,location.state.gameId,{"round_number":roundNumber,"question_number":questionNumber,"answer":letter});
    };
    // Get Status from /User/Status should be called on a time out to get the current question number (1-3s)
    // get question by id from user/status (/question/questionid)

    // get new question or round info
    const getGameStatus = () => {
        getCurrentUserStatus(axios).then((data) => {
            if (isHost === null){
                setIsHost( (data.user_status == 'hosting') ? true : false )
            }
            if (data.game_status === 'complete' || data.game_status===null){
                navigate("/score/"+location.state.joinCode, { state: { gameId : location.state.gameId } });
            }
            else if (data.game_status){

                setRoundNumber(data.game_status.round_number);
                if (questionNumber!=data.game_status.question_number){
                    setQuestionNumber(data.game_status.question_number);
                    console.log(questionNumber, data.game_status.question_number)
                    getQuestionById(axios, data.game_status.question_id).then((resp) => {
                        setQuestion(resp.question);
                        setA(resp.a);
                        setAEnabled((resp.a) ? true : false);
                        setB(resp.b);
                        setBEnabled((resp.b) ? true : false);
                        setC(resp.c);
                        setCEnabled((resp.c) ? true : false);
                        setD(resp.d);
                        setDEnabled((resp.d) ? true : false);
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
        }, 5000);
        return () => clearInterval(interval);
      }, []);

    const nextQuestion = () => {
        GameService.moveToNextQuestion(axios, location.state.gameId).then((resp) => {
            console.log("next q resp: ", resp)
            getGameStatus();
            GameService.getGameScores(axios, location.state.gameId).then((s) => {
                console.log("game scores: ", s)
                setScores(s);
            });
        });
    };


    return (
        <div className='question-page'>
            <div className='center'>
                <br />
                <h1 className='question-text'>Question {questionNumber}: {question}</h1>
                <br/>
            </div>
                <div className='question-grid-container'>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion(a,'a')}} disabled={!aEnabled}
                            style={{backgroundColor: aEnabled ? "whitesmoke" : "gray"}}>
                                A: {a}
                        </button>
                    </div>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion(b,'b')}} disabled={!bEnabled}
                            style={{backgroundColor: bEnabled ? "whitesmoke" : "gray"}}>
                            B: {b}
                        </button>
                    </div>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion(c,'c')}} disabled={!cEnabled}
                            style={{backgroundColor: cEnabled ? "whitesmoke" : "gray"}}>
                            C: {c}
                        </button>
                    </div>
                    <div className='question-grid-item'>
                        <button onClick={()=>{answerQuestion(d,'d')}} disabled={!dEnabled}
                            style={{backgroundColor: dEnabled ? "whitesmoke" : "gray"}}>
                            D: {d}
                        </button>
                    </div>
                </div>
            <div className='center'>
                Current Answer: <br/>
                {answer}
            </div>
            <div className='next-question-button'>
               {isHost && (
                <button onClick={()=>{nextQuestion()}} disabled={!isHost}>Next Question</button>
                )}
            </div>
            <div className='margin-left'>
                <h3>Team Score: 0</h3>
            </div>
            <div>
                scores : {scores}
            </div>
        </div>
    );
};
export default QuestionPage;