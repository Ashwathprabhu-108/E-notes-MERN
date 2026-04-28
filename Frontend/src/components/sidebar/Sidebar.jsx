import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const navLinks = [
  { label: "Home",        to: "/" },
  { label: "My Files",    to: "/my-files" },
  { label: "Downloads",   to: "/downloads" },
  { label: "Saved Files", to: "/saved-files" },
  { label: "About",       to: "/about" },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        <ul className="sidebar__links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        {user ? (
          <>
            <span className="sidebar__username"> {user.username}</span>
            <button className="sidebar__signin-btn logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">
            <button className="sidebar__signin-btn">Sign In</button>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;