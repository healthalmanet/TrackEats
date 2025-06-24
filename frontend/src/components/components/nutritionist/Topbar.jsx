import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png"; // Adjust the path if needed

const Topbar = () => {
  const username = "Dr. Nutritionist"; // Make dynamic later
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Assuming token is stored with key "token"
    navigate("/"); // Redirect to homepage
  };

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white shadow-md border-b border-gray-200 px-6 flex items-center justify-between z-40">
      {/* Logo on the left */}
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="Logo"
          className="h-10 w-auto object-contain"
          style={{ margin: 0, padding: 0 }}
        />
      </div>

      {/* Avatar and Logout */}
      <div className="flex items-center gap-4">
        <img
          src="https://cdn-icons-png.flaticon.com/512/9131/9131529.png"
          alt="Profile"
          className="w-10 h-10 rounded-full border border-gray-300"
        />
        <button
          onClick={handleLogout}
          className="px-4 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
