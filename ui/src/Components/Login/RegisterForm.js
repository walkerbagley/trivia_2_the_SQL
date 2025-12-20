import React from 'react'
import './styles.css'

import AuthForm from '../Auth/AuthForm';
import AuthRegister from '../Auth/AuthRegister';

const RegisterForm  =  () => {
    return (
    <div className="loginpage">
        <AuthRegister/>
    </div>
    )
    }

export default RegisterForm;