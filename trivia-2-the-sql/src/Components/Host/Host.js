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
    const [joinCode, setJoinCode] = useState("")

    console.log(user)

    useEffect(()=>{
        setJoinCode(Math.random().toString(36).substring(2,7));

        getDeck(axios,"3997285c-9a02-4a96-a022-0312971d7a5b").then((data)=>{
                console.log('Deck Pulled: ',data)
                setDecks([data]);
            })
            .catch((error)=>{
                console.error(error);
            })

        // getUserDecks(axios, user.id).then((data)=>{
        //         console.log('Hosts decks: ',data)
        //         setDecks(data);
        //     })
        //     .catch((error)=>{
        //         console.error(error);
        //     })
    }, [axios, user.id]);

    function startGame(deckId){
        GameService.createGame(axios,{deck_id:deckId,question_time_sec:20}).then((gameData)=>{
            console.log('Game Created!',gameData)
            navigate("/loading/"+joinCode, { state: { gameId : gameData.id, joinCode : joinCode } })
        })
    };

    return (
    <div className="hostpage">
        <div>Your Join Code: {joinCode}</div>
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
