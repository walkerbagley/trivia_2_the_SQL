import { createContext, useContext } from 'react';
import axios from 'axios';

const baseURL = `http://${process.env.REACT_APP_API_HOST ?? 'localhost'}:${process.env.REACT_APP_API_PORT ?? 8000}`;
console.log("API Base URL:", baseURL);

const AxiosContext = createContext(null);

export const AxiosProvider = ({ children }) => {
  const axiosInstance = axios.create({
    baseURL: baseURL, 
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add token from localStorage to every request
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('fastapi_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle 401 errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.log("Unauthorized - clearing tokens");
        localStorage.removeItem("fastapi_token");
        localStorage.removeItem("supabase_token");
        localStorage.removeItem("supabase_refresh_token");
        localStorage.removeItem("user_id");
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  )

  return (
    <AxiosContext.Provider value={axiosInstance}>
      {children}
    </AxiosContext.Provider>
  );
};

export const useAxios = () => {
  const context = useContext(AxiosContext);
  if (!context) {
    throw new Error('useAxios must be used within an AxiosProvider');
  }
  return context;
};