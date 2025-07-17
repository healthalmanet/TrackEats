import React from "react";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all user-related data from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    
    // Navigate to the home page
    navigate("/");

    // Optional: Force a full reload to reset any in-memory state
    window.location.reload(); 
  };

  return (
    <button
      onClick={handleLogout}
      className="px-6 py-2 font-['Poppins'] font-bold rounded-full transition-all duration-300 ease-in-out
                 text-primary border border-primary bg-transparent
                 hover:bg-primary hover:text-light hover:shadow-soft hover:scale-105
                 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      Logout
    </button>
  );
}

export default LogoutButton;