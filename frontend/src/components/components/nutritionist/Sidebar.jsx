import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaUserFriends, FaChartPie, FaClipboardList, FaBars } from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 pl-5 py-2 rounded-lg transition-all duration-200 hover:bg-green-100 hover:text-green-700 ${
      isActive
        ? "bg-green-100 text-green-700 font-medium border-l-4 border-green-500"
        : "text-gray-700"
    }`;

  return (
    <>
      {/* Toggle button for mobile */}
      <div className="md:hidden flex items-center p-4 bg-white  w-full fixed top-0 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-700 text-xl"
        >
          <FaBars />
        </button>
        <span className="ml-4 font-semibold text-lg">Menu</span>
      </div>

      {/* Fixed Sidebar */}
      <aside
        className={`${
          isOpen ? "block" : "hidden"
        } md:block fixed top-16 left-0 w-60 h-[calc(100vh-4rem)] bg-white  p-4 z-30 overflow-hidden`}
      >
        <nav className="w-full">
          <ul className="space-y-3 mt-6">
            <li>
              <NavLink to="/nutritionist/patients" className={linkClasses}>
                <FaUserFriends className="text-lg" />
                Patient List
              </NavLink>
            </li>
            <li>
              <NavLink to="/nutritionist/dashboard" className={linkClasses}>
                <FaChartPie className="text-lg" />
                My Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/nutritionist/diet-plans" className={linkClasses}>
                <FaClipboardList className="text-lg" />
                Diet Plans
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
