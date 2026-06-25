import React from "react";
import "./AdminNavbar.css";

const AdminNavbar = () => {

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
      </div>
    </nav>
  );
};

export default AdminNavbar;
