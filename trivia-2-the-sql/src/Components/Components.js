import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Header from './Header/Header.js';
import Main from './Main/Main.js'
import PreHost from './Host/Host.js'
import PrePlay from './Play/Play.js'
import Login from './Login/Login.js'
import Decks from './Decks/DecksPage.js'
import Account from './Account/Account.js'
import AuthForm from './Auth/AuthForm.js';
import AuthRegister from './Auth/AuthRegister.js';
import DeckDetails from './Decks/DeckDetails/DeckDetails.js';
import CreateDeck from './CreateDeck/CreateDeck.js';
import './styles.css';
import { AuthProvider } from "../Providers/AuthProvider.js";
import { AxiosProvider } from "../Providers/AxiosProvider.js";

export default function Components() {
    return (
        <AuthProvider>
            <AxiosProvider>
                <Router>
                    <Header/>
                    <Routes>
                        <Route exact path='/' element={<Main/>}/>
                        <Route exact path='/host' element={<PreHost/>}/>
                        <Route exact path='/play' element={<PrePlay/>}/>
                        <Route exact path='/login' element={<Login/>}/>
                        <Route exact path='/decks' element={<Decks/>}/>
                        <Route path="/decks/:id" element={<DeckDetails />} />
                        <Route exact path='/create' element={<CreateDeck/>}/>
                        <Route exact path='/account' element={<Account/>}/>
                        {/* <Route path="/auth" element={<Auth />} /> */}
                        <Route path="/register" element={<AuthRegister />} />
                        {/* <Route path="/login" element={<AuthLogin />} /> */}
                        {/* <Route path="*" element={<Navigate to="/auth" replace />} /> */}
                    </Routes>
                </Router>
            </AxiosProvider>
        </AuthProvider>
        
    );
};