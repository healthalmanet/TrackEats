// src/components/layout/Navbar.jsx

import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ links = [], rightContent, align = "right" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { pathname } = useLocation(); // NEW: Hook to detect the current route

  const isHomepage = pathname === '/'; // NEW: Check if we are on the homepage

  const toggleMenu = () => setIsOpen(!isOpen);

  // MODIFIED: This effect now handles both the background style and the scroll-spy logic
  useEffect(() => {
    const handleScroll = () => {
      // 1. Handle background style change on scroll
      setIsScrolled(window.scrollY > 10);

      // 2. Conditionally run scroll-spy logic ONLY on the homepage
      if (isHomepage) {
        let currentSectionId = '';
        links.forEach(link => {
          if (!link.to.startsWith('#')) return; // Skip non-anchor links

          const element = document.getElementById(link.to.substring(1));
          if (element) {
            const rect = element.getBoundingClientRect();
            // Check if section is in the viewport (with a 150px top offset)
            if (rect.top <= 150 && rect.bottom >= 150) {
              currentSectionId = link.to;
            }
          }
        });
        setActiveSection(currentSectionId);
      }
    };

    handleScroll(); // Check on initial render
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, links, isHomepage]); // Rerun effect if path or links change

  // Function for smooth scrolling (for anchor links)
  const handleAnchorLinkClick = (e, to) => {
    e.preventDefault();
    const targetId = to.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsOpen(false);
  };

  const navLinkStyle =
    "relative font-medium text-[var(--color-text-default)] transition-colors duration-300 focus:outline-none focus:text-[var(--color-primary)]";
  const activeLinkStyle = "text-[var(--color-primary)]";

  // This function renders links with context-aware active states
  const renderNavLink = ({ to, label }) => {
    const isAnchorLink = to.startsWith("#");

    // RENDER ANCHOR LINK: Active state is based on scroll position (activeSection)
    if (isAnchorLink) {
      const isActive = isHomepage && activeSection === to;
      return (
        <a
          key={to}
          href={to}
          onClick={(e) => handleAnchorLinkClick(e, to)}
          className={`${navLinkStyle} ${isActive ? activeLinkStyle : "hover:text-[var(--color-primary)]"}`}
        >
          {label}
        </a>
      );
    }

    // RENDER ROUTER LINK: Active state is based on the URL (handled by NavLink)
    return (
      <NavLink
        key={to}
        to={to}
        end={to === '/'} // Ensures "Home" link is only active on the exact root path
        onClick={() => setIsOpen(false)}
        className={({ isActive }) =>
          `${navLinkStyle} ${isActive ? activeLinkStyle : "hover:text-[var(--color-primary)]"}`
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
    <nav
      className={`sticky top-0 z-50 h-16 px-6 flex items-center justify-between font-[var(--font-secondary)] text-sm md:text-base transition-all duration-300 ${
        isScrolled
          ? "bg-[var(--color-bg-surface)]/80 backdrop-blur-lg shadow-lg border-b border-[var(--color-border-default)]"
          : "bg-transparent"
      }`}
    >
      <NavLink to="/" className="flex items-center">
        <span className="font-extrabold text-3xl tracking-wide font-[var(--font-primary)]">
          <span className="text-[var(--color-primary)]">Track</span>
          <span className="text-[var(--color-text-strong)]">Eats</span>
        </span>
      </NavLink>

      <div className={`hidden md:flex items-center gap-8 ${alignmentClasses[align] || ""}`}>
        {links.map((link) => renderNavLink({ ...link }))}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
          {rightContent}
        </div>
        <div className="md:hidden text-[var(--color-primary)]">
          <button onClick={toggleMenu} aria-label="Toggle menu" className="p-1">
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
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
              <div className="flex justify-center items-center gap-4 text-sm font-medium">
                {rightContent}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;