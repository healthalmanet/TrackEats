

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
<<<<<<< HEAD
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Explore from "./components/Explore";
import FatCalculator from "./components/Tools/FatCalculater/FatCalculater";
import FatCalculatorResult from "./components/Tools/FatCalculater/FatCalculaterResult";
=======
import Dashboard from "./pages/Dashboard"; // will handle nested routes
import Navbar from "./components/components/Navbar";
import ProtectedRoute from "./components/components/ProtectedRoute";
import Chatbot from "./components/components/Chatbot";

import DiabeticPage from "./components/components/diabetic";
import DiabeticDashboard from "./components/components/diabetic/DiabeticDashboard";
>>>>>>> 8b856a87d39a8a66b755bb1d13bc0a407ab51463

function App() {

  const { isAuthenticated } = useAuth();

  return (
<<<<<<< HEAD
    <Routes>
      <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Home />} />
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/explore" element={<Explore/>}/>
      <Route path="/FatCalculater" element={<FatCalculator/>}/>
      <Route path="/FatCalculateResult" element={<FatCalculatorResult/>}/>
    </Routes>
    
=======
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
      

      {isAuthenticated && <Chatbot/>}
    </>
>>>>>>> 8b856a87d39a8a66b755bb1d13bc0a407ab51463
  );
}

export default App;
