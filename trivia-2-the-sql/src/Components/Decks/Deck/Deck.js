import React from 'react'
import './styles.css'

const Deck =  (deckID) => {
    let deckName = "deck"
    let description = "description"
    return (
      <div className="deckbox grid-item">
        <h1 className="title">{deckName}</h1>
        <h3 className="description">{description}</h3>
      </div>
  );
}
export default Deck;