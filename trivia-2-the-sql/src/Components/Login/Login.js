import React from 'react'
import './styles.css'
import ReactDOM from 'react-dom/client';

const Login =  () => {
    function login() {
        
    }
    return (
        <div class="loginpage">
            <form class="form" action={login}>
                <label class='username' for="username">Username: </label>
                <input class='username' type="text" id="username" name="username" required/>
                <label class='password' for="password">Password: </label>
                <input class='password' type="password" id="password" name="password" required/>
                <input class='button' type="submit" value="Submit"/>
            </form>
        </div>
  );
}
export default Login;

