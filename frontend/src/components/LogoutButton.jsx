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
      className="bg-green-500 hover:bg-green-600 text-white  ml-5 px-5 py-2 rounded-full font-semibold"
    >
      Logout
    </button>
  );
}

export default LogoutButton;
