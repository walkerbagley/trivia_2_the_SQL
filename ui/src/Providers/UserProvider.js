import React, { useEffect } from "react";
import { useState, createContext } from "react";
import { useAuthSession } from "./AuthProvider";
import { useAxios } from "./AxiosProvider";
import { jwtDecode } from "jwt-decode";
import { getUserById } from "../Services/User";

const UserContext = createContext(null);

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
    const { token, userId, logout } = useAuthSession();

    useEffect(() => {
        if (token && userId) {
            // Use userId directly instead of decoding token
            getUserById(axios, userId).then((response) => {
                console.log("Fetched user:", response);
                setUser(response);
            }).catch((error) => {
                console.error("Failed to fetch user:", error);
                // Don't logout on every error - might be network issue
                if (error.response?.status === 401) {
                    logout();
                }
            });
        } else {
            setUser(null);
        }
    }, [token, userId, axios, logout]);

    return (
        <UserContext.Provider value={{ user }}>
            {children}
        </UserContext.Provider>
    );
}