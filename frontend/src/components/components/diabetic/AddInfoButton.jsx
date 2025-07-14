import React from 'react';
import { Plus } from 'lucide-react';

const AddInfoButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-shrink-0 items-center gap-1.5 bg-[#FF7043] hover:bg-[#F4511E] text-white px-4 py-2 rounded-xl font-semibold font-['Poppins'] text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
    >
      <Plus size={16} className="-ml-1" />
      <span>Add Reports</span>
    </button>
  );
};

export default AddInfoButton;