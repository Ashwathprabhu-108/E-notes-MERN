import React from "react";
import { ShieldCheck } from "lucide-react";
import "./AdminNavbar.css";

const AdminNavbar = () => {
  return (
    <nav className="admin-navbar">
      <div className="navbar__left">
        <div className="navbar__logo">
          <ShieldCheck size={24} color="#ffffff" strokeWidth={2} />
        </div>
        <div className="navbar__brand">
          <h1 className="navbar__title">E-Notes</h1>

        </div>
      </div>

      <div className="navbar__actions">

        <div className="navbar__user-chip">
          <div className="navbar__avatar">A</div>
          <div className="navbar__user-info">
            <span className="navbar__user-name">Administrator</span>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
