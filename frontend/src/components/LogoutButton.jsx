import React from "react";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left py-2 text-gray-700 hover:bg-green-500 hover:text-white transition rounded-none m-0 p-0"
    >
      Logout
    </button>
  );
}

export default LogoutButton;
