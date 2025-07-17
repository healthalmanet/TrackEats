// src/components/dashboard/AddInfoButton.jsx

import React from 'react';
import { Plus } from 'lucide-react';

const AddInfoButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      // This button is now a "group" to allow for animating the icon on hover.
      // It features a "lift & glow" hover effect with a rotating icon.
      className="
        group
        flex flex-shrink-0 items-center justify-center gap-2
        bg-[var(--color-primary)] text-[var(--color-text-on-primary)]
        px-4 py-2 rounded-xl
        font-[var(--font-primary)] font-semibold text-sm
        shadow-lg
        transition-all duration-300 ease-in-out
        hover:bg-[var(--color-primary-hover)] hover:shadow-xl hover:-translate-y-1
        active:scale-95 active:shadow-md
        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-app)]
      "
    >
      <Plus
        size={18}
        // The icon now smoothly rotates on button hover.
        className="transition-transform duration-300 ease-in-out group-hover:rotate-90"
      />
      <span>Add Reports</span>
    </button>
  );
};

export default AddInfoButton;