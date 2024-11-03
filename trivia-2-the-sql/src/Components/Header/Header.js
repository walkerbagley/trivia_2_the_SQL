import React from 'react'
import './styles.css'

import { useNavigate } from "react-router-dom";


const Header =  () => {
    const navigate = useNavigate();

    let login_button;
    let isLoggedIn = false;

    if (!isLoggedIn) {
        login_button = <button
                className="button-52"
                role="button"
                onClick={() => navigate('/Login')}>
                Login
        </button>;
    } else {
        login_button = <button
            className="button-52"
            role="button"
            onClick={() => navigate('/Account')}>
            Account
        </button>;
    }

    return (
    <nav className="navbar">
        <div className="title">Trivia 2: The SQL</div>
        <button
            className="button-52"
            role="button"
            onClick={() => navigate('/')}>
            Home Page
        </button>
        {login_button}
        
        <button
            className="button-52"
            role="button"
            onClick={() => navigate('/Decks')}>
            Decks
        </button>
    </nav>
  );
}
export default Header;