import React from 'react';
import Main from './Components/Main/Main.js'
import PreHost from './Components/Host/Host.js'
import PreGame from './Components/Play/Play.js'
import Login from './Components/Login/Login.js'
import Decks from './Components/Decks/Decks.js'
import Account from './Components/Account/Account.js'
import Header from './Components/Header/Header.js'
import AuthForm from './Components/Auth/AuthForm.js';
import AuthRegister from './Components/Auth/AuthRegister.js';
import Parse from 'parse'
import {Routes, Route} from 'react-router-dom'
import { useState } from 'react';

import './variables.css'

import { initializeParse } from '@parse/react';

initializeParse(
  'YOUR_SERVER_URL',
  'YOUR_APPLICATION_ID',
  'YOUR_JAVASCRIPT_KEY'
);

let isLoggedIn = false;

const App = () => {

    return (
      <div>
        <Header/>
        <Routes>
          <Route exact path='/' element={<Main/>}/>
          <Route exact path='/Host' element={<PreHost/>}/>
          <Route exact path='/Game' element={<PreGame/>}/>
          <Route exact path='/Login' element={<Login/>}/>
          <Route exact path='/Decks' element={<Decks/>}/>
          <Route exact path='/Account' element={<Account/>}/>
          {/* <Route path="/auth" element={<Auth />} /> */}
          <Route path="/register" element={<AuthRegister />} />
          {/* <Route path="/login" element={<AuthLogin />} /> */}
          {/* <Route path="*" element={<Navigate to="/auth" replace />} /> */}
        </Routes>
    
      </div>

    )
};

export default App;
