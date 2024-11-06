import React from "react";
import { useState, useEffect, createContext } from "react";
import { redirect, useNavigate } from "react-router-dom";

const AuthContext = createContext(null, null, null);

export function useAuthSession() {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuthSession must be used within a AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(JSON.parse(token));
    }
  }, []);

  // const navigate = useNavigate();
  const setJwt = (token) => {
    setToken(token);
    // navigate('/account');
    };

  const clearJwt = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, setJwt, clearJwt }}>
      {children}
    </AuthContext.Provider>
  );
}