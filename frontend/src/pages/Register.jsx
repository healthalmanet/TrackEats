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
      toast.warning("Please ensure your password meets all requirements.");
      return;
    }
    try {
      await registerUser({ full_name, email, password, password2 });
      toast.success("Registration successful! Please login to continue.");
      setTimeout(() => {
        onSwitchToLogin();
      }, 1000);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    // The main container is designed to fit inside a themed modal.
    <div className="text-left w-full max-w-sm mx-auto p-4 font-['Poppins']">
      <h2 className="text-3xl font-['Lora'] font-bold text-center mb-6 text-heading">Create Account</h2>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="register-full_name" className="block mb-1 font-semibold text-heading text-sm">
            Full Name
          </label>
          <div className="relative">
            <input
              id="register-full_name"
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-main border border-custom text-heading rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-sm placeholder:text-body/60"
              placeholder="Enter your full name"
              value={full_name}
              onChange={(e) => setfull_name(e.target.value)}
              required
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-body/60" />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="register-email" className="block mb-1 font-semibold text-heading text-sm">
            Email
          </label>
          <div className="relative">
            <input
              id="register-email"
              type="email"
              className="w-full pl-10 pr-4 py-3 bg-main border border-custom text-heading rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-sm placeholder:text-body/60"
              placeholder="email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-body/60" />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="register-password" className="block mb-1 font-semibold text-heading text-sm">
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type="password"
              className="w-full pl-10 pr-4 py-3 bg-main border border-custom text-heading rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-sm placeholder:text-body/60"
              placeholder="Min 8 chars + 1 symbol"
              value={password}
              onFocus={() => setShowChecklist(true)}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-body/60" />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="register-password2" className="block mb-1 font-semibold text-heading text-sm">
            Confirm Password
          </label>
          <input
            id="register-password2"
            type="password"
            className="w-full px-4 py-3 bg-main border border-custom text-heading rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-sm placeholder:text-body/60"
            placeholder="Re-enter your password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
        </div>

        {/* Checklist */}
        {(showChecklist || password || password2) && (
          <div className="text-sm text-heading bg-primary/10 border border-primary/20 p-3 rounded-md space-y-1">
            <div className={`flex items-center gap-2 ${isLengthValid ? 'text-primary' : 'text-red'}`}>
              {isLengthValid ? <CircleCheck className="w-4 h-4" /> : <CircleX className="w-4 h-4" />}
              <span>At least 8 characters</span>
            </div>
            <div className={`flex items-center gap-2 ${hasSymbol ? 'text-primary' : 'text-red'}`}>
              {hasSymbol ? <CircleCheck className="w-4 h-4" /> : <CircleX className="w-4 h-4" />}
              <span>At least 1 special symbol</span>
            </div>
            <div className={`flex items-center gap-2 ${isMatch ? 'text-primary' : 'text-red'}`}>
              {isMatch ? <CircleCheck className="w-4 h-4" /> : <CircleX className="w-4 h-4" />}
              <span>Passwords match</span>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full bg-primary hover:bg-primary-hover text-light px-5 py-3 rounded-lg font-semibold shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Register
        </button>
      </form>

      {/* Social */}
      <div className="mt-6 text-center">
        <p className="text-body text-sm mb-2">or continue with</p>
        <div className="flex justify-center gap-4">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 cursor-pointer hover:scale-110 transition" />
          <img src="https://www.svgrepo.com/show/448224/facebook.svg" alt="Facebook" className="w-6 h-6 cursor-pointer hover:scale-110 transition" />
        </div>
      </div>

      {/* Switch to Login */}
      <div className="mt-6 text-center text-sm">
        <span className="text-body font-medium">Already registered? </span>
        <button
          onClick={onSwitchToLogin}
          className="text-primary font-semibold underline hover:text-primary-hover transition"
        >
          Login here
        </button>
      </div>
    </div>
  );
};

export default Register;