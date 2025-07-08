import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = ({ logo, links = [], rightContent, align = "right" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const baseStyle =
    "relative font-medium text-[#4A4A4A] hover:text-[#FF7043] transition duration-200 " +
    "after:absolute after:-bottom-1 after:left-0 after:w-0 hover:after:w-full after:h-[2px] " +
    "after:bg-[#FF7043] after:transition-all after:duration-300 focus:outline-none focus:ring-0";

  const activeStyle =
    "relative font-semibold text-[#FF7043] transition duration-200 " +
    "after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] " +
    "after:bg-[#FF7043] after:transition-all after:duration-300";

  const renderNavLink = ({ to, label }) => {
    const isHashLink = to.startsWith("#");

    if (isHashLink) {
      return (
        <a key={to} href={to} className={baseStyle}>
          {label}
        </a>
      );
    }

    return (
      <NavLink
        key={to}
        to={to}
        onClick={() => setIsOpen(false)}
        className={({ isActive }) => (isActive ? activeStyle : baseStyle)}
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
    <nav
      className={`sticky top-0 z-50 bg-white h-16 px-6 flex items-center justify-between font-['Poppins'] text-sm md:text-base backdrop-blur-lg transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      {/* Logo */}
      <div className="flex items-center space-x-3">
        
          <span className="pl-5 text-[#FF7043] font-extrabold text-2xl tracking-wide">
            TrackEats
          </span>
        
      </div>

      {/* Desktop Nav Links */}
      <div className={`hidden md:flex gap-8 ${alignmentClasses[align] || ""}`}>
        {links.map(renderNavLink)}
      </div>

      {/* Right Content */}
      <div className="flex items-center gap-4">
        <div className="hidden md:block">{rightContent}</div>
        <div className="md:hidden text-[#FF7043]">
          <button onClick={toggleMenu}>
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#FAF3EB] border-t border-[#ECEFF1] flex flex-col items-center py-4 z-40 gap-4 shadow-md">
          {links.map(renderNavLink)}
          <div className="block md:hidden">{rightContent}</div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
