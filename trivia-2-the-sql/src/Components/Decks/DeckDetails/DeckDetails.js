import React, {useEffect, useState} from 'react';
// import { useParams } from 'react-router-dom';
import './styles.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { getQuestions } from '../../../Services/Decks';

const DeckDetails =  () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { deck } = location.state || { deck: 'default value' };
  // const { id } = useParams();

  const [questions, setQuestions] = useState([]);

    useEffect(() => {
      const fetchDecks = async () => {
        try {
          const qs = await getQuestions();
          setQuestions(qs);
        } catch (error) {
          console.error("Failed to fetch questions:", error);
        }
      };

      fetchDecks();
    }, []);

  const goBack = () => {
    navigate("/decks");
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
      <h2>Questions</h2>
      <ol>
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
        <li>
          <div className='question'>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </div>
        </li>
      </ol>
    </div>
  );
}
export default DeckDetails;