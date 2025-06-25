import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role } = useAuth();

  // If not logged in, redirect to home/login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If a specific role is required but the user's role doesn't match (case-insensitive)
  if (requiredRole && role?.toLowerCase() !== requiredRole.toLowerCase()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized
  return children;
};

export default ProtectedRoute;
