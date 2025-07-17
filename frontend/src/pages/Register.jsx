// src/components/auth/Register.jsx

import React, { useState } from "react";
import { registerUser } from "../api/auth";
import { User, Mail, Lock, CircleCheck, CircleX } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const Register = ({ onClose, onSwitchToLogin }) => {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showChecklist, setShowChecklist] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLengthValid = password.length >= 8;
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isMatch = password2 !== "" && password === password2;
  const isFormValid = isLengthValid && hasSymbol && isMatch;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.warning("Please ensure your password meets all requirements.");
      return;
    }
    setLoading(true);
    try {
      await registerUser({ full_name, email, password, password2 });
      toast.success("Registration successful! Please login to continue.");
      setTimeout(() => {
        onSwitchToLogin();
      }, 1000);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checklistItemVariants = {
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
        Create Account
      </motion.h2>

      <motion.form 
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        onSubmit={handleRegister} 
        className="space-y-4"
      >
        <motion.div variants={checklistItemVariants}>
          <label htmlFor="register-full_name" className="block mb-1 font-semibold text-[var(--color-text-strong)] text-sm">Full Name</label>
          <div className="relative">
            <input id="register-full_name" type="text" className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-sm placeholder:text-[var(--color-text-muted)]" placeholder="Enter your full name" value={full_name} onChange={(e) => setFullName(e.target.value)} required />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
          </div>
        </motion.div>

        <motion.div variants={checklistItemVariants}>
          <label htmlFor="register-email" className="block mb-1 font-semibold text-[var(--color-text-strong)] text-sm">Email</label>
          <div className="relative">
            <input id="register-email" type="email" className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-sm placeholder:text-[var(--color-text-muted)]" placeholder="email@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
          </div>
        </motion.div>

        <motion.div variants={checklistItemVariants}>
          <label htmlFor="register-password" className="block mb-1 font-semibold text-[var(--color-text-strong)] text-sm">Password</label>
          <div className="relative">
            <input id="register-password" type="password" className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-sm placeholder:text-[var(--color-text-muted)]" placeholder="Min 8 chars + 1 symbol" value={password} onFocus={() => setShowChecklist(true)} onChange={(e) => setPassword(e.target.value)} required />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
          </div>
        </motion.div>

        <motion.div variants={checklistItemVariants}>
          <label htmlFor="register-password2" className="block mb-1 font-semibold text-[var(--color-text-strong)] text-sm">Confirm Password</label>
          <div className="relative">
            <input id="register-password2" type="password" className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-sm placeholder:text-[var(--color-text-muted)]" placeholder="Re-enter your password" value={password2} onChange={(e) => setPassword2(e.target.value)} required />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
          </div>
        </motion.div>

        <AnimatePresence>
        {(showChecklist || password || password2) && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="text-sm text-[var(--color-text-strong)] bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] p-3 rounded-md space-y-1"
          >
            <div className={`flex items-center gap-2 ${isLengthValid ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
              {isLengthValid ? <CircleCheck className="w-4 h-4" /> : <CircleX className="w-4 h-4" />}
              <span>At least 8 characters</span>
            </div>
            <div className={`flex items-center gap-2 ${hasSymbol ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
              {hasSymbol ? <CircleCheck className="w-4 h-4" /> : <CircleX className="w-4 h-4" />}
              <span>At least 1 special symbol</span>
            </div>
            <div className={`flex items-center gap-2 ${isMatch ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
              {isMatch ? <CircleCheck className="w-4 h-4" /> : <CircleX className="w-4 h-4" />}
              <span>Passwords match</span>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* 
          FIX: The error was caused by a stray ">" on a new line after the opening <motion.button> tag.
          The code below is now correct.
        */}
        <motion.button
          variants={checklistItemVariants}
          type="submit"
          disabled={!isFormValid || loading}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] px-5 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:transform-none disabled:shadow-md"
        >
          {loading ? 'Registering...' : 'Register'}
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
        <span className="text-[var(--color-text-default)] font-medium">Already registered? </span>
        <button
          onClick={onSwitchToLogin}
          className="text-[var(--color-primary)] font-semibold underline hover:text-[var(--color-primary-hover)] transition-colors"
        >
          Login here
        </button>
      </motion.div>
    </div>
  );
};

export default Register;