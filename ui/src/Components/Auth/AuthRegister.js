import { useEffect, useState } from "react";
import AuthForm from "./AuthForm.js";
import "./styles.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthSession } from "../../Providers/AuthProvider.js";
import { useUserSession } from "../../Providers/UserProvider.js";

const AuthRegister = () => {
  const navigate = useNavigate();
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const { login, register } = useAuthSession();
  const { user } = useUserSession();
  
  const [signup, setSignup] = useState(false);
  const [add, setAdd] = useState(false);
  
  useEffect(() => {
    if (newUser && add) {
      if (signup) {
        register(newUser)
          .then(() => {
            toast.success("Registration successful!");
          })
          .catch((error) => {
            if (error.response?.status === 409) {
              toast.error("Username already exists");
            } else {
              console.error(error);
              toast.error("Failed to register");
            }          
          });
      } else {
        login(newUser)
          .then(() => {
            toast.success("Login successful!");
          })
          .catch((error) => { 
            console.error(error);
            toast.error("Failed to login");
          });
      }
      setAdd(false);
    }
  }, [newUser, add, signup, login, register]);

  useEffect(() => {
    if (user) {
      navigate('/account');
    }
  }, [user, navigate]);

  const onChangeHandler = (e) => {
    e.preventDefault();
    const { name, value: newValue } = e.target;
    setNewUser({ ...newUser, [name]: newValue });
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    setAdd(true);
  };

  return (
    <div className="authpage">
      <div className="container">
        <div className="togglecontainer">
          <div 
            onClick={() => setSignup(false)} 
            className={`btn ${signup ? '' : 'active'}`}
          >
            Login
          </div>
          <div 
            onClick={() => setSignup(true)} 
            className={`btn ${signup ? 'active' : ''}`}
          >
            Register
          </div>
        </div>
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