import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { User, Mail, Lock, CircleCheck, CircleX } from "lucide-react";
import logo from "../assets/logo.png";

function Register() {
  const [full_name, setfull_name] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showChecklist, setShowChecklist] = useState(false);

  const navigate = useNavigate();

  const isLengthValid = password.length >= 8;
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isMatch = password2 !== "" && password === password2;
  const isFormValid = isLengthValid && hasSymbol && isMatch;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      alert("Please make sure your password meets all conditions.");
      return;
    }

    try {
      const res = await registerUser({ full_name, email, password, password2 });
      alert("You are registered successfully!");
      navigate("/login");
    } catch (error) {
      alert(
        error?.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-2xl p-6 my-10">

        {/* Logo inside card */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="TrackEats Logo" className="w-36 h-auto sm:w-40 mb-2" />
        </div>

        {/* Toggle Tabs */}
        <div className="flex bg-gray-100 rounded-xl mb-6 overflow-hidden">
          <Link to="/login" className="w-1/2">
            <button className="w-full py-2 font-medium text-gray-800">Login</button>
          </Link>
          <Link to="/register" className="w-1/2">
            <button className="w-full py-2 font-semibold bg-[#00FF33] text-black rounded-lg transition">Register</button>
          </Link>
        </div>

        <form onSubmit={handleRegister}>
          {/* Full Name */}
          <div className="mb-4">
            <label htmlFor="full_name" className="block mb-1 font-medium text-gray-800">
              Full Name
            </label>
            <div className="relative">
              <input
                id="full_name"
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                placeholder="Enter your full name"
                value={full_name}
                onChange={(e) => setfull_name(e.target.value)}
                required
              />
              <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 font-medium text-gray-800">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block mb-1 font-medium text-gray-800">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                placeholder="Create a strong password"
                value={password}
                onFocus={() => setShowChecklist(true)}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label htmlFor="password2" className="block mb-1 font-medium text-gray-800">
              Confirm Password
            </label>
            <input
              id="password2"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
              placeholder="Re-enter password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
          </div>

          {/* Password Checklist */}
          {(showChecklist || password.length > 0 || password2.length > 0) && (
            <div className="mb-4 text-sm text-gray-700 bg-green-50 border border-green-200 p-3 rounded-md space-y-2">
              <div className="flex items-center gap-2">
                {isLengthValid ? (
                  <CircleCheck className="text-green-600 w-5 h-5" />
                ) : (
                  <CircleX className="text-red-500 w-5 h-5" />
                )}
                <span>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-2">
                {hasSymbol ? (
                  <CircleCheck className="text-green-600 w-5 h-5" />
                ) : (
                  <CircleX className="text-red-500 w-5 h-5" />
                )}
                <span>At least 1 special symbol</span>
              </div>
              <div className="flex items-center gap-2">
                {isMatch ? (
                  <CircleCheck className="text-green-600 w-5 h-5" />
                ) : (
                  <CircleX className="text-red-500 w-5 h-5" />
                )}
                <span>Passwords match</span>
              </div>
            </div>
          )}

          {/* Submit Register Button */}
          <button
            type="submit"
            className="w-full bg-[#00FF33] text-black py-2 rounded-md font-semibold hover:brightness-105 transition shadow"
          >
            Register
          </button>
        </form>

        {/* Or continue with */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 mb-3">or continue with</p>
          <div className="flex flex-col gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition text-sm font-medium">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition text-sm font-medium">
              <img src="https://www.svgrepo.com/show/448224/facebook.svg" alt="Facebook" className="w-5 h-5" />
              Continue with Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
