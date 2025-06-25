import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role, loading } = useAuth(); // ⬅️ include loading

  // ⏳ Wait until AuthContext finishes loading from localStorage
  if (loading) {
    return <div className="text-center py-10">Loading...</div>; // or your custom loader
  }

  // 🔒 Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 🚫 Role mismatch
  if (requiredRole && role?.toLowerCase() !== requiredRole.toLowerCase()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Access granted
  return children;
};

export default ProtectedRoute;
