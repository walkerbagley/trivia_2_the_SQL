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
    <div class="hostpage">
        <h1>Your Game ID: {getGameID()}</h1>
        <div class="buttons">
            <h2>Choose Deck: </h2>
            <button class='button-52'>Random</button>
            <button class='button-52'>Browze Personal Decks</button>
        </div>
    </div>
  );
}
export default PreHost;

const Host = () => {
    return (
        <div class="hostpage">
            <h1>Game!</h1>
        </div>
    );
} 
