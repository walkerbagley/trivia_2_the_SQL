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
  
  const { token } = useAuthSession();
  
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
      console.log('token in interceptor', token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
      }
      return config;
    },
    (error) => Promise.reject(error)
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

