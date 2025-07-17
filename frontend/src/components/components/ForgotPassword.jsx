import React, { useState } from "react";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom"; // Import Link for the "Back" button
import { forgotPassword } from "../../api/auth";
import { toast } from "react-hot-toast"; // Using toast for better feedback

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-main px-4 font-['Poppins']">
      <div className="w-full max-w-md bg-section border border-custom rounded-2xl shadow-lg p-6 sm:p-8 my-10">
        
        <div className="text-center">
            <h2 className="text-3xl font-['Lora'] font-bold text-heading mb-2">Forgot Password</h2>
            {!submitted && (
              <p className="text-body mb-6">Enter your email to receive a reset link.</p>
            )}
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <p className="text-center text-body font-medium">
              If an account with that email exists, you will receive a password reset link shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block mb-1 font-semibold text-heading">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-main border border-custom text-heading rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-body/60"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-body/60" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-light py-3 rounded-lg font-semibold hover:bg-primary-hover active:scale-[.98] transition duration-200 shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
            <Link to="/" className="text-sm font-medium text-primary hover:underline flex items-center justify-center gap-1">
                <ArrowLeft size={16} />
                Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;