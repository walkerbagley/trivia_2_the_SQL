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
  
  const { token, setJwt, clearJwt } = useAuthSession();
  console.log('token in provider', token);
  
  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL:  'http://127.0.0.1:8000', 
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }, []);

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
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

    // const responseInterceptor = axiosInstance.interceptors.response.use(
    //   (response) => response,
    //   (error) => {
    //     if (error.response) {
    //       console.log(error.config?.url, '\tResponse error:',  error.response.status, error.response.data);
    //     } else if (error.request) {
    //       console.log(error.config?.url, '\tRequest error:', error.request);
    //     } else {
    //       console.log(error.config?.url, '\tError:', error.message);
    //     }
    //     return Promise.reject(error);
    //   }
    // );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
     // axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [token, axiosInstance]);

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

