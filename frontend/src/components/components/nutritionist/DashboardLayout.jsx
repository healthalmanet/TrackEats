import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="pt-16"> {/* Push sidebar below topbar visually */}
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="p-6 overflow-y-auto flex-1 bg-gray-50 pt-16 md:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
