import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getToken,
  setToken as storeToken,
  removeToken,
} from "../../services/tokenService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load token and user from local storage when app starts
    const existingToken = getToken();
    if (existingToken) {
      setTokenState(existingToken);
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (newToken, userInfo) => {
    // Normalize the role to lowercase for consistency across app
    const normalizedUser = {
      ...userInfo,
      role: userInfo.role?.toLowerCase() || "user",
    };

    storeToken(newToken);
    setTokenState(newToken);
    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem("user");
    setTokenState(null);
    setUser(null);
  };

  const isAuthenticated = !!token;
  const role = user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuthenticated,
        user,
        role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
