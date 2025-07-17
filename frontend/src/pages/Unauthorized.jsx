import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react"; // A fitting icon for this page

const Unauthorized = () => {
  return (
    // Center the content on the page with the theme's main background
    <div className="flex flex-col items-center justify-center min-h-screen bg-main text-center p-4 font-['Poppins']">
      
      {/* Visual Icon using the theme's alert red color */}
      <ShieldAlert className="w-16 h-16 text-red mb-6" />

      {/* Heading using the theme's Lora font and alert red color */}
      <h1 className="text-4xl font-['Lora'] font-bold text-red mb-4">
        Access Denied
      </h1>

      {/* Paragraph using the theme's body text color */}
      <p className="text-lg text-body mb-8 max-w-md">
        You do not have the necessary permissions to view this page.
      </p>

      {/* A helpful link to guide the user back home */}
      <Link
        to="/"
        className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
      >
        Return to Homepage
      </Link>
      
    </div>
  );
};

export default Unauthorized;