import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuthSession } from './AuthProvider';
import axios from 'axios';

const defaultAxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

const AxiosContext = createContext(defaultAxiosInstance);

export const AxiosProvider = ({ children }) => {
  
  const { token, logout } = useAuthSession();
  
  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL:  'http://127.0.0.1:8000', 
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }, []);

  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      console.log("response", response)
      return response;
    },
    (error) => {
      if (error.response.status === 401) {
        console.log("error", "401");
        logout();
      }
      return Promise.reject(error);
    }
  );

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
