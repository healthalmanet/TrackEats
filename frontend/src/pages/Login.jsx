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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });
      const { access: accessToken, refresh: refreshToken, role, email: userEmail, full_name } = res.data;
      const userInfo = { role, email: userEmail, full_name };

      login(accessToken, userInfo);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userRole", role.toLowerCase());

      toast.success(`Welcome, ${full_name || 'User'}!`);

      const roleLower = role.toLowerCase();
      const path = {
        "nutritionist": "/nutritionist",
        "operator": "/operator",
        "owner": "/owner",
      }[roleLower] || "/dashboard";
      
      navigate(path);
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed. Please check your credentials.");
      console.error("Login error:", error);
    }
  };

  return (
    // The main container has no background as it will be inside a themed modal.
    <div className="text-left w-full max-w-sm mx-auto p-4 font-['Poppins']">
      <h2 className="text-3xl font-['Lora'] font-bold text-center mb-6 text-heading">Login</h2>
      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block mb-1 font-semibold text-heading">
            Email Address
          </label>
          <div className="relative">
            <input
              id="login-email"
              type="email"
              className="w-full pl-10 pr-4 py-3 bg-main border border-custom text-heading rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-sm placeholder:text-body/60"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-body/60" />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="login-password" className="block mb-1 font-semibold text-heading">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type="password"
              className="w-full pl-10 pr-4 py-3 bg-main border border-custom text-heading rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-sm placeholder:text-body/60"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-body/60" />
          </div>
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <a
            href="/forgot-password"
            className="text-sm text-primary hover:underline font-medium"
          >
            Forgot Password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-hover text-light px-5 py-3 rounded-lg font-semibold shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          Login
        </button>
      </form>

      {/* OR Continue With */}
      <div className="mt-6 text-center">
        <p className="text-body text-sm mb-2">or continue with</p>
        <div className="flex justify-center gap-4">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-6 h-6 cursor-pointer hover:scale-110 transition"
          />
          <img
            src="https://www.svgrepo.com/show/448224/facebook.svg"
            alt="Facebook"
            className="w-6 h-6 cursor-pointer hover:scale-110 transition"
          />
        </div>
      </div>

      {/* Switch to Register */}
      <div className="mt-6 text-center text-sm">
        <span className="text-body font-medium">New here? </span>
        <button
          onClick={onSwitchToRegister}
          className="text-primary font-semibold underline hover:text-primary-hover transition"
        >
          Register here
        </button>
      </div>
    </div>
  );
};

export default Login;