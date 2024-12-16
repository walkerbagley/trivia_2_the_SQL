import React, {useEffect, useState} from 'react'
import './styles.css'
import Deck from './Deck/Deck.js'
import { Link, useNavigate } from 'react-router-dom'
import { getAllDecks } from '../../Services/Decks.js'
import { useAxios } from '../../Providers/AxiosProvider.js'
import { useUserSession } from "../../Providers/UserProvider.js";



const Decks =  () => {
    const { user } = useUserSession();
    const axios = useAxios();
    const navigate = useNavigate();

    const goToDeckDetails = (deck) => {
        navigate(`/decks/${deck.id}`,{state: {deck:deck.id}});
    };

    const [allDecks, setAllDecks] = useState([]);
    const [decks, setDecks] = useState([]);
    const [filter, setFilter] = useState(false);

    useEffect(() => {
      const fetchDecks = async () => {
        try {
          const ds = await getAllDecks(axios);
          setAllDecks(ds);
          setDecks(ds);
        } catch (error) {
          console.error("Failed to fetch decks:", error);
        }
      };

      fetchDecks();
    }, []);

    useEffect(() => {
      if (filter) {
        setDecks(allDecks.filter(deck => deck.owner_id === user.id));
      } else {
        setDecks(allDecks);
      }
      
    }, [filter])

    return (
    <div className="deckspage">
      <div className='filter-decks-buttons'>
        <button onClick={()=>{setFilter(true)}} style={{backgroundColor: filter ? "var(--accent1)" : "var(--main-background-color)"}}>My Decks</button>
        <button onClick={()=>{setFilter(false)}} style={{backgroundColor: filter ? "var(--main-background-color)" : "var(--accent1)"}}>All Decks</button>
      </div>
      <h1>Deck List</h1>
      <Link to={'/create'} className='no-underline'><button>Create Deck</button></Link>
      <div className="grid-container">
        {decks ? 
        decks.map((deck) => (
          <div className='deck-item' key={deck.id}>
            <button onClick={() => goToDeckDetails(deck)} className='no-underline'><Deck deck={deck}/></button>
          </div>
          ))
        : <></>
        };
      </div>

      
    </div>
  );
}
export default Decks;