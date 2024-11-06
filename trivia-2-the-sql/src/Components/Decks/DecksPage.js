import React, {useEffect, useState} from 'react'
import './styles.css'
import Deck from './Deck/Deck.js'
import { Link, useNavigate } from 'react-router-dom'
import { getAllDecks } from '../../Services/Decks.js'

const Decks =  () => {
    const navigate = useNavigate();

    const goToDeckDetails = (deck) => {
        navigate(`/decks/${deck.id}`,{state: {deck:deck}});
        console.log('auto nav')
    };

    const [allDecks, setAllDecks] = useState([]);

    useEffect(() => {
      const fetchDecks = async () => {
        try {
          const ds = await getAllDecks();
          setAllDecks(ds);
        } catch (error) {
          console.error("Failed to fetch decks:", error);
        }
      };

      fetchDecks();
    }, []);


    return (
    <div className="deckspage">
      <h1>Deck List</h1>
      <Link to={'/create'} className='no-underline'><button>Create Deck</button></Link>
      <div className="grid-container">
        {allDecks ? 
        allDecks.map((deck) => (
            <button onClick={goToDeckDetails(deck)} className='no-underline'><Deck deck={deck}/></button>
          ))
        : <></>
        }
      </div>

      
    </div>
  );
}
export default Decks;