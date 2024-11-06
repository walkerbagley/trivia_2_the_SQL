import React, { useEffect } from 'react'
import './styles.css'
import Deck from '../Decks/Deck/Deck.js'


import { useUserSession } from '../../Providers/UserProvider';
import { useAxios } from '../../Providers/AxiosProvider';

const PreHost =  () => {
    const { user } = useUserSession();
    const axios = useAxios();

    const [decks, setDecks] = React.useState([]);

    function getGameID () {
        const result = Math.random().toString(36).substring(2,7);
        return result
    }

    function getRandomDeck(category) {

    }

    useEffect(() => {
        getDecks();
    }, []);

    function getDecks() {
        axios.get('/user/' + user + '/deck/').then((response) => {
            setDecks(response.data);
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
    <div className="hostpage">
        <h1>Your Game ID: {getGameID()}</h1>
        <div className="buttons">
            <h2>Choose Deck: </h2>
            {decks ? 
                decks.map((deck) => (
                    <Deck deck={deck}/>
                ))
                : <></>
            }
        </div>
    </div>
  );
}
export default PreHost;

const Host = () => {
    return (
        <div className="hostpage">
            <h1>Game!</h1>
        </div>
    );
} 
