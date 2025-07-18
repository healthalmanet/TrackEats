// src/components/layout/Navbar.jsx

import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  
  // A cleaner, simpler style for nav links with an animated underline
  const navLinkStyle = "relative font-medium text-[var(--color-text-default)] transition-colors duration-300 focus:outline-none focus:text-[var(--color-primary)]";
  const activeLinkStyle = "text-[var(--color-primary)]";

  const renderNavLink = ({ to, label, isMobile = false }) => {
    return (
      <NavLink
        key={to}
        to={to}
        onClick={() => setIsOpen(false)}
        className={({ isActive }) => `${navLinkStyle} ${isActive ? activeLinkStyle : "hover:text-[var(--color-primary)] group"}`}
      >
        {label}
        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[var(--color-primary)] transform scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 origin-left"></span>
        {({ isActive }) => isActive && (
          <motion.div
            className="absolute -bottom-1 left-0 w-full h-0.5 bg-[var(--color-primary)]"
            layoutId="underline"
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
        )}
      </NavLink>
    );
  };

  const alignmentClasses = {
    center: "absolute left-1/2 transform -translate-x-1/2",
    right: "ml-auto",
  };

  return (
    <nav
      className={`sticky top-0 z-50 h-16 px-6 flex items-center justify-between font-[var(--font-secondary)] text-sm md:text-base transition-all duration-300 ${
        isScrolled 
          ? "bg-[var(--color-bg-surface)]/80 backdrop-blur-lg shadow-lg border-b border-[var(--color-border-default)]" 
          : "bg-transparent"
      }`}
    >
      <NavLink to="/" className="flex items-center space-x-3">
          <span className="pl-5 text-[var(--color-primary)] font-extrabold text-2xl tracking-wide font-[var(--font-primary)]">
            TrackEats
          </span>
      </NavLink>

      {/* Desktop Nav Links - Now cleaner without the extra container */}
      <div className={`hidden md:flex items-center gap-8 ${alignmentClasses[align] || ""}`}>
        {links.map(link => renderNavLink({ ...link }))}
      </div>

      {/* Right Content & Mobile Menu Toggle */}
      <div className="flex items-center gap-4">
        <div className="hidden md:block">{rightContent}</div>
        <div className="md:hidden text-[var(--color-primary)]">
          <button onClick={toggleMenu} aria-label="Toggle menu" className="p-1">
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute top-full left-0 w-full bg-[var(--color-bg-surface)] border-t border-[var(--color-border-default)] flex flex-col items-center py-4 z-40 gap-4 shadow-xl"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="flex flex-col items-center gap-4"
            >
              {links.map((link) => (
                <motion.div key={link.to} variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}>
                  {renderNavLink({ ...link })}
                </motion.div>
              ))}
            </motion.div>
            <div className="block md:hidden mt-4 pt-4 border-t border-[var(--color-border-default)] w-full text-center">
              {rightContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;