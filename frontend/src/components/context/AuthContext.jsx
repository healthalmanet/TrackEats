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
  const [loading, setLoading] = useState(true); // ✅ NEW: loading state

  useEffect(() => {
    const existingToken = getToken();
    if (existingToken) {
      setTokenState(existingToken);
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false); // ✅ Done loading
  }, []);

  const login = (newToken, userInfo) => {
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

  const isAuthenticated = !!token && !!user;

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
        loading, // ✅ Export loading to consumers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
