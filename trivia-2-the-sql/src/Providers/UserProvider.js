import React, { useEffect } from "react";
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
    const { token, logout } = useAuthSession();

    useEffect(() => {
        if (token) {
            const userId = jwtDecode(token).sub;
            axios.get(`/user/${userId}`).then((response) => {
                setUser(response.data);
            }).catch((error) => {
                console.error("Failed to fetch user:", error);
                logout();
            });
        } else {
            setUser(null);
        }
    }, [token, axios, logout]);

    return (
        <UserContext.Provider value={{ user }}>
        {children}
        </UserContext.Provider>
    );
}