import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import LogoutButton from "./LogoutButton";  // Keep if you're using it
import logo from "../../assets/logo.png";
import user from "../../assets/user.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { to: "/dashboard", label: "Home" },
    { to: "/dashboard/user-profile", label: "Profile" },
    { to: "/dashboard/explore", label: "Explore" },
    { to: "/dashboard/tools", label: "Tools" },
    { to: "/dashboard/health-section", label: "Health" }
  ];

  const renderNavLink = ({ to, label }) => (
    <NavLink
      key={to}
      to={to}
      end={to === "/dashboard"}
      onClick={() => setIsOpen(false)}
      className={({ isActive }) =>
        isActive
          ? "text-green-500"
          : "text-gray-500 hover:text-green-500"
      }
    >
      {label}
    </NavLink>
  );

  return (
    <nav className="bg-white h-16 px-6 flex items-center justify-between relative">

      {/* Left: Logo */}
      <div className="flex items-center h-full">
        <Link to="/dashboard">
          <img src={logo} alt="TrackEats Logo" className="h-13 w-auto cursor-pointer" />
        </Link>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex gap-8 font-poppins font-medium text-base">
        {navLinks.map(renderNavLink)}
      </div>

      {/* Right: User Avatar + Mobile Toggle */}
      <div className="flex items-center gap-4">
        <div className="ml-4">
          <img src={user} alt="User Avatar" className="h-10 w-10 rounded-full border" />
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
        <div className="absolute top-16 left-0 w-full bg-white flex flex-col items-center py-4 z-50">
          {navLinks.map(renderNavLink)}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
