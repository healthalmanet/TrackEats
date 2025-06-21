import React, { useEffect } from "react";

const ModalWrapper = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 overflow-y-auto"
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl p-4 max-h-[90vh] overflow-y-auto my-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;
