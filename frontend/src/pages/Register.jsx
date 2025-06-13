import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";

function Register() {
  // const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const navigate = useNavigate(); // ✅ Initialize navigation

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await registerUser({/* username,*/ email, password, password2 });
      console.log("Registered successfully:", res.data);

      alert("You are registered successfully!"); // ✅ Show success alert

      navigate("/login"); // ✅ Redirect to login page

    } catch (error) {
      if (error.response) {
        console.error("Register error:", error.response.data);
        alert("Registration failed: " + error.response.data.message);
      } else if (error.request) {
        console.error("No response from server:", error.request);
        alert("No response from server.");
      } else {
        console.error("Error during registration:", error.message);
        alert("An unexpected error occurred.");
      }
    }
  };
// setmail usestate lagana hai 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleRegister} 
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Create an Account
        </h2>

        {/* <div className="mb-4">
          <label htmlFor="username" className="block mb-1 text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div> */}

        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block mb-1 text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
{/* re enter password section hai teh wala */}
         <div className="mb-6">
          <label htmlFor="password" className="block mb-1 text-gray-700">
            Confirm Password
          </label>
          <input
            id="password2"
            type="password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Re-enter your password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Register
        </button>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
