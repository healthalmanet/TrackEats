// src/pages/ForgotPassword.jsx

import React, { useState } from "react";
import { Mail } from "lucide-react";
import { forgotPassword } from "../../api/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await forgotPassword(email); // 👈 call the backend
    setSubmitted(true); // show success message
  } catch (error) {
    console.error("Forgot password error:", error);
    alert("Something went wrong. Please try again.");
  }
};

 

    // This is where you'd normally send the email to backend
   

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-2xl p-6 my-10">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Forgot Password</h2>

        {submitted ? (
          <p className="text-center text-green-600 font-medium">
            If the email exists, you’ll receive a reset link shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-1 font-medium text-gray-800">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <button
  type="submit"
  className="w-full bg-[#00FF33] text-black py-2 rounded-md font-semibold hover:brightness-105 active:scale-[.98] transition duration-150 shadow cursor-pointer"
>
  Send Reset Link
</button>

          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
