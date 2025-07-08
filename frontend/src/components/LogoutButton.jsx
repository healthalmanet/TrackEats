import React from "react";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../components/context/AuthContext"

function LogoutButton() {
  const navigate = useNavigate();
   const { logout } = useAuth();  // ✅ Get logout from context


  const handleLogout = () => {
      logout();                    // ✅ Call context logout
    navigate("/", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-[#FF6B3D] hover:bg-[#e85c2a] hover:shadow-lg text-white px-5 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
    >
      Logout
    </button>
  );
}

export default LogoutButton;
