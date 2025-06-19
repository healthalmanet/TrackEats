import React from "react";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // remove token
    navigate("/"); // go back to home
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition rounded-md"
    >
      Logout
    </button>
  );
}

export default LogoutButton;         