import React, { useState } from "react";
import { Lock, CircleCheck, CircleX } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../api/auth";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { uidb64, token } = useParams();

  const isLengthValid = password.length >= 8;
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isMatch = password && password === confirmPassword;
  const isFormValid = isLengthValid && hasSymbol && isMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.warning("Please meet all password requirements.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ uidb64, token, password });
      toast.success("Password reset successful! Redirecting to login...");
      setSubmitted(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Password reset failed. The link may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-main px-4 font-['Poppins']">
      <div className="w-full max-w-md bg-section border border-custom rounded-2xl shadow-lg py-10 px-6 sm:px-8 my-10">
        <h2 className="text-3xl font-['Lora'] font-bold text-center text-heading mb-6">
          Reset Password
        </h2>

        {submitted ? (
          <div className="text-center py-4">
            <CircleCheck className="w-16 h-16 text-primary mx-auto mb-4" />
            <p className="text-center text-body font-medium">
              Password updated successfully! Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block mb-1 font-semibold text-heading">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-main border border-custom text-heading rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-body/60"
                  placeholder="Create a new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setShowChecklist(true)}
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-body/60" />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block mb-1 font-semibold text-heading">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full px-4 py-3 bg-main border border-custom text-heading rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-body/60"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Password Checklist */}
            {(showChecklist || confirmPassword) && (
              <div className="text-sm text-heading bg-primary/10 border border-primary/20 p-3 rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  {isLengthValid ? <CircleCheck className="text-primary w-5 h-5" /> : <CircleX className="text-red w-5 h-5" />}
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasSymbol ? <CircleCheck className="text-primary w-5 h-5" /> : <CircleX className="text-red w-5 h-5" />}
                  <span>At least 1 special symbol</span>
                </div>
                <div className="flex items-center gap-2">
                  {isMatch ? <CircleCheck className="text-primary w-5 h-5" /> : <CircleX className="text-red w-5 h-5" />}
                  <span>Passwords match</span>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full bg-primary text-light py-3 rounded-lg font-semibold hover:bg-primary-hover active:scale-95 transition shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;