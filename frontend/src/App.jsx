import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/context/AuthContext";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./components/components/ForgotPassword";
import ResetPassword from "./components/components/ResetPassword";
import Unauthorized from "./pages/Unauthorized";

// Role-based dashboards
import OwnerPage from "./pages/OwnerPage";
import OperatorPage from "./pages/OperatorPage";
import NutritionistPage from "./pages/NutritionistPage";
import Dashboard from "./pages/Dashboard"; // user dashboard

// Shared UI components
import Navbar from "./components/components/Navbar";
import Footer from "./components/components/Footer";
import Chatbot from "./components/components/Chatbot";
import ProtectedRoute from "./components/components/ProtectedRoute";

// Toast notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { isAuthenticated, user } = useAuth();

  // Determine redirection path based on user role
  const getRedirectPath = () => {
  if (!user?.role) return "/dashboard"; // default fallback

  const role = user.role.toLowerCase();

  switch (role) {
    case "owner":
    case "operator":
    case "nutritionist":
      return `/${role}`;
    case "user":
    default:
      return "/dashboard"; // ✅ Correct path for normal user
  }
};


  return (
    <>
      {/* Show Navbar only for 'user' role */}
      {isAuthenticated && user?.role === "user" && <Navbar />}

      <Routes>
        {/* Public routes */}
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
            isAuthenticated ? (
              <Navigate to={getRedirectPath()} />
            ) : (
              <ForgotPassword />
            )
          }
        />
        <Route
          path="/reset-password/:uidb64/:token"
          element={
            isAuthenticated ? (
              <Navigate to={getRedirectPath()} />
            ) : (
              <ResetPassword />
            )
          }
        />

        {/* Protected routes for each role */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator"
          element={
            <ProtectedRoute requiredRole="operator">
              <OperatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nutritionist/*"
          element={
            <ProtectedRoute requiredRole="nutritionist">
              <NutritionistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute requiredRole="user">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Unauthorized fallback */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>

      {/* Show Chatbot and Footer only for 'user' role */}
      {isAuthenticated && user?.role === "user" && <Chatbot />}
      {isAuthenticated && user?.role === "user" && <Footer />}

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} pauseOnHover theme="light" />
    </>
  );
}

export default App;
