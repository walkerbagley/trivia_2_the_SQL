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
            navigate("/loading/"+gameData.join_code, { state: { gameId : gameData.id, joinCode : gameData.join_code } })
        })
    };

    return (
    <div className="hostpage">
        <div>Enter Question Time: </div>
        <div>Choose Deck: </div>
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
