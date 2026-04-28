import React, { useState, useEffect } from 'react';
import './Home.css';

const Home = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/files', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }

        const data = await response.json();
        setFiles(data);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Failed to load files. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleDownload = async (fileId, fileName) => {
    try {
      // Get download URL from backend (which increments download count)
      const response = await fetch(`http://localhost:5000/api/files/download/${fileId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get download link');
      }

      const { downloadUrl, fileName: backendFileName } = await response.json();
      
      // Open download URL in new tab - lets browser/Cloudinary handle the download
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="home-container">
        <div className="empty-state">
          <p>No files available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>All Files</h1>
        <p>Sorted by downloads and recent uploads</p>
      </div>

      <div className="files-grid">
        {files.map((file) => (
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
                <span className="download-count">📥 {file.downloadCount} downloads</span>
              </div>

              {/* Action Buttons */}
              <div className="file-actions">
                <button
                  className="download-btn"
                  onClick={() => handleDownload(file._id, file.document.name)}
                  title="Download this file"
                >
                  ⬇️ Download
                </button>

                {/* Save Later Icon Placeholder */}
                <button
                  className="icon-btn save-later"
                  title="Save for later"
                  onClick={() => console.log('Save for later:', file._id)}
                >
                  {/* Add your save later icon here */}
                  🔖
                </button>

                {/* Saved Files Icon Placeholder */}
                <button
                  className="icon-btn saved-files"
                  title="Saved files"
                  onClick={() => console.log('View saved files:', file._id)}
                >
                  {/* Add your saved files icon here */}
                  💾
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;