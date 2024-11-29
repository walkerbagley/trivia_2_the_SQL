import React from 'react'
import './styles.css'
import { useAxios } from '../../Providers/AxiosProvider.js';
import { useState, useEffect } from 'react';
import { GameService } from '../../../Services/Game';

const QuestionPage =  () => {
    const axios = useAxios();
    const [answer, setAnswer] = useState("");
    const [roundNumber, setRoundNumber] = useState(0);
    const [questionNumber, setquestionNumber] = useState(0);

    const answerQuestion = (text) => {
        setAnswer(text);
        // GameService.submitAnswer(axios,gameId,{roundNumber,questionNumber,text});
    };

    return (
        <div>
            <div className='center'>
                <br />
                <h1 className='question-text'>Question</h1>
                <br/>
                <div className='grid-container'>
                    <div className='grid-item'>
                        <button>A: {}</button>
                    </div>
                    <div className='grid-item'>
                        <button>B: {}</button>
                    </div>
                    <div className='grid-item'>
                        <button>C: {}</button>
                    </div>
                    <div className='grid-item'>
                        <button>D: {}</button>
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