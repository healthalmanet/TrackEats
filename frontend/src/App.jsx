import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import OwnerPage from "./pages/OwnerPage";
import OperatorPage from "./pages/OperatorPage";
import NutritionistPage from "./pages/NutritionistPage";

import Dashboard from "./pages/Dashboard";

import Navbar from "./components/components/Navbar";
import ProtectedRoute from "./components/components/ProtectedRoute";
import Chatbot from "./components/components/Chatbot";
import ForgotPassword from "./components/components/ForgotPassword";


function App() {
  const { isAuthenticated, user } = useAuth();

  // Determine where to redirect based on user role
  const getRedirectPath = () => {
    if (user && user.role) {
      return `/${user.role.toLowerCase()}`;
    }
    return "/dashboard"; // Default for standard users
  };

  return (
    <>
      {isAuthenticated && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to={getRedirectPath()} /> : <Home />
          }
        />

        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to={getRedirectPath()} /> : <Login />
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to={getRedirectPath()} /> : <Register />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? <Navigate to={getRedirectPath()} /> : <ForgotPassword />
          }
        />
         <Route
          path="/reset-password/:token"
          element={
            isAuthenticated ? <Navigate to={getRedirectPath()} /> : <ForgotPassword />
          }
        />

        {/* Protected routes based on user role */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute requiredRole="Owner">
              <OwnerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator"
          element={
            <ProtectedRoute requiredRole="Operator">
              <OperatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nutritionist"
          element={
            <ProtectedRoute requiredRole="Nutritionist">
              <NutritionistPage />
            </ProtectedRoute>
          }
        />

        {/* Generic dashboard for standard users */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>


      {isAuthenticated && <Chatbot />}

    </>

  );
}

export default App;
