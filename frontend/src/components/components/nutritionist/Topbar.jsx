import React from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import logo from "../../../assets/logo.png";
import { useAuth } from "../../context/AuthContext"; // ✅ Make sure path is correct

const Topbar = () => {
  const username = "Dr. Nutritionist"; // Make dynamic later
  const navigate = useNavigate();
  const { logout } = useAuth(); // ✅ Pull logout from context

  const handleLogout = () => {
    logout(); // ✅ Clears auth state properly
    navigate("/", { replace: true }); // ✅ Redirects immediately
  };

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white px-6 flex items-center justify-between z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="Logo"
          className="h-10 w-auto object-contain"
          style={{ margin: 0, padding: 0 }}
        />
      </div>

      <div className="flex items-center gap-4">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
          alt="Profile"
          className="w-10 h-10 rounded-full border border-gray-300 object-cover"
        />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-all duration-200 font-medium"
        >
          <FiLogOut className="text-lg" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
