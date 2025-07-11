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
      className="relative inline-block px-6 py-2 font-['Orbitron'] font-bold text-[#39FF14] border border-[#39FF14] rounded-full transition duration-300 ease-in-out 
                 bg-transparent hover:bg-[#00FF7F] hover:text-black 
                 shadow-[0_0_5px_#39FF14,0_0_10px_#39FF14,0_0_20px_#00FFB3] 
                 hover:shadow-[0_0_10px_#00FF7F,0_0_20px_#00FF7F,0_0_30px_#00FFB3] 
                 hover:scale-105"
    >
      Logout
    </button>
  );
}

export default LogoutButton;
