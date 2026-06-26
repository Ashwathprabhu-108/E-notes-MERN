import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, FileText, Flag, LogOut } from "lucide-react";
import "./AdminSidebar.css";

const navLinks = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users",     to: "/admin/users",     icon: Users },
  { label: "Files",     to: "/admin/files",     icon: FileText },
  { label: "Reports",   to: "/admin/reports",   icon: Flag },
];

const AdminSidebar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    if (onLogout) onLogout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        <ul className="sidebar__links">
          {navLinks.map(({ label, to, icon: Icon }) => (
            <li key={label}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
              >
                <span className="sidebar__link-icon">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span className="sidebar__link-label">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={15} strokeWidth={2} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;