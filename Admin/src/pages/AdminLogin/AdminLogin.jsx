import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Clear any stale token so login page always shows fresh
    // (do not auto-redirect, let user explicitly log in)
    return () => {};
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Store token and redirect
      localStorage.setItem("adminToken", data.token);
      if (onLogin) onLogin();
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <h1>E-Notes Admin</h1>
        <p className="subtitle">Admin Panel Login</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@enotes.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="demo-text">Demo credentials: admin@enotes.com / admin123</p>
      </div>
    </div>
  );
};

export default AdminLogin;
