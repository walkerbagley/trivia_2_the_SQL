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
        <h2>Choose Deck: </h2>
        <button class='hostbutton'>Random</button>
        <button class='hostbutton'>Browze Personal Decks</button>
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
