import React from "react";

const Explore = () => {
  return (
    <div className="w-full bg-white shadow-sm">
      {/* Top Navigation */}
      <div className=" flex justify-between items-center px-4 py-2 border-b">
        <h1 className="text-xl font-bold text-gray-800">Explore</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-orange-500 font-medium">
            {/* <MdOndemandVideo className="text-xl mr-1" /> TV */}
          </div>
          {/* < className="text-xl text-gray-800" /> */}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className=" flex flex-wrap items-center justify-start px-3 py-3 gap-2 overflow-x-auto">
        <button className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow">
          My Feed

        </button>

        <button className="border border-gray-300 text-gray-700 px-4 py-1 rounded-full text-sm font-medium hover:bg-orange-500 hover:text-white"
        >
          Liked By Me
        </button>
        <button className="border border-gray-300 text-gray-700 px-4 py-1 rounded-full text-sm font-medium hover:bg-orange-500 hover:text-white">
          Recipes
        </button>
        <button className="border border-gray-300 text-gray-700 px-4 py-1 rounded-full text-sm font-medium hover:bg-orange-500 hover:text-white">
          Transformation
        </button>
      </div>

      {/* Brand Section */}
      <div className=" bg-[#D6B188] flex justify-end px-6 py-3">
        {/* <div className="container mx-auto text-right"> */}
        <h2 className="text-2xl font-bold  text-black"> A Smart Nutrition</h2>
        {/* </div> */}
      </div>

      {/* Heading */}
      <div className="bg-[#EFFEFA] text-center py-4">
        <h3 className="text-2xl font-extrabold">
          <span className="text-orange-600">VITAMIN-</span>
          <span className="text-black">RICH FOODS</span>
        </h3>
      </div>
    </div>

  );
};

export default Explore;
