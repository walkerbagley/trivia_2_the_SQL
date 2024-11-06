import React, {useEffect, useState} from 'react'
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
        {allDecks ? 
        allDecks.map((deck) => (
            <Link to={`/decks/${deck.id}`} className='no-underline'><Deck deck={deck}/></Link>
          ))
        : <></>
        }
      </div>

      
    </div>
  );
}
export default Decks;