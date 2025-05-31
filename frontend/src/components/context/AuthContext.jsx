import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken as storeToken, removeToken } from "../../services/tokenService";
import React from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(null);

  useEffect(() => {
    const existingToken = getToken();
    if (existingToken) {
      setTokenState(existingToken);
    }
  }, []);

  const login = (newToken) => {
    storeToken(newToken);
    setTokenState(newToken);
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
