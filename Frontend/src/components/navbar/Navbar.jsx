import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/E-Notes.png";
import SearchIcon from "../../assets/Search.svg";
import UploadIcon from "../../assets/FileUpload.svg";
import { useSearchFilter } from "../../context/SearchFilterContext";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const categories = ["All", "Academic", "Technology", "Business", "Science", "Arts & Humanities", "Law", "Medical", "Other"];
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useSearchFilter();
  const { user } = useAuth();

  const handleCategoryClick = (e, category) => {
    e.preventDefault();
    setSelectedCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

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
            <a 
              href="#" 
              className={`navbar__cat-link ${selectedCategory === cat ? 'navbar__cat-link--active' : ''}`}
              onClick={(e) => handleCategoryClick(e, cat)}
            >
              {cat}
            </a>
          </li>
        ))}
      </ul>

      <div className="navbar__actions">
        <div className="navbar__search-wrapper">
          <input
            type="text"
            className="navbar__search"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button className="navbar__search-btn" aria-label="Search">
            <img src={SearchIcon} alt="Search" width="16" height="16" />
          </button>
        </div>

        {!user?.isDisabled && (
          <Link className="upload_link" to="/upload">
            <button className="navbar__upload-btn">
              <img src={UploadIcon} alt="Upload" width="16" height="16" />
              Upload
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;