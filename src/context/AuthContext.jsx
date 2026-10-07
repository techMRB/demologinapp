import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import api, {
  setAccessToken,
  registerForceLogout,
} from "../client/axiosClient";
import { useIdleTimer } from "../utils/idleTimer";
import { useNavigate } from "react-router-dom";
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [sessionMessage, setSessionMessage] = useState(null);
  const isLoggingOut = useRef(false);
  const navigate = useNavigate();
  const logout = useCallback(async (message) => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;
    try {
      await api.post("/auth/logout"); // tells backend to invalidate refresh token
    } catch (err) {
      // ignored — we clear the local session regardless
    }
    setAccessToken(null);
    setUser(null);
    if (message) setSessionMessage(message);
    navigate("/");
    isLoggingOut.current = false;
  }, []);

  // axiosClient.js can't use React state directly, so we hand it this

  // function to call whenever it needs to force a logout.

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
  // refresh-token cookie (covers page reloads / new tabs).

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.post("/auth/refresh");
        console.log("[AuthContext] Restored session:", response.data);
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
      } catch (err) {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const handleIdleLogout = useCallback(() => {
    logout("You were logged out after an hour of inactivity.");
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
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth() must be called inside an <AuthProvider>");
  }
  return context;
};
