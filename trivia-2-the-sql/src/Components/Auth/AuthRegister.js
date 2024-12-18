import React, { useEffect, useState } from "react";
import { User, createUser } from "./AuthService.js";
import AuthForm from "./AuthForm.js";
import "./styles.css";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useAuthSession } from "../../Providers/AuthProvider.js";
import { useUserSession } from "../../Providers/UserProvider.js";


const AuthRegister = () => {
  const navigate = useNavigate();
  const [newUser, setNewUser] = useState(new User('', ''));
  const { login, register } = useAuthSession();
  const { user } = useUserSession();
  
  // flag
  const [signup, setSignup] = useState(false);
  const [add, setAdd] = useState(false);
  
  useEffect(() => {
    if (newUser && add) {
      if (signup) {
        register(newUser).catch((error) => {
          if (error.status === 409) {
            toast.error("Username already exists");
          } else {
            console.log(error);
            toast.error("Failed to register");
          }          
        });
      }
      if (!signup) {
        login(newUser).catch((error) => { 
          console.log(error);
          toast.error("Failed to login");
        });
      }
      setAdd(false);
    }
  }, [newUser, add, signup]);

  useEffect(() => {
    if (user) {
      navigate('/account');
    }
  }, [user]);

  const onChangeHandler = (e) => {
    e.preventDefault();
    const { name, value: newValue } = e.target; //object destructuring?
    setNewUser({ ...newUser, [name]: newValue }); //spread operator to append attributes to obj
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    setAdd(true);
  };

  return (
    <div className = "authpage">
      <div className="container">
        <div className="togglecontainer">
          <div onClick={() => setSignup(false)} className={`btn ${signup ? '' : 'active'}`}>Login</div>
          <div onClick={() => setSignup(true)} className={`btn ${signup ? 'active' : ''}`}>Register</div>
        </div>
        <ToastContainer />
        <AuthForm
          user={newUser}
          onChange={onChangeHandler}
          onSubmit={onSubmitHandler}
        />
      </div>
    </div>
  );
};
export default AuthRegister;