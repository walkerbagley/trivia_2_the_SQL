import React, {useEffect, useState} from 'react';
// import { useParams } from 'react-router-dom';
import './styles.css';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getDeckQuestions, getDeck } from '../../../Services/Decks';
import { useAxios } from '../../../Providers/AxiosProvider.js'
import { useUserSession } from "../../../Providers/UserProvider.js";
import { addUserDeck, removeUserDeck } from '../../../Services/User.js';


const DeckDetails =  () => {
  const { user } = useUserSession();
  const axios = useAxios(); 
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation(); 

  // const { deckId } = location.state || { deck: 'default value' };
  // const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [deck, setDeck] = useState({});

    useEffect(() => {
      const fetchDeck = async () => {
        try {
          const deck = await getDeck(axios, params.id);
          setDeck(deck);

          const qs = await getDeckQuestions(axios, deck.id);
          setQuestions(qs);
        } catch (error) {
          console.error("Failed to fetch questions:", error);
        }
      };

      fetchDeck();
    }, []);

    const addToUserDecks = async () => {
        addUserDeck(axios, user.id, deck.id).then((ud)=>{
               console.log('added to userDecks:', ud)
            }).catch((error)=>{
              console.error(error);
        })
      }

    const removeFromUserDecks = async () => {
      removeUserDeck(axios, user.id, deck.id).then(()=>{
        console.log('removed from userDecks')
     }).catch((error)=>{
       console.error(error);
    })
    }

  const goBack = () => {
    navigate("/decks");
  }

  let addOrRemoveButton;
  if (!location.state.filter) {
    addOrRemoveButton = <button className='add-userdeck-btn' onClick={() => addToUserDecks()}>Add to my decks</button>
  } 
  else {
    addOrRemoveButton = <button className='add-userdeck-btn' onClick={() => removeFromUserDecks()}>Remove from my decks</button>
  }

  return (
    <div className="page">
      <button onClick={() => goBack()} className='backbutton'>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 74 74"
          height="34"
          width="34"
          >
          <circle stroke-width="3" stroke="black" r="35.5" cy="37" cx="37"></circle>
          <g transform="scale(-1, 1) translate(-75, 0)">
          <path
              fill="black"
              d="M25 35.5C24.1716 35.5 23.5 36.1716 23.5 37C23.5 37.8284 24.1716 38.5 25 38.5V35.5ZM49.0607 38.0607C49.6464 37.4749 49.6464 36.5251 49.0607 35.9393L39.5147 26.3934C38.9289 25.8076 37.9792 25.8076 37.3934 26.3934C36.8076 26.9792 36.8076 27.9289 37.3934 28.5147L45.8787 37L37.3934 45.4853C36.8076 46.0711 36.8076 47.0208 37.3934 47.6066C37.9792 48.1924 38.9289 48.1924 39.5147 47.6066L49.0607 38.0607ZM25 38.5L48 38.5V35.5L25 35.5V38.5Z"
          ></path>
          </g>
        </svg>
            <span>Go Back</span>
      </button>
      <h1>{deck.name}</h1>
      <h5>Deck #{deck.id}</h5>
      <h3>{deck.description}</h3>
      {addOrRemoveButton}
      <h2>Questions</h2>
      <ol className='questionlist'>
        {
          questions ? 
          questions.map((question) => (
            <li>
              <div className='question'>
                {question?.question}
              </div>
            </li>
          ))
          : <></>
        }
      </ol>
    </div>
  );
}
export default DeckDetails;