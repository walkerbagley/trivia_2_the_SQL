import React from "react";
import { useState, useEffect, createContext } from "react";
import { useAxios } from "./AxiosProvider";

const AuthContext = createContext(null);

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
  const [supabaseToken, setSupabaseToken] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Load tokens from localStorage on mount
    const storedToken = localStorage.getItem("fastapi_token");
    const storedSupabaseToken = localStorage.getItem("supabase_token");
    const storedUserId = localStorage.getItem("user_id");
    
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedSupabaseToken) {
      setSupabaseToken(storedSupabaseToken);
    }
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const login = async ({username, password}) => {
    return axios.post("/auth/login", { username, password })
      .then((response) => {
        // Store both tokens
        const { fastapi_token, supabase_token, refresh_token, id } = response.data;
        
        setToken(fastapi_token);
        setSupabaseToken(supabase_token);
        setUserId(id);
        
        localStorage.setItem("fastapi_token", fastapi_token);
        localStorage.setItem("supabase_token", supabase_token);
        localStorage.setItem("supabase_refresh_token", refresh_token);
        localStorage.setItem("user_id", id);
        
        // Trigger Supabase provider to update
        window.dispatchEvent(new Event('supabase-token-updated'));
        
        return response.data;
      })
      .catch((error) => {
        console.error("Failed to login:", error);
        return Promise.reject(error);
      });
  };

  const register = ({username, password}) => {
    return axios.post("/auth/register", { username, password })
      .then((response) => {
        // Store both tokens
        const { fastapi_token, supabase_token, refresh_token, id } = response.data;
        
        setToken(fastapi_token);
        setSupabaseToken(supabase_token);
        setUserId(id);
        
        localStorage.setItem("fastapi_token", fastapi_token);
        localStorage.setItem("supabase_token", supabase_token);
        localStorage.setItem("supabase_refresh_token", refresh_token);
        localStorage.setItem("user_id", id);
        
        // Trigger Supabase provider to update
        window.dispatchEvent(new Event('supabase-token-updated'));
        
        return response.data;
      })
      .catch((error) => {
        console.error("Failed to register:", error);
        return Promise.reject(error);
      });
  };

  const logout = () => {
    setToken(null);
    setSupabaseToken(null);
    setUserId(null);
    
    localStorage.removeItem("fastapi_token");
    localStorage.removeItem("supabase_token");
    localStorage.removeItem("supabase_refresh_token");
    localStorage.removeItem("user_id");
    
    // Trigger Supabase provider to clear
    window.dispatchEvent(new Event('supabase-token-updated'));
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      supabaseToken, 
      userId,
      login, 
      logout, 
      register 
    }}>
      {children}
    </AuthContext.Provider>
  );
}