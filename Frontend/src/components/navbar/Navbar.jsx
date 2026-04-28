import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/E-Notes.png";
import SearchIcon from "../../assets/Search.svg";
import UploadIcon from "../../assets/FileUpload.svg";

const Navbar = () => {
  const categories = ["All","Science", "Technology", "Entertainment", "Economy", "Politics", "Cooking", "Health", "Travel", "Education", "Sports", "Art", "History"];

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <div className="navbar__logo-icon">
          <span className="navbar__logo-fallback"><img src={logo} alt="E-Notes" /></span>
        </div>
      </div>
      <h1>E-NOTES</h1>
      <ul className="navbar__categories">
        {categories.map((cat) => (
          <li key={cat}>
            <a href="#" className="navbar__cat-link">{cat}</a>
          </li>
        ))}
      </ul>

    <div className="navbar__actions">
      <div className="navbar__search-wrapper">
        <input
        type="text"
        className="navbar__search"
        placeholder="Search..."
        />
       <button className="navbar__search-btn" aria-label="Search">
        <img src={SearchIcon} alt="Search" width="16" height="16" />
       </button>
       </div>

       <Link to="/upload">
       <button className="navbar__upload-btn">
        <img src={UploadIcon} alt="Upload" width="16" height="16" />
        Upload
       </button>
       </Link>
      </div>
    </nav>
  );
};

export default Navbar;