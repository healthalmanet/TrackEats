import React from "react";
import { NavLink, Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import logo from "../../assets/logo.png";
import user from "../../assets/user.png";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md h-16 px-6 flex items-center justify-between">
      
      {/* Left: Logo (Clickable to dashboard) */}
      <div className="flex items-center h-full">
        <Link to="/dashboard">
          <img src={logo} alt="TrackEats Logo" className="h-13 w-auto cursor-pointer" />
        </Link>
      </div>

      {/* Center: Navigation Links */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-8 font-poppins font-medium text-base">
        <NavLink 
          to="/dashboard/user-profile" 
          className={({ isActive }) => isActive ? "text-green-500" : "text-gray-500 hover:text-green-500"}
        >
          Profile
        </NavLink>

        <NavLink 
          to="/dashboard/explore" 
          className={({ isActive }) => isActive ? "text-green-500" : "text-gray-500 hover:text-green-500"}
        >
          Explore
        </NavLink>

        <NavLink 
          to="/dashboard/tools" 
          className={({ isActive }) => isActive ? "text-green-500" : "text-gray-500 hover:text-green-500"}
        >
          Tools
        </NavLink>

        <NavLink 
          to="/dashboard/health-section" 
          className={({ isActive }) => isActive ? "text-green-500" : "text-gray-500 hover:text-green-500"}
        >
          Health
        </NavLink>
      </div>

      {/* Right: User Avatar */}
      <div className="flex items-center gap-4">
        <div className="ml-4">
          <img 
            src={user} 
            alt="User Avatar" 
            className="h-10 w-10 rounded-full border"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
