import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../components/context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

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

      // Redirect based on actual role
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

  return (
    <form onSubmit={handleLogin}>
      <h2>Login to Your Account</h2>
{/* 
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
      </div> */}

      <div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Email"
    required
  />
</div>


      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
      </div>

      <button type="submit">Login</button>

      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </form>
  );
}

export default Login;
