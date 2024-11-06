import React, { useEffect, useState } from "react";
import { User, createUser, loginUser } from "./AuthService.js";
import AuthForm from "./AuthForm.js";
import "./styles.css";
import { useAuthSession } from "../../Providers/AuthProvider.js";
import { redirect, useNavigate } from "react-router-dom";

const AuthRegister = () => {
  const navigate = useNavigate();
  const [newUser, setNewUser] = useState(new User('', ''));
  const { token, setJwt, clearJwt } = useAuthSession();
  // flag
  const [signup, setSignup] = useState(false);
  const [add, setAdd] = useState(false);
  
  useEffect(() => {
    if (newUser && add) {
      if (signup) {
        const response = createUser(newUser);
        console.log(response);
      }
      if (!signup) {
        loginUser(newUser).then((response) => {
          setJwt(response.data.token);
          // navigate("/account");
          // console.log(response.data.token);
        });
      }
      setAdd(false);
    }
  }, [newUser, add, signup]);

  useEffect(() => {
    if (token) {
      navigate('/account');
    }
  }, [token]);

  const onChangeHandler = (e) => {
    e.preventDefault();
    // console.log(e.target);
    const { name, value: newValue } = e.target; //object destructuring?
    // console.log(newValue);
    setNewUser({ ...newUser, [name]: newValue }); //spread operator to append attributes to obj
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    setAdd(true);
  };

  return (
    <div className="container">
      <div className="togglecontainer">
        <div onClick={() => setSignup(false)} className={`btn ${signup ? '' : 'active'}`}>Login</div>
        <div onClick={() => setSignup(true)} className={`btn ${signup ? 'active' : ''}`}>Register</div>
      </div>
      <AuthForm
        user={newUser}
        onChange={onChangeHandler}
        onSubmit={onSubmitHandler}
      />
    </div>
  );
};
export default AuthRegister;