import React from 'react'
import './styles.css'
import { useAxios } from '../../../Providers/AxiosProvider.js'
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GameService } from '../../../Services/Game.js';
import {getCurrentUserStatus} from '../../../Services/User.js'
import {getQuestionById} from '../../../Services/Question.js'

const QuestionPage =  () => {
    const axios = useAxios();
    const location = useLocation();
    const [answer, setAnswer] = useState("");
    const [question, setQuestion] = useState("");
    const [a, setA] = useState("");
    const [b, setB] = useState("");
    const [c, setC] = useState("");
    const [d, setD] = useState("");
    const [roundNumber, setRoundNumber] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(0);
    
    const answerQuestion = (text,letter) => {
        setAnswer(text);
        console.log('Submitting answer:',location.state.gameId,{roundNumber,questionNumber,text})
        GameService.submitAnswer(axios,location.state.gameId,{roundNumber,questionNumber,letter});
    };
    // Get Status from /User/Status should be called on a time out to get the current question number (1-3s)
    // get question by id from user/status (/question/questionid)

    // get new question or round info
    const getGameStatus = () => {
        getCurrentUserStatus(axios).then((data) => {
            console.log(data)
            if (data.game_status){
                setRoundNumber(data.game_status.round_number);
                setQuestionNumber(data.game_status.question_number);
                getQuestionById(axios, data.game_status.question_id).then((resp) => {
                    setQuestion(resp.question);
                    setA(resp.a);
                    setB(resp.b);
                    setC(resp.c);
                    setD(resp.d);
                });
            } else {
                console.error("Game Status is null:",data)
            }
        });
    };

    // Timeout to see if question has changed
    useEffect(() => {
        const interval = setInterval(() => {
          getGameStatus();
        }, 55000);
        return () => clearInterval(interval);
      }, []);


    return (
        <div>
            <div className='center'>
                <br />
                <h1 className='question-text'>Question {questionNumber}: {question}</h1>
                <br/>
                <div className='grid-container'>
                    <button onClick={()=>{answerQuestion(a,'a')}}>
                        <div className='grid-item'>A: {a}</div>
                    </button>
                    <button onClick={()=>{answerQuestion(b,'b')}}>
                        <div className='grid-item'>B: {b}</div>
                    </button>
                    <button onClick={()=>{answerQuestion(c,'c')}}>
                        <div className='grid-item'>C: {c}</div>
                    </button>
                    <button onClick={()=>{answerQuestion(d,'d')}}>
                        <div className='grid-item'>D: {d}</div>
                    </button>
                </div>
                Current Answer: <br/>
                {answer}
            </div>
            <hr/>
            <div className='margin-left'>
                <h3>Team Score: </h3>
            </div>
        </div>
    );
};
export default QuestionPage;