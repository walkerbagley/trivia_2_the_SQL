import React, { useState } from 'react'
import './styles.css'

import { useNavigate } from "react-router-dom";
import { useAuthSession } from '../../Providers/AuthProvider.js';
import { useUserSession } from '../../Providers/UserProvider.js';


const Header =  () => {
    const navigate = useNavigate();
    const { logout } = useAuthSession();
    const { user } = useUserSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

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
                <button 
                    className="mobile-menu-toggle"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle mobile menu"
                >
                    ☰
                </button>
                <div className={`navbuttons ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    <button
                        className="button-52"
                        role="button"
                        onClick={() => {
                            navigate('/');
                            setMobileMenuOpen(false);
                        }}>
                        Home Page
                    </button>
                    <button
                        className="button-52"
                        role="button"
                        onClick={() => {
                            navigate('/Decks');
                            setMobileMenuOpen(false);
                        }}>
                        Decks
                    </button>
                    <button
                        className="button-52"
                        role="button"
                        onClick={() => {
                            navigate('/Account');
                            setMobileMenuOpen(false);
                        }}>
                        Account
                    </button>
                    <button
                        className="button-52"
                        role="button"
                        onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                        }}>
                        Logout
                    </button>
                </div>
            </nav>
          );
    }
}
export default Header;