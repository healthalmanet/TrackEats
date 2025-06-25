import React from "react";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    navigate("/");
    window.location.reload(); // optional full reset
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-[#00bd00] hover:bg-[#00e62a] text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all duration-200 hover:scale-105"
    >
      Logout
    </button>
  );
}

export default LogoutButton;
