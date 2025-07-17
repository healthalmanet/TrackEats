import React from 'react';
import { Plus } from 'lucide-react';

const AddInfoButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      // All styles now come from the "Fresh & Organic" theme
      className="flex flex-shrink-0 items-center gap-1.5 bg-primary hover:bg-primary-hover text-light px-4 py-2 rounded-xl font-semibold font-['Poppins'] text-sm shadow-soft hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <Plus size={16} className="-ml-1" />
      <span>Add Reports</span>
    </button>
  );
};

export default AddInfoButton;