import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminNavbar.css";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  return (
    <nav className="admin-navbar">
      <div className="navbar__left">
        <div className="navbar__logo">
          <span className="navbar__logo-icon">⚙️</span>
        </div>
        <h1 className="navbar__title">E-NOTES Admin</h1>
      </div>

      <div className="navbar__center">
        <span className="navbar__subtitle">Management Console</span>
      </div>

      <div className="navbar__actions">
        <div className="navbar__user-info">
          <span className="navbar__role-badge">Administrator</span>
        </div>
        <button className="navbar__logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
