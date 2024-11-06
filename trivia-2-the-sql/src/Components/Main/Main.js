import React from 'react'
import './styles.css'
import { useNavigate } from "react-router-dom";
import { getAllDecks } from '../../Services/Decks';


const Main =  () => {
    const navigate = useNavigate();
    return (
    <div className="titlepage">
        <div className="maintitle">Trivia 2: The SQL</div>
        <div className="buttons">
            <button
                className="button-52"
                onClick={() => navigate('/Play')}>
                Join Game
            </button>
            <button
                className="button-52"
                onClick={() => navigate('/Host')}>
                Host Game
            </button>
            <button
                className="button-52"
                onClick={() => getAllDecks()}>
                Test
            </button>
        </div>
    </div>
  );
}
export default Main;
