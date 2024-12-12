import React from 'react'
import './styles.css'

import { useNavigate } from "react-router-dom";
import { useAuthSession } from '../../Providers/AuthProvider.js';
import { useUserSession } from '../../Providers/UserProvider.js';


const Header =  () => {
    const navigate = useNavigate();
    const { logout } = useAuthSession();
    const { user } = useUserSession();

    if (!user) {
        return (
            <nav className="navbar">
                <div className="title">Trivia 2: The SQL</div>
            </nav>
          );
    } else {
        return (
            <nav className="navbar">
                <h2>Trivia 2: The SQL</h2>
                <div className='navbuttons'>
                    <button
                        className="button-52"
                        role="button"
                        onClick={() => navigate('/')}>
                        Home Page
                    </button>
                    <button
                        className="button-52"
                        role="button"
                        onClick={() => navigate('/Decks')}>
                        Decks
                    </button>
                    <button
                        className="button-52"
                        role="button"
                        onClick={() => navigate('/Account')}>
                        Account
                    </button>
                    <button
                        className="button-52"
                        role="button"
                        onClick={() => logout()}>
                        Logout
                    </button>
                </div>
            </nav>
          );
    }
}
export default Header;