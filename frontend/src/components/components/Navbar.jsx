import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = ({ logo, links = [], rightContent, align = "right" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  const renderNavLink = ({ to, label }) => {
    const isHashLink = to.startsWith("#");

    if (isHashLink) {
      return (
        <a
          key={to}
          href={to}
          className="text-gray-600 hover:text-green-500 font-semibold transition-colors duration-200"
        >
          {label}
        </a>
      );
    }

    return (
      <NavLink
        key={to}
        to={to}
        end={to === "/dashboard"}
        onClick={() => setIsOpen(false)}
        className={({ isActive }) =>
          isActive
            ? "text-green-500 font-semibold"
            : "text-gray-500 hover:text-green-500 font-semibold transition-colors duration-200"
        }
      >
        {label}
      </NavLink>
    );
  };

  const alignmentClasses = {
    center: "absolute left-1/2 transform -translate-x-1/2",
    right: "ml-auto",
  };

  return (
    <nav className="bg-white h-16 px-6 flex items-center justify-between relative shadow-sm z-50">
      {/* Logo */}
      <Link to="/">
        {logo}
      </Link>

      {/* Desktop nav list (center or right aligned) */}
      <div
        className={`hidden md:flex gap-8 text-base ${alignmentClasses[align] || ""}`}
      >
        {links.map(renderNavLink)}
      </div>

      {/* Right side: Desktop right content + Mobile toggle */}
      <div className="flex items-center gap-4">
        {/* Right content (Sign In / Logout) - only visible on desktop */}
        <div className="hidden md:block">
          {rightContent}
        </div>

        {/* Hamburger for mobile */}
        <div className="md:hidden">
          <button onClick={toggleMenu}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white flex flex-col items-center py-4 z-40 gap-3 shadow-md border-t">
          {links.map(renderNavLink)}
          <div className="block md:hidden">
            {rightContent}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
