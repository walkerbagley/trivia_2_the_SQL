import React from 'react'
import './styles.css'

const PreHost =  () => {
    function getGameID () {
        const result = Math.random().toString(36).substring(2,7);
        return result
    }

    function getRandomDeck(category) {

    }
    return (
    <div className="hostpage">
        <h1>Your Game ID: {getGameID()}</h1>
        <div className="buttons">
            <h2>Choose Deck: </h2>
            <button className='button-52'>Random</button>
            <button className='button-52'>Browse Personal Decks</button>
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
