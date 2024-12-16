import React, {useEffect, useState} from 'react'
import './styles.css'
import Deck from './Deck/Deck.js'
import { Link, useNavigate } from 'react-router-dom'
import { getAllDecks } from '../../Services/Decks.js'
import { useAxios } from '../../Providers/AxiosProvider.js'
import { useUserSession } from "../../Providers/UserProvider.js";
import { getUserDecks } from '../../Services/User.js'
import { all } from 'axios'



const Decks =  () => {
    const { user } = useUserSession();
    const axios = useAxios();
    const navigate = useNavigate();
    const [allDecks, setAllDecks] = useState([]);
    const [userDecks, setUserDecks] = useState([]);
    const [filter, setFilter] = useState(false);
    const [decks, setDecks] = useState([]);

    const goToDeckDetails = (deck) => {
      navigate(`/decks/${deck.id}`,{state: {deck:deck.id, filter:filter}});
  };

  const fetchDecks = async () => {
    getAllDecks(axios).then((value) => {
      setAllDecks(value)
    }).catch((error) => {
      console.log("failed to get all decks", error)
    }) 
  };

  const fetchUserDecks = async () => {
    getUserDecks(axios, user.id).then((value) => {
      setUserDecks(value)
    }).catch((error) => {
      console.log("failed to get user decks", error)
    }) 
  };

    useEffect(() => {
      fetchDecks()
      fetchUserDecks()
    }, []);

    useEffect(() => {
      if (filter) {
        setDecks(userDecks)
      } else {
        setDecks(allDecks)
      }
    }, [filter, allDecks, userDecks]);


    return (
    <div className="deckspage">
      <div className='filter-decks-buttons'>
        <button onClick={()=>{setFilter(true)}} style={{backgroundColor: filter ? "var(--accent1)" : "var(--main-background-color)", color: filter ? "var(--main-background-color)" : "var(--accent1)"}}>My Decks</button>
        <button onClick={()=>{setFilter(false)}} style={{backgroundColor: filter ? "var(--main-background-color)" : "var(--accent1)", color: filter ? "var(--accent1)" : "var(--main-background-color)"}}>All Decks</button>
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