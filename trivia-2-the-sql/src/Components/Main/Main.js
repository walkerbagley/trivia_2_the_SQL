import React from 'react'
import './styles.css'

import { useNavigate } from "react-router-dom";

const Main =  () => {
    const navigate = useNavigate();
    return (
    <div class="titlepage">
        <div class="maintitle">Trivia 2: The SQL</div>
        <div class="buttons">
            <button
                class="button-52"
                onClick={() => navigate('../Main')}>
                Join Game
            </button>
            <button
                class="button-52"
                onClick={() => navigate('/Host')}>
                Host Game
            </button>
        </div>
    </div>
  );
}
export default Main;