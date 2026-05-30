import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyFiles.css';
import { useAuth } from '../../context/AuthContext';

const MyFiles = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingFile, setEditingFile] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', tags: '', category: '' });
  const [deleting, setDeleting] = useState(null);

  const categories = [
    "Academic",
    "Technology",
    "Business",
    "Science",
    "Arts & Humanities",
    "Law",
    "Medical",
    "Other",
  ];

  useEffect(() => {
    const fetchMyFiles = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Please log in to view your files.');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/files/my-files', {
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
            throw new Error('Failed to fetch files');
          }
        } else {
          const data = await response.json();
          setFiles(data);
        }
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Failed to load your files. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyFiles();
  }, []);

  const handleEdit = (file) => {
    setEditingFile(file);
    setEditForm({
      title: file.title,
      tags: file.tags.join(', '),
      category: file.category,
    });
  };

  const handleCancelEdit = () => {
    setEditingFile(null);
    setEditForm({ title: '', tags: '', category: '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      if (!editForm.title.trim()) {
        alert('Title is required.');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/files/${editingFile._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update file');
      }

      const updatedFile = await response.json();
      setFiles((prevFiles) =>
        prevFiles.map((f) => (f._id === editingFile._id ? updatedFile.file : f))
      );

      setEditingFile(null);
      setEditForm({ title: '', tags: '', category: '' });
      alert('File updated successfully!');
    } catch (error) {
      console.error('Edit error:', error);
      alert(`Failed to update: ${error.message}`);
    }
  };

  const handleDeleteClick = (fileId) => {
    setDeleting(fileId);
  };

  const handleConfirmDelete = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete file');
      }

      setFiles((prevFiles) => prevFiles.filter((f) => f._id !== fileId));
      setDeleting(null);
      alert('File deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Failed to delete: ${error.message}`);
      setDeleting(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleting(null);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="myfiles-container">
        <div className="loading">Loading your files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="myfiles-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="myfiles-container">
        <div className="myfiles-header">
          <h1>My Files</h1>
          <p>Upload files to see them here</p>
        </div>
        <div className="empty-state">
          <p>You haven't uploaded any files yet. Start by uploading your first file!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="myfiles-container">
      <div className="myfiles-header">
        <h1>My Files</h1>
        <p>Manage your uploaded files</p>
      </div>

      <div className="files-grid">
        {files.map((file) => (
          <div key={file._id} className="file-card">
            {/* Thumbnail */}
            <div 
              className="file-thumbnail"
              onClick={() => navigate(`/preview/${file._id}`)}
              style={{ cursor: 'pointer' }}
              title="Click to preview"
            >
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

              {/* Upload Date */}
              <div className="upload-info">
                <p className="uploaded-date">Uploaded on {formatDate(file.createdAt)}</p>
              </div>

              {/* Download Count */}
              <div className="download-stats">
                <span className="download-count">{file.downloadCount} downloads</span>
              </div>

              {/* Action Buttons */}
              <div className="file-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(file)}
                  title="Edit this file"
                >
                  Edit
                </button>

                {deleting === file._id ? (
                  <div className="delete-confirmation">
                    <p>Delete this file?</p>
                    <div className="confirmation-buttons">
                      <button
                        className="confirm-delete-btn"
                        onClick={() => handleConfirmDelete(file._id)}
                      >
                        Yes
                      </button>
                      <button
                        className="cancel-delete-btn"
                        onClick={handleCancelDelete}
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(file._id)}
                    title="Delete this file"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingFile && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit File</h2>
            <form>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  placeholder="Enter file title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags (comma-separated)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={editForm.tags}
                  onChange={handleEditChange}
                  placeholder="e.g., python, web development, tutorial"
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="save-btn"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFiles;