import React from "react";
import { useState, createContext } from "react";
import { useAuthSession } from "./AuthProvider";
import { useAxios } from "./AxiosProvider";
import {jwtDecode} from "jwt-decode";

const UserContext = createContext(null, null, null);

export function useUserSession() {
    const context = React.useContext(UserContext);
    if (context === undefined) {
      throw new Error('useUserSession must be used within a UserProvider');
    }
    return context;
}

export function UserProvider({ children }) {
    const axios = useAxios();
    const [user, setUser] = useState(null);
    const { setJwt, clearJwt } = useAuthSession();

    const login = ({username, password}) => {
        axios.post("/auth/login", { username, password })
                .then((response) => {
                    setJwt(response.data.token);
                    setUser(jwtDecode(response.data.token).sub);
                    localStorage.setItem("token", JSON.stringify(response.data.token));
                })
                .catch((error) => {
                    console.error("Failed to login:", error);
                });
        };

    const logout = () => {
        setUser(null);
        clearJwt();
    };


    return (
        <UserContext.Provider value={{ user, login, logout }}>
        {children}
        </UserContext.Provider>
    );
}