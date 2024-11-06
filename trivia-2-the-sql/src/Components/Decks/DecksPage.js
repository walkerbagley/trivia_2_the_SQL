import React from 'react'
import './styles.css'
import Deck from './Deck/Deck.js'
import { Link } from 'react-router-dom'
import { getAllDecks } from '../../Services/Decks.js'

let decklist = [1,2,3,4,5]

const Decks =  () => {
    const allDecks = getAllDecks();
    return (
    <div className="deckspage">
      <h1>Deck List</h1>
      <Link to={'/create'} className='no-underline'><button>Create Deck</button></Link>
      <div className="grid-container">
        {decklist.map((id) => (
            <Link to={`/decks/${id}`} className='no-underline'><Deck/></Link>
          ))}
      </div>

      
    </div>
  );
}
export default Decks;