import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles.css'
import Deck from '../Decks/Deck/Deck.js'
import {getUserDecks} from '../../Services/User.js'
import { useUserSession } from '../../Providers/UserProvider';
import { useAxios } from '../../Providers/AxiosProvider';
import { getDeck } from '../../Services/Decks.js';
import { GameService } from '../../Services/Game.js';

const HostPage =  () => {
    const navigate = useNavigate();
    const axios = useAxios();
    const { user } = useUserSession();
    const [decks, setDecks] = useState([]);
    const [questionTime, setQuestionTime] = useState(30);

    useEffect(()=>{
        getUserDecks(axios, user.id).then((data)=>{
                setDecks(data);
            })
            .catch((error)=>{
                console.error(error);
            })
    }, [axios, user.id]);

    function startGame(deckId){
        GameService.createGame(axios,{deck_id:deckId,question_time_sec:20}).then((gameData)=>{
            navigate("/loading/"+gameData.join_code, { state: { gameId : gameData.id, joinCode : gameData.join_code, host:true } })
        })
    };

    function handleChange(){
        
    }

    return (
    <div className="hostpage">
        <div className="form-field">
            <label htmlFor="" className="form-label">
                Question Time:
            </label>
            <input
                type="text"
                id="question_time"
                name="question_time"
                value={questionTime}
                onChange={handleChange}
                placeholder="Enter desired quesiton time"
                aria-required="true"
                className="form-input"
            />
        </div>
        <h3>Select a Deck</h3>
        <div className="grid-container">
            {decks ? 
            decks.map((d) => (
            <div className='grid-item'>
                <button onClick={() => startGame(d.id)} className='no-underline'><Deck deck={d}/></button>
            </div>
            ))
            : <></>
            }
        </div>
    </div>
  );
}
export default HostPage;

const Host = () => {
    return (
        <div className="hostpage">
            <h1>Game!</h1>
        </div>
    );
} 
