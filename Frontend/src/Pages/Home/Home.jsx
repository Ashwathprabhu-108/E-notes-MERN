import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import Saved from "../../assets/saved-icon.svg";
import Save_later from "../../assets/saved-bookmark-icon.svg";
import { useSearchFilter } from '../../context/SearchFilterContext';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { searchQuery, selectedCategory, resetFilters } = useSearchFilter();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedFiles, setSavedFiles] = useState([]);
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
  const [hoverTooltip, setHoverTooltip] = useState(null);
  const isAuthenticated = !!authToken;

  useEffect(() => {
    const fetchFilesAndSavedStatus = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch all files
        const filesResponse = await fetch(`${API_BASE_URL}/api/files`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        if (!filesResponse.ok) {
          throw new Error('Failed to fetch files');
        }

        const filesData = await filesResponse.json();
        setFiles(filesData);

        // Fetch saved files if user is authenticated
        if (token) {
          try {
            const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              setSavedFiles(userData.savedFiles || []);
            } else if (userResponse.status === 401) {
              // Token is invalid or expired, clear it
              localStorage.removeItem('token');
              setAuthToken(null);
              console.warn('Token expired, please log in again');
            }
          } catch (err) {
            console.error('Error fetching saved files:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Failed to load files. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilesAndSavedStatus();
    const interval = setInterval(fetchFilesAndSavedStatus, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = async (fileId, fileName) => {
    if (user?.isDisabled) {
      alert("Your account has been disabled. Contact support.");
      return;
    }
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/files/download/${fileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('Download failed:', response.status, errData);
        throw new Error(errData.message || 'Failed to download file');
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (error) {
      console.error('Download error:', error);
      alert(`Failed to download: ${error.message}`);
    }
  };

  const handleSaveLater = async (fileId) => {
    if (user?.isDisabled) {
      alert("Your account has been disabled. Contact support.");
      return;
    }
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const fileIdString = String(fileId);
      const isSaved = savedFiles.some(id => String(id) === fileIdString);
      const endpoint = isSaved ? 'unsave' : 'save';
      const url = `${API_BASE_URL}/api/files/${endpoint}/${fileId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update save status');
      }

      // Update local state
      if (isSaved) {
        setSavedFiles(savedFiles.filter(id => String(id) !== fileIdString));
      } else {
        setSavedFiles([...savedFiles, fileIdString]);
      }
    } catch (error) {
      console.error('Save/Unsave error:', error);
      alert(`Failed to update: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter files based on search query and selected category
  const filteredFiles = files.filter(file => {
    const matchesCategory = selectedCategory === 'All' || file.category === selectedCategory;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchLower || (
      file.title.toLowerCase().includes(searchLower) ||
      (file.tags && file.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
      file.document?.format?.toLowerCase().includes(searchLower) ||
      file.uploadedBy?.username?.toLowerCase().includes(searchLower)
    );

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return <div className="downloads-message">Loading files...</div>;
  }

  if (error) {
    return <div className="downloads-message error">{error}</div>;
  }

  if (files.length === 0) {
    return <div className="downloads-message">No files available yet.</div>;
  }

  if (filteredFiles.length === 0) {
    return <div className="downloads-message">No files found matching your search or filter.</div>;
  }

  return (
    <div className="downloads-main">
      <h2>All Files</h2>

      <div className="downloads-container">
        {filteredFiles.map((file) => (
          <div key={file._id} className="download-card">
            {/* Thumbnail */}
            <div
              className="download-thumbnail"
              onClick={() => {
                const token = localStorage.getItem('token');
                if (!token) {
                  navigate('/login');
                } else if (user?.isDisabled) {
                  alert("Your account has been disabled. Contact support.");
                } else {
                  navigate(`/preview/${file._id}`);
                }
              }}
              style={{ cursor: 'pointer' }}
              title="Click to preview"
            >
              {file.thumbnail?.url ? (
                <img
                  src={file.thumbnail.url}
                  alt={file.title}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/200x150?text=No+Thumbnail'}
                />
              ) : (
                <div className="no-thumbnail">No Image</div>
              )}
            </div>

            {/* File Details */}
            <div className="download-details">
              <h3 className="download-title">{file.title}</h3>

              <p className="download-category">
                <span className="category-badge">{file.category}</span>
              </p>

              {/* Tags */}
              {file.tags && file.tags.length > 0 && (
                <div className="download-tags">
                  {file.tags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                  {file.tags.length > 2 && <span className="tag">+{file.tags.length - 2}</span>}
                </div>
              )}

              <div className="download-stats">
                <span className="download-count">{file.downloadCount} downloads</span>
                {file.uploadedBy && file.uploadedBy.username && (
                  <span className="uploaded-by">by {file.uploadedBy.username}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="file-actions">
                <div className="action-button-wrapper">
                  <button
                    className="download-btn"
                    onClick={() => handleDownload(file._id, file.document.name)}
                    title="Download this file"
                    onMouseEnter={() => !isAuthenticated && setHoverTooltip(`download-${file._id}`)}
                    onMouseLeave={() => setHoverTooltip(null)}
                  >
                    Download
                  </button>
                  {!isAuthenticated && hoverTooltip === `download-${file._id}` && (
                    <div className="login-tooltip">Login to download</div>
                  )}
                </div>

                {/* Save Later Icon */}
                <div className="action-button-wrapper">
                  <button
                    className="icon-btn save-later"
                    title={savedFiles.some(id => String(id) === String(file._id)) ? "Remove from saved" : "Save for later"}
                    onClick={() => handleSaveLater(file._id)}
                    onMouseEnter={() => !isAuthenticated && setHoverTooltip(`save-${file._id}`)}
                    onMouseLeave={() => setHoverTooltip(null)}
                  >
                    {savedFiles.some(id => String(id) === String(file._id)) ? (
                      <img src={Save_later} alt="Saved" width="16" height="16" />
                    ) : (
                      <img src={Saved} alt="Save for later" width="16" height="16" />
                    )}
                  </button>
                  {!isAuthenticated && hoverTooltip === `save-${file._id}` && (
                    <div className="login-tooltip">Login to save</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;