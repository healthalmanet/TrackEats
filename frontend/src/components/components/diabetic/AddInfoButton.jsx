import React from 'react';
import { Plus } from 'lucide-react';

const AddInfoButton = ({ onClick }) => {
  return (
    <button
  onClick={onClick}
  className="flex items-center gap-2 bg-[#FF7043] hover:bg-[#F4511E] text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-md transition duration-200"
>
  <Plus size={16} />
  Add Information
</button>
  );
};

export default AddInfoButton;

