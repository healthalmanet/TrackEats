import React, { useEffect } from "react";
import { X } from 'lucide-react'; // Replaced text 'x' with a clean icon

const ModalWrapper = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    // This logic is perfect for accessibility, no changes needed.
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    // Backdrop with a subtle fade-in animation
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 overflow-y-auto animate-fade-in"
      onClick={onClose} // Allow closing by clicking the backdrop
    >
      {/* 
        Modal container is now fully themed with section colors, borders, shadows, and animations.
        It also has a themed scrollbar for long content.
      */}
      <div
        className="relative w-full max-w-sm bg-section rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto my-4 border border-custom custom-scrollbar animate-fade-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Themed close button with a proper icon */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-body/70 hover:text-red p-1.5 rounded-full hover:bg-light transition-colors duration-200"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;