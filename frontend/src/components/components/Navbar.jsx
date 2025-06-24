import React, { useState, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import LogoutButton from "./LogoutButton";
import logo from "../../assets/logo.png";
import user from "../../assets/user.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutIdRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleMouseEnter = () => {
    clearTimeout(timeoutIdRef.current);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutIdRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 200); // 200ms delay before hiding
  };

  const navLinks = [
    { to: "/dashboard", label: "Home" },
    { to: "/dashboard/user-profile", label: "Profile" },
    { to: "/dashboard/tools", label: "Tools" },
    { to: "/dashboard/health-section", label: "Health" },
    { to: "/dashboard/meals", label: "Meals" },
    { to: "/dashboard/reports", label: "Reports" },
  ];

  const renderNavLink = ({ to, label }) => (
    <NavLink
      key={to}
      to={to}
      end={to === "/dashboard"}
      onClick={() => setIsOpen(false)}
      className={({ isActive }) =>
        isActive ? "text-green-500" : "text-gray-500 hover:text-green-500"
      }
    >
      {label}
    </NavLink>
  );

  return (
    <nav className="bg-white h-16 px-6 flex items-center justify-between relative shadow-sm z-50">
      {/* Logo */}
      <div className="flex items-center h-full">
        <Link to="/dashboard">
          <img src={logo} alt="TrackEats Logo" className="h-13 w-auto cursor-pointer" />
        </Link>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex gap-8 font-poppins font-medium text-base">
        {navLinks.map(renderNavLink)}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 relative">
        {/* Avatar with Hover Dropdown */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={user}
            alt="User Avatar"
            className="h-10 w-10 rounded-full border cursor-pointer"
          />

          {/* Logout dropdown */}
          {showDropdown && (
            <div className="absolute right-0 top-12 bg-white shadow-md rounded-lg py-2 px-4 z-50 min-w-[150px] transition-opacity duration-300 ease-in-out">
              <LogoutButton />
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white flex flex-col items-center py-4 z-40 gap-3">
          {navLinks.map(renderNavLink)}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
