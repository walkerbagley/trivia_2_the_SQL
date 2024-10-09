import React from 'react'
import './styles.css'

import { useNavigate } from "react-router-dom";

const Header =  () => {
    const navigate = useNavigate();
    return (
    <div class="navbar">
        <div class="title">Trivia 2: The SQL</div>
        <button
            class="button-52"
            role="button"
            onClick={() => navigate('../Main')}>
            Home Page
        </button>
        <button
            class="button-52"
            role="button"
            onClick={() => navigate('../Login')}>
            Login
        </button>
        <button
            class="button-52"
            role="button"
            onClick={() => navigate('../Account')}>
            Account
        </button>
        <button
            class="button-52"
            role="button"
            onClick={() => navigate('../Decks')}>
            Decks
        </button>
    </div>
  );
}
export default Header;