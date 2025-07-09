
import React, { useState } from "react";
import { registerUser } from "../api/auth";
import { User, Mail, Lock, CircleCheck, CircleX } from "lucide-react";
import { toast } from "react-toastify";

const Register = ({ onClose, onSwitchToLogin }) => {
  const [full_name, setfull_name] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showChecklist, setShowChecklist] = useState(false);

  const isLengthValid = password.length >= 8;
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isMatch = password2 !== "" && password === password2;
  const isFormValid = isLengthValid && hasSymbol && isMatch;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.warning("Please ensure your password meets all the requirements.");
      return;
    }

    try {
      await registerUser({ full_name, email, password, password2 });
      toast.success("Registration successful! Redirecting to login...");
setTimeout(() => {
  onSwitchToLogin(); // Switch to login modal
}, 1000);

    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="text-left w-full max-w-xs mx-auto text-sm">
      <h2 className="text-xl font-bold text-center mb-4 text-gray-900">Sign up</h2>

      <form onSubmit={handleRegister}>
        {/* Full Name */}
        <div className="mb-3">
          <label htmlFor="full_name" className="block mb-1 font-medium text-gray-800">
            Name
          </label>
          <div className="relative">
            <input
              id="full_name"
              type="text"
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#FF6B3D] text-sm placeholder:text-xs"
              placeholder="Full name"
              value={full_name}
              onChange={(e) => setfull_name(e.target.value)}
              required
            />
            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="block mb-1 font-medium text-gray-800">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#FF6B3D] text-sm placeholder:text-xs"
              placeholder="email@domain"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label htmlFor="password" className="block mb-1 font-medium text-gray-800">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type="password"
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#FF6B3D] text-sm placeholder:text-xs"
              placeholder="Min 8 chars + symbol"
              value={password}
              onFocus={() => setShowChecklist(true)}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-3">
          <label htmlFor="password2" className="block mb-1 font-medium text-gray-800">
            Confirm
          </label>
          <input
            id="password2"
            type="password"
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#FF6B3D] text-sm placeholder:text-xs"
            placeholder="Re-enter"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
        </div>

        {/* Checklist */}
        {(showChecklist || password || password2) && (
          <div className="mb-3 text-xs text-gray-700 bg-[#FFF8F0] border border-orange-200 p-2 rounded-md space-y-1">
            <div className="flex items-center gap-2">
              {isLengthValid ? (
                <CircleCheck className="text-green-600 w-4 h-4" />
              ) : (
                <CircleX className="text-red-500 w-4 h-4" />
              )}
              <span>8+ characters</span>
            </div>
            <div className="flex items-center gap-2">
              {hasSymbol ? (
                <CircleCheck className="text-green-600 w-4 h-4" />
              ) : (
                <CircleX className="text-red-500 w-4 h-4" />
              )}
              <span>1+ symbol</span>
            </div>
            <div className="flex items-center gap-2">
              {isMatch ? (
                <CircleCheck className="text-green-600 w-4 h-4" />
              ) : (
                <CircleX className="text-red-500 w-4 h-4" />
              )}
              <span>Passwords match</span>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
  type="submit"
  className="w-full bg-[#FF6B3D] hover:bg-[#e85c2a] hover:shadow-lg text-white px-5 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
>
  Register
</button>

      </form>

      {/* Social */}
      <div className="mt-5 text-center">
        <p className="text-gray-500 text-xs mb-2">or continue with</p>
        <div className="flex justify-center gap-4">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5 cursor-pointer hover:scale-110 transition"
          />
          <img
            src="https://www.svgrepo.com/show/448224/facebook.svg"
            alt="Facebook"
            className="w-5 h-5 cursor-pointer hover:scale-110 transition"
          />
        </div>
      </div>

      {/* Switch to Login */}
      <div className="mt-4 text-center text-xs">
        <span className="text-gray-700 font-medium">Already registered? </span>
        <button
          onClick={onSwitchToLogin}
          className="text-[#FF6B3D] font-semibold underline hover:text-[#e85c2a] transition"
        >
          Login here
        </button>
      </div>
    </div>
  );
};

export default Register;
