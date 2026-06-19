import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import "./Downloads.css";

const Downloads = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        if (!user) {
          setError('Please log in to view your downloads.');
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
          setError('Please log in to view your downloads.');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/files/my-downloads', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            setError('Session expired. Please log in again.');
          } else {
            throw new Error('Failed to fetch downloads');
          }
        } else {
          const data = await response.json();
          setDownloads(data);
        }
      } catch (err) {
        console.error('Error fetching downloads:', err);
        setError('Failed to load your downloads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [user]);

  const handleDownload = (fileId, fileName) => {
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:5000/api/files/download/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(err => console.error('Download failed:', err));
  };

  if (!user) {
    return <div className="downloads-message">Please log in to view your downloads.</div>;
  }

  if (loading) {
    return <div className="downloads-message">Loading...</div>;
  }

  if (error) {
    return <div className="downloads-message error">{error}</div>;
  }

  if (downloads.length === 0) {
    return <div className="downloads-message">No downloads yet.</div>;
  }

  return (
    <div className="downloads-main">
      <h2>My Downloads</h2>
      
      <div className="downloads-container">
        {downloads.map(file => (
          <div key={file._id} className="download-card">
            {/* Thumbnail */}
            {file.thumbnail && (
              <div 
                className="download-thumbnail"
                onClick={() => navigate(`/preview/${file._id}`)}
                style={{ cursor: 'pointer' }}
                title="Click to preview"
              >
                <img 
                  src={file.thumbnail.url} 
                  alt={file.title}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/200x150?text=No+Thumbnail'}
                />
              </div>
            )}
            
            {/* File Details */}
            <div className="download-details">
              <h3 className="download-title">{file.title}</h3>
              
              <p className="download-category">
                <span className="category-badge">{file.category}</span>
              </p>
              
              {file.tags && file.tags.length > 0 && (
                <div className="download-tags">
                  {file.tags.map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              
              <div className="download-stats">
                <span className="download-count">{file.downloadCount} downloads</span>
                {file.uploadedBy && file.uploadedBy.username && (
                  <span className="uploaded-by">by {file.uploadedBy.username}</span>
                )}
              </div>
              
              <button 
                onClick={() => handleDownload(file._id, file.document.name)}
                className="download-btn"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Downloads