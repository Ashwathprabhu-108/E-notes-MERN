import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SavedFiles.css';
import Save_later from "../../assets/saved-bookmark-icon.svg";
import API_BASE_URL from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const SavedFiles = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedFilesData, setSavedFilesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSavedFiles = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Please log in to view saved files');
          setLoading(false);
          return;
        }

        // Fetch user data with saved files
        const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            localStorage.removeItem('token');
            throw new Error('Session expired. Please log in again.');
          }
          throw new Error('Failed to fetch saved files');
        }

        const userData = await userResponse.json();
        const savedFileIds = userData.savedFiles || [];

        // Fetch all files to get complete details
        const filesResponse = await fetch(`${API_BASE_URL}/api/files`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!filesResponse.ok) {
          throw new Error('Failed to fetch files');
        }

        const allFiles = await filesResponse.json();

        // Filter files that are in the saved list
        const savedFiles = allFiles.filter(file =>
          savedFileIds.some(id => String(id) === String(file._id))
        );

        setSavedFilesData(savedFiles);
      } catch (err) {
        console.error('Error fetching saved files:', err);
        setError(err.message || 'Failed to load saved files.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedFiles();
    const interval = setInterval(fetchSavedFiles, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/files/download/${fileId}`, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
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

  const handleUnsave = async (fileId) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Please log in to save files');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/files/unsave/${fileId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to unsave file');
      }

      // Remove from local state
      setSavedFilesData(savedFilesData.filter(file => String(file._id) !== String(fileId)));
    } catch (error) {
      console.error('Unsave error:', error);
      alert(`Failed to update: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="downloads-message">Loading saved files...</div>;
  }

  if (error) {
    return <div className="downloads-message error">{error}</div>;
  }

  if (user?.isDisabled) {
    return (
      <div className="downloads-main">
        <h2>Saved Files</h2>
        <div className="downloads-message error">
          ⚠️ Your account has been disabled. Contact support.
        </div>
      </div>
    );
  }

  if (savedFilesData.length === 0) {
    return (
      <div className="downloads-main">
        <h2>Saved Files</h2>
        <div className="downloads-message">
          No saved files yet. Start saving files from the Home page!
        </div>
      </div>
    );
  }

  return (
    <div className="downloads-main">
      <h2>Saved Files</h2>

      <div className="downloads-container">
        {savedFilesData.map((file) => (
          <div key={file._id} className="download-card">
            {/* Thumbnail */}
            <div
              className="download-thumbnail"
              onClick={() => navigate(`/preview/${file._id}`)}
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
                {/* Download — grows to fill available width */}
                <div className="action-button-wrapper">
                  <button
                    className="download-btn"
                    onClick={() => handleDownload(file._id, file.document.name)}
                    title="Download this file"
                  >
                    Download
                  </button>
                </div>

                {/* Unsave icon — stays compact */}
                <div className="action-button-wrapper">
                  <button
                    className="icon-btn unsave-btn"
                    title="Remove from saved"
                    onClick={() => handleUnsave(file._id)}
                  >
                    <img src={Save_later} alt="Remove from saved" width="16" height="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedFiles;
