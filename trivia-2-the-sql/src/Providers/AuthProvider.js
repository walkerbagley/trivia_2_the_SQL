import React from "react";
import { useState, useEffect, createContext } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { useAxios } from "./AxiosProvider";

const AuthContext = createContext(null, null, null);

export function useAuthSession() {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuthSession must be used within a AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
  const axios = useAxios();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(JSON.parse(token));
    }
  }, []);

  const login = async ({username, password}) => {
    return axios.post("/auth/login", { username, password })
            .then((response) => {
                setToken(response.data.token);
                localStorage.setItem("token", JSON.stringify(response.data.token));
            })
            .catch((error) => {
                console.error("Failed to login:", error);
                return Promise.reject(error);
            });
          };

  const register = ({username, password}) => {
    return axios.post("/auth/register", { username, password })
            .then((response) => {
                setToken(response.data.token);
                localStorage.setItem("token", JSON.stringify(response.data.token));
            })
            .catch((error) => {
                console.error("Failed to register:", error);
                return Promise.reject(error);
            });
    };

  const logout = () => {
      setToken(null);
      localStorage.removeItem("token");
  };


  return (
    <AuthContext.Provider value={{ token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}