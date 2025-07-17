import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";

function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // ✅ Get logout from context

  const handleLogout = () => {
    logout(); // ✅ Call context logout
    navigate("/", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-primary hover:bg-primary-hover text-light font-semibold font-['Poppins'] px-5 py-2.5 rounded-full shadow-soft transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      Logout
    </button>
  );
}

export default LogoutButton;