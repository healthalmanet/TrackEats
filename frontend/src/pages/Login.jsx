import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../components/context/AuthContext";
import { Mail, Lock } from "lucide-react";
import logo from "../assets/logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // Backend OAuth URLs
  const GOOGLE_AUTH_URL = "http://localhost:5000/auth/google";
  const FACEBOOK_AUTH_URL = "http://localhost:5000/auth/facebook";

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser({ email, password });

      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;
      const userInfo = res.data.user || { email };
      const role = userInfo.role;

      login(accessToken, userInfo);
      localStorage.setItem("refreshToken", refreshToken);

      alert("You are logged in successfully!");

      if (role === "Owner" || role === "Operator" || role === "Nutritionist") {
        navigate(`/${role.toLowerCase()}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      alert("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };

  const handleFacebookLogin = () => {
    window.location.href = FACEBOOK_AUTH_URL;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-2xl p-6 my-10">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="TrackEats Logo" className="w-36 h-auto sm:w-40 mb-2" />
        </div>

        {/* Toggle Tabs */}
        <div className="flex bg-gray-100 rounded-xl mb-6 overflow-hidden">
          <Link to="/login" className="w-1/2">
            <button className="w-full py-2 font-semibold bg-[#00FF33] text-black rounded-lg transition">
              Login
            </button>
          </Link>
          <Link to="/register" className="w-1/2">
            <button className="w-full py-2 font-medium text-gray-800">
              Register
            </button>
          </Link>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
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
          <div className="mb-1">
            <label htmlFor="password" className="block mb-1 font-medium text-gray-800">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Forgot Password */}
          <div className="mb-6 text-right">
            <Link to="/forgot-password" className="text-sm text-[#00AA22] hover:underline font-medium">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#00FF33] text-black py-2 rounded-md font-semibold hover:brightness-105 transition shadow"
          >
            Login
          </button>
        </form>

        {/* OR Continue With */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 mb-3">or continue with</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition text-sm font-medium"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            <button
              onClick={handleFacebookLogin}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition text-sm font-medium"
            >
              <img
                src="https://www.svgrepo.com/show/448224/facebook.svg"
                alt="Facebook"
                className="w-5 h-5"
              />
              Continue with Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
