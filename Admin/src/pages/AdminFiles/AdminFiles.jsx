import React, { useState, useEffect } from "react";
import "./AdminFiles.css";

const AdminFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://localhost:5000/api/admin/files", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      console.error("Fetch files error:", err);
      setError("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `http://localhost:5000/api/admin/files/${fileId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete file");
      
      setFiles(files.filter((f) => f._id !== fileId));
      setConfirmDelete(null);
    } catch (err) {
      console.error("Delete file error:", err);
      alert("Failed to delete file");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="admin-files">
        <div className="loading">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="admin-files">
      <div className="files-container">
        <h1>📄 File Management</h1>
        <p className="subtitle">Manage all uploaded files on the platform</p>

        {error && <div className="error-message">{error}</div>}

        {files.length === 0 ? (
          <div className="empty-state">
            <p>No files found</p>
          </div>
        ) : (
          <div className="files-table-wrapper">
            <table className="files-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Category</th>
                  <th>Owner</th>
                  <th>Size</th>
                  <th>Downloads</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file._id}>
                    <td className="file-name">
                      <span className="file-icon">📎</span>
                      {file.filename || "Unknown"}
                    </td>
                    <td>{file.category || "N/A"}</td>
                    <td>{file.uploader?.username || "Unknown"}</td>
                    <td>{formatFileSize(file.size)}</td>
                    <td className="download-count">{file.downloads || 0}</td>
                    <td>{formatDate(file.createdAt)}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => setConfirmDelete(file._id)}
                        title="Delete file"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {confirmDelete && (
          <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Confirm Delete</h2>
              <p>Are you sure you want to delete this file? This action cannot be undone.</p>
              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteFile(confirmDelete)}
                >
                  Delete File
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFiles;
