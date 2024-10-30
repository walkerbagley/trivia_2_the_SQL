import React from 'react'
import './styles.css'

const Deck =  (deckID) => {
    let deckName = "deck"
    let description = "description"
    return (
      <div class="deckbox">
        <h1 class="title">{deckName}</h1>
        <hr></hr>
        <h3 class="description">{description}</h3>
      </div>
  );
}
export default Deck;