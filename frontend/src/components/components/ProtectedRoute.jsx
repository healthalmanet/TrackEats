import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    // A full-page, themed loading indicator for a better user experience.
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-main font-['Poppins']">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        <p className="text-xl text-heading font-['Lora'] mt-4">
          Verifying Access...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to home if not logged in.
    return <Navigate to="/" replace />;
  }

  // Check for the user's role.
  const userRole = user?.role?.toLowerCase();

  // Redirect to an "Unauthorized" page if the role doesn't match.
  if (requiredRole && userRole !== requiredRole.toLowerCase()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If all checks pass, render the child components.
  return children;
};

export default ProtectedRoute;