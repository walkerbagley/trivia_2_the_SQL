import React from 'react'
import './styles.css'

const Deck =  (deck) => {
    return (
      <div className="deckbox grid-item">
        <h1 className="title">{deck.deck['name']}</h1>
        <h3 className="description">{deck.deck['description']}</h3>
      </div>
  );
}
export default Deck;