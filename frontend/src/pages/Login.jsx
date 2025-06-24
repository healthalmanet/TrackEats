import React, { useState } from "react";
import { loginUser } from "../api/auth";
import { useAuth } from "../components/context/AuthContext";
import { Mail, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = ({ onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const GOOGLE_AUTH_URL = "http://localhost:5000/auth/google";
  const FACEBOOK_AUTH_URL = "http://localhost:5000/auth/facebook";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });
      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;

      // avoid conflict with state variable 'email'
      const { role, email: userEmail, full_name } = res.data;
      const userInfo = { role, email: userEmail, full_name };

      login(accessToken, userInfo);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userRole", role.toLowerCase());

      toast.success(`Welcome, ${role}!`);

      // Navigate based on role
      const roleLower = role.toLowerCase();
      if (roleLower === "nutritionist") {
        navigate("/nutritionist");
      } else if (roleLower === "operator") {
        navigate("/operator");
      } else if (roleLower === "owner") {
        navigate("/owner");
      } else {
        navigate("/dashboard");
      }

      onClose?.();
    } catch (error) {
      toast.error("Login failed. Please check your email or password.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="text-left w-full max-w-sm mx-auto bg-white p-6 rounded-xl ">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Login</h2>
      <form onSubmit={handleLogin}>
        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 font-semibold text-gray-800">
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF33] placeholder:text-sm"
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
          <label htmlFor="password" className="block mb-1 font-semibold text-gray-800">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type="password"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF33] placeholder:text-sm"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Forgot Password */}
        <div className="mb-4 text-right">
          <a
            href="/forgot-password"
            className="text-sm text-[#00AA22] hover:underline font-medium"
          >
            Forgot Password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[#00FF33] text-black py-2 rounded-md font-semibold 
                 hover:brightness-105 cursor-pointer transition-transform duration-150 
                 active:scale-95 shadow"
        >
          Login
        </button>
      </form>

      {/* OR Continue With */}
      <div className="mt-5 text-center">
        <p className="text-gray-500 text-sm mb-2">or continue with</p>
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

      {/* Switch to Register */}
      <div className="mt-4 text-center text-sm">
        <span className="text-gray-700 font-medium">New here? </span>
        <button
          onClick={onSwitchToRegister}
          className="text-[#00AA22] font-semibold underline hover:text-[#008c1c] transition"
        >
          Register here
        </button>
      </div>
    </div>
  );
};

export default Login;
