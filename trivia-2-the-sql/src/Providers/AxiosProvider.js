import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuthSession } from './AuthProvider';

const defaultAxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

const AxiosContext = createContext(defaultAxiosInstance);

export const AxiosProvider = ({ children }) => {
  
  const { token, setJwt, clearJwt } = useAuthSession();
  
  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL:  'http://127.0.0.1:8000', 
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });
  }, []);

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.log(error.config?.url, '\tResponse error:',  error.response.status, error.response.data);
        } else if (error.request) {
          console.log(error.config?.url, '\tRequest error:', error.request);
        } else {
          console.log(error.config?.url, '\tError:', error.message);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
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

