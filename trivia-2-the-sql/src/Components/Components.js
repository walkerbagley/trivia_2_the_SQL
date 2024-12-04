import {BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom";
import Header from './Header/Header.js';
import Main from './Main/Main.js'
import PreHost from './Host/Host.js'
import PrePlay from './Play/Play.js'
// import Login from './Login/Login.js'
import LoadingPage from "./Game/Loading/LoadingPage.js";
import QuestionPage from "./Game/Question/QuestionPage.js";
import Decks from './Decks/DecksPage.js'
import Account from './Account/Account.js'
import AuthForm from './Auth/AuthForm.js';
import AuthRegister from './Auth/AuthRegister.js';
import DeckDetails from './Decks/DeckDetails/DeckDetails.js';
import CreateDeck from './CreateDeck/CreateDeck.js';
import './styles.css';
import { useUserSession } from "../Providers/UserProvider.js";
import { useEffect } from "react";

export default function Components() {
    const { user } = useUserSession();

    useEffect(() => {}, [user]);
    
    if (user) {
        return (
            <Router>
                <Header/>
                <Routes>
                    <Route exact path='/' element={<Main/>}/>
                    <Route exact path='/host' element={<PreHost/>}/>
                    <Route exact path='/join' element={<PrePlay/>}/>
                    <Route exact path='/loading/:id' element={<LoadingPage/>}/>
                    <Route exact path='/play/:id' element={<QuestionPage/>}/>
                    <Route exact path='/decks' element={<Decks/>}/>
                    <Route path="/decks/:id" element={<DeckDetails />} />
                    <Route exact path='/create' element={<CreateDeck/>}/>
                    <Route exact path='/account' element={<Account/>}/>
                    <Route exact path = '/login' element={<Navigate to = "/"/>} />
                </Routes>
            </Router>
        );
    } else {
        return (
            <Router>
                <Header/>
                <Routes>
                    <Route path="/login" element={<AuthRegister/>} />
                    <Route path="*" element={<Navigate to = "/login"/>} />
                </Routes>
            </Router>
        )
    }
};