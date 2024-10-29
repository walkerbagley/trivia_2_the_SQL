import React from 'react'
import './styles.css'

import { useNavigate } from "react-router-dom";

const Header =  () => {
    const navigate = useNavigate();
    return (
    <nav class="navbar">
        <div class="title">Trivia 2: The SQL</div>
        <button
            class="button-52"
            role="button"
            onClick={() => navigate('/')}>
            Home Page
        </button>
        <button
            class="button-52"
            role="button"
            onClick={() => navigate('/Login')}>
            Login
        </button>
        <button
            class="button-52"
            role="button"
            onClick={() => navigate('/Account')}>
            Account
        </button>
        <button
            class="button-52"
            role="button"
            onClick={() => navigate('/Decks')}>
            Decks
        </button>
    </nav>
  );
}
export default Header;