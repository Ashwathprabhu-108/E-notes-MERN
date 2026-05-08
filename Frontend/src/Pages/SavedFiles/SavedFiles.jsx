import React, { useState, useEffect } from 'react';
import './SavedFiles.css';
import saved from "../../assets/saved-icon.svg";
import Save_later from "../../assets/saved-bookmark-icon.svg";

const SavedFiles = () => {
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
        const userResponse = await fetch('http://localhost:5000/api/auth/me', {
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
        const filesResponse = await fetch('http://localhost:5000/api/files', {
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
  }, []);

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/files/download/${fileId}`, {
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

      const response = await fetch(`http://localhost:5000/api/files/unsave/${fileId}`, {
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
    return (
      <div className="saved-files-container">
        <div className="loading">Loading saved files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-files-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (savedFilesData.length === 0) {
    return (
      <div className="saved-files-container">
        <div className="saved-files-header">
          <h1>Saved Files</h1>
          <p>Your collection of saved documents</p>
        </div>
        <div className="empty-state">
          <p>No saved files yet. Start saving files from the Home page!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-files-container">
      <div className="saved-files-header">
        <h1>Saved Files</h1>
        <p>You have {savedFilesData.length} saved file{savedFilesData.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="files-grid">
        {savedFilesData.map((file) => (
          <div key={file._id} className="file-card">
            {/* Thumbnail */}
            <div className="file-thumbnail">
              {file.thumbnail?.url ? (
                <img src={file.thumbnail.url} alt={file.title} />
              ) : (
                <div className="no-thumbnail">No Image</div>
              )}
            </div>

            {/* File Info */}
            <div className="file-info">
              <h3 className="file-title">{file.title}</h3>

              <div className="file-meta">
                <span className="category-badge">{file.category}</span>
              </div>

              {/* Tags */}
              {file.tags && file.tags.length > 0 && (
                <div className="file-tags">
                  {file.tags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="tag">
                      {tag}
                    </span>
                  ))}
                  {file.tags.length > 2 && <span className="tag">+{file.tags.length - 2}</span>}
                </div>
              )}

              {/* Upload Info */}
              <div className="upload-info">
                <p className="uploaded-by">
                  By <strong>{file.uploadedBy?.username || 'Unknown'}</strong>
                </p>
                <p className="uploaded-date">{formatDate(file.createdAt)}</p>
              </div>

              {/* Download Count */}
              <div className="download-stats">
                <span className="download-count">{file.downloadCount} downloads</span>
              </div>

              {/* Action Buttons */}
              <div className="file-actions">
                <button
                  className="download-btn"
                  onClick={() => handleDownload(file._id, file.document.name)}
                  title="Download this file"
                >
                  Download
                </button>

                {/* Remove from saved */}
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
        ))}
      </div>
    </div>
  );
};

export default SavedFiles;
