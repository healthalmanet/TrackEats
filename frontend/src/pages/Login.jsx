// src/components/auth/Login.jsx

import React, { useState } from "react";
import { loginUser } from "../api/auth";
import { useAuth } from "../components/context/AuthContext";
import { Mail, Lock, Loader } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = ({ onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="text-left w-full max-w-sm mx-auto p-4 font-[var(--font-secondary)]">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-[var(--font-primary)] font-bold text-center mb-6 text-[var(--color-text-strong)]"
      >
        Login
      </motion.h2>

      <motion.form 
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        onSubmit={handleLogin} 
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <label htmlFor="login-email" className="block mb-1 font-semibold text-[var(--color-text-strong)] text-sm">Email Address</label>
          <div className="relative">
            <input
              id="login-email" type="email"
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-sm placeholder:text-[var(--color-text-muted)]"
              placeholder="Enter your email"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label htmlFor="login-password" className="block mb-1 font-semibold text-[var(--color-text-strong)] text-sm">Password</label>
          <div className="relative">
            <input
              id="login-password" type="password"
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-sm placeholder:text-[var(--color-text-muted)]"
              placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-right">
          <a href="/forgot-password" className="text-sm text-[var(--color-primary)] hover:underline font-medium">
            Forgot Password?
          </a>
        </motion.div>

        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] px-5 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:transform-none disabled:shadow-md"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="animate-spin" /> Logging in...
            </span>
          ) : (
            'Login'
          )}
        </motion.button>
      </motion.form>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }} className="mt-6 text-center">
        <p className="text-[var(--color-text-default)] text-sm mb-2">or continue with</p>
        <div className="flex justify-center gap-4">
          <motion.img whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 cursor-pointer" />
          <motion.img whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} src="https://www.svgrepo.com/show/448224/facebook.svg" alt="Facebook" className="w-6 h-6 cursor-pointer" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }} className="mt-6 text-center text-sm">
        <span className="text-[var(--color-text-default)] font-medium">New here? </span>
        <button onClick={onSwitchToRegister} className="text-[var(--color-primary)] font-semibold underline hover:text-[var(--color-primary-hover)] transition-colors">
          Register here
        </button>
      </motion.div>
    </div>
  );
};

export default Login;