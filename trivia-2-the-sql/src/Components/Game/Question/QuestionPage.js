import React from 'react'
import './styles.css'
import { useAxios } from '../../Providers/AxiosProvider.js';
import { useState, useEffect } from 'react';
import { GameService } from '../../../Services/Game.js';
import {getCurrentUserStatus} from '../../../Services/User.js'
import {getQuestionById} from '../../../Services/Question.js'

const QuestionPage =  (gameId) => {
    const axios = useAxios();
    const gameId = gameId;
    const [answer, setAnswer] = useState("");
    const [question, setQuestion] = useState("");
    const [a, setA] = useState("");
    const [b, setB] = useState("");
    const [c, setC] = useState("");
    const [d, setD] = useState("");
    const [roundNumber, setRoundNumber] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(0);
    
    const answerQuestion = (text) => {
        setAnswer(text);
        GameService.submitAnswer(axios,gameId,{roundNumber,questionNumber,text});
    };
    // Get Status from /User/Status should be called on a time out to get the current question number (1-3s)
    // get question by id from user/status (/question/questionid)

    // get new question or round info
    const getGameStatus = () => {
        getCurrentUserStatus(axios).then((data) => {
            setRoundNumber(data.game_status.round_number);
            setQuestionNumber(data.game_status.question_number);
            getQuestionById(axios, data.game_status.question_id).then((resp) => {
                setQuestion(resp.question);
                setA(resp.a);
                setB(resp.b);
                setC(resp.c);
                setD(resp.d);
            });
        });
    };

    // Timeout to see if question has changed
    useEffect(() => {
        const interval = setInterval(() => {
          getGameStatus();
        }, 2000);
        return () => clearInterval(interval);
      }, []);


    return (
        <div>
            <div className='center'>
                <br />
                <h1 className='question-text'>Question {questionNumber}: {question}</h1>
                <br/>
                <div className='grid-container'>
                    <div className='grid-item'>
                        <button onClick={()=>{answerQuestion(a)}}>A: {a}</button>
                    </div>
                    <div className='grid-item'>
                        <button onClick={()=>{answerQuestion(b)}}>B: {b}</button>
                    </div>
                    <div className='grid-item'>
                        <button onClick={()=>{answerQuestion(c)}}>C: {c}</button>
                    </div>
                    <div className='grid-item'>
                        <button onClick={()=>{answerQuestion(d)}}>D: {d}</button>
                    </div>
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