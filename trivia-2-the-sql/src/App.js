import React from 'react';
import Main from './Components/Main/Main.js'
import Host from './Components/Host/Host.js'
import Login from './Components/Login/Login.js'
import Decks from './Components/Decks/Decks.js'
import Account from './Components/Account/Account.js'

import Header from './Components/Header/Header.js'

import Parse from 'parse'
import {Routes, Route} from 'react-router-dom'

const App = () => {

    return (
      <div>
        <Header/>
        <Routes>
          <Route exact path='/' element={<Main/>}/>
          <Route exact path='/Host' element={<Host/>}/>
          <Route exact path='/Login' element={<Login/>}/>
          <Route exact path='/Decks' element={<Decks/>}/>
          <Route exact path='/Account' element={<Account/>}/>
        </Routes>
    
      </div>

    )
};

export default App;
