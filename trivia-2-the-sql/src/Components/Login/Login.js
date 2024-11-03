import React from 'react'
import './styles.css'
import ReactDOM from 'react-dom/client';

import AuthForm from '../Auth/AuthForm';
import AuthRegister from '../Auth/AuthRegister';

const Login =  () => {
    function login() {
        
    }
    return (
        <div className="loginpage">
            <AuthRegister/>
            {/* <form className="form" action={login}>
                <label className='username' for="username">Username: </label>
                <input className='username' type="text" id="username" name="username" required/>
                <label className='password' for="password">Password: </label>
                <input className='password' type="password" id="password" name="password" required/>
                <input className='button' type="submit" value="Submit"/>
            </form>  */}
        </div>
  );
}
export default Login;

