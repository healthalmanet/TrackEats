// src/pages/Unauthorized.jsx
import React from "react";

const Unauthorized = () => {
  return (
    <div className="text-center p-10">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-lg text-gray-700">
        You are not authorized to view this page.
      </p>
    </div>
  );
};

export default Unauthorized;
