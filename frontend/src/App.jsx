

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard"; // will handle nested routes
import Navbar from "./components/components/Navbar";
import ProtectedRoute from "./components/components/ProtectedRoute";
import Chatbot from "./components/components/Chatbot";

import DiabeticPage from "./components/components/diabetic";
import DiabeticDashboard from "./components/components/diabetic/DiabeticDashboard";

function App() {

  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

        {/* Dashboard will handle its own sub-routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }/>
         
      </Routes>
      {isAuthenticated && <DiabeticPage/>}

      {isAuthenticated && <Chatbot/>}
    </>
  );
}

export default App;
