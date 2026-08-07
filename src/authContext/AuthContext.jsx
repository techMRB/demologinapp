// Give the whole app acess to: the logged-in user, login(), logout(),
// and isLoading ( still checking for an existing session).
// Use it anywhere with : const { user, login, logout, isLoading } = useAuth();

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api, { setAccessToken, registerForceLogout } from "../client/axiosClient";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { useNavigate } from "react-router-dom";
const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState(null);
  const isLoggingOut = useRef(false);
  const navigate = useNavigate();

    const logout = useCallback(async (message) => {
        if(isLoggingOut.current) return; // Prevent multiple logout calls
        isLoggingOut.current = true;

        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout failed:", error);
        }

        setAccessToken(null);
        setUser(null);
        if (message) setSessionMessage(message);
        isLoggingOut.current = false;
        navigate("/"); // Redirect to login page after logout
    }, [navigate]);

    //axiosClient.js can't use React state directly, so we hand it this
    // function to call whenever it needs to force a logout (like when it detects a refresh token reuse attack).
    useEffect(() => {
        registerForceLogout(logout);
    }, [logout]);

    const login = useCallback(async (credentials) => {
        setSessionMessage(null);
        const response = await api.post("/auth/login", credentials);
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
        return response.data.user;
    }, []);

    // On first load, try to silently restore the session using the 
    // refresh token stored in the HttpOnly cookie.
    const hasAttemptedRestore = useRef()
    useEffect(() => {
        if(hasAttemptedRestore.current) return;
        hasAttemptedRestore.current = true
        const restoreSession = async () => {
            try {
                const response = await api.post("/auth/refresh");
                setAccessToken(response.data.accessToken);
                setUser(response.data.user);
            } catch (error) {
                setAccessToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        restoreSession();
    }, []);

    // Use the custom idle timer hook to automatically log out the user after some minutes of inactivity.
    const handleIdleLogout = useCallback(() => {
        logout("You have been logged out due to inactivity.");
    }, [logout]);

    useIdleTimer(handleIdleLogout, Boolean(user)); 

    const contextValue = {
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        sessionMessage,
        clearSessionMessage: () => setSessionMessage(null),
        login,
        logout,
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}