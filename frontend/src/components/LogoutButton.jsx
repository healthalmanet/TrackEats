// src/components/LogoutButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // remove token
    navigate("/"); // go back to home
  };

  return (
    <button onClick={handleLogout}
   className="px-6 py-3 mt-4 bg-green-600 text-white rounded hover:bg-green-700 transition">
      Logout
    </button>
  );
}

export default LogoutButton;
