import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = ({ links = [], rightContent, align = "right" }) => {
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

  // Base style for nav links using theme colors
  const baseStyle =
    "relative font-medium text-body hover:text-primary transition duration-200 " +
    "after:absolute after:-bottom-1 after:left-0 after:w-0 hover:after:w-full after:h-[2px] " +
    "after:bg-primary after:transition-all after:duration-300 focus:outline-none focus:ring-0";

  // Active style for the current page link, using the theme's primary accent color
  const activeStyle =
    "relative font-semibold text-primary transition duration-200 " +
    "after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] " +
    "after:bg-primary after:transition-all after:duration-300";

  const renderNavLink = ({ to, label }) => {
    const isHashLink = to.startsWith("#");

    if (isHashLink) {
      return (
        <a key={to} href={to} className={baseStyle} onClick={() => setIsOpen(false)}>
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
      className={`sticky top-0 z-50 bg-section/80 h-16 px-6 flex items-center justify-between font-['Poppins'] text-sm md:text-base backdrop-blur-lg transition-shadow duration-300 ${
        isScrolled ? "shadow-soft" : ""
      }`}
    >
      {/* Logo using the theme's primary text color */}
      <div className="flex items-center space-x-3">
          <span className="pl-5 text-primary font-extrabold text-2xl tracking-wide">
            TrackEats
          </span>
      </div>

      {/* Desktop Nav Links */}
      <div className={`hidden md:flex gap-8 ${alignmentClasses[align] || ""}`}>
        {links.map(renderNavLink)}
      </div>

      {/* Right Content & Mobile Menu Toggle */}
      <div className="flex items-center gap-4">
        <div className="hidden md:block">{rightContent}</div>
        {/* Mobile menu button uses the primary accent color */}
        <div className="md:hidden text-primary">
          <button onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown using theme backgrounds and borders */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-main border-t border-custom flex flex-col items-center py-4 z-40 gap-4 shadow-soft">
          {links.map(renderNavLink)}
          <div className="block md:hidden">{rightContent}</div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;