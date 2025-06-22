import React, { useState } from "react";
import { Lock, CircleCheck, CircleX } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../api/auth"; // ✅ Make sure this exists

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  const navigate = useNavigate();
  const { uidb64, token } = useParams(); // ✅ Getting both uid and token

  const isLengthValid = password.length >= 8;
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isMatch = password && password === confirmPassword;
  const isFormValid = isLengthValid && hasSymbol && isMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.warning("Please fix the password requirements.");
      return;
    }

    try {
      await resetPassword({ uidb64, token, password });
      toast.success("✅ Password reset successful! Redirecting to login...");
      setSubmitted(true);

      setTimeout(() => navigate("/"), 3000); // Go to homepage, modal can open from there
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "❌ Password reset failed. Try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-2xl py-10 px-6 my-10">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Reset Password
        </h2>

        {submitted ? (
          <p className="text-center text-green-600 font-medium">
            ✅ Password updated successfully! Redirecting to login...
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block mb-1 font-medium text-gray-800">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                  placeholder="Create a new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setShowChecklist(true)}
                  required
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block mb-1 font-medium text-gray-800">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF33]"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Password Checklist */}
            {(showChecklist || confirmPassword) && (
              <div className="mb-4 text-sm text-gray-700 bg-green-50 border border-green-200 p-3 rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  {isLengthValid ? <CircleCheck className="text-green-600 w-5 h-5" /> : <CircleX className="text-red-500 w-5 h-5" />}
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasSymbol ? <CircleCheck className="text-green-600 w-5 h-5" /> : <CircleX className="text-red-500 w-5 h-5" />}
                  <span>At least 1 special symbol</span>
                </div>
                <div className="flex items-center gap-2">
                  {isMatch ? <CircleCheck className="text-green-600 w-5 h-5" /> : <CircleX className="text-red-500 w-5 h-5" />}
                  <span>Passwords match</span>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#00FF33] text-black py-2 rounded-md font-semibold hover:brightness-105 active:scale-95 transition shadow cursor-pointer"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
