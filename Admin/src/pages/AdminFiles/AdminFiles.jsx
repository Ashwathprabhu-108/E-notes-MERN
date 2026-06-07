import React, { useState, useEffect } from "react";
import "./AdminFiles.css";

const AdminFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://localhost:5000/api/admin/files", {
        headers: {
          Authorization: `Bearer ${token}`,
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
            Authorization: `Bearer ${token}`,
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
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getFormatBadgeClass = (format) => {
    switch (format?.toLowerCase()) {
      case "pdf": return "badge-pdf";
      case "docx":
      case "doc": return "badge-docx";
      case "pptx":
      case "ppt": return "badge-pptx";
      default: return "badge-other";
    }
  };

  const filteredFiles = files.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.title?.toLowerCase().includes(q) ||
      f.uploadedBy?.toLowerCase().includes(q) ||
      f.category?.toLowerCase().includes(q) ||
      f.format?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="admin-files">
        <div className="loading">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="admin-files">
      <div className="files-header">
        <div>
          <h1>📄 File Management</h1>
          <p className="subtitle">
            {files.length} file{files.length !== 1 ? "s" : ""} on the platform
          </p>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Search by title, uploader, category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredFiles.length === 0 ? (
        <div className="empty-state">
          <p>{searchQuery ? "No files match your search." : "No files found."}</p>
        </div>
      ) : (
        <div className="files-table-wrapper">
          <table className="files-table">
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Title</th>
                <th>Category</th>
                <th>Format</th>
                <th>Uploaded By</th>
                <th>Downloads</th>
                <th>Reports</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file._id}>
                  {/* Thumbnail */}
                  <td className="thumbnail-cell">
                    {file.thumbnail ? (
                      <img src={file.thumbnail} alt={file.title} className="file-thumbnail" />
                    ) : (
                      <div className="no-thumbnail">No Image</div>
                    )}
                  </td>

                  {/* Title */}
                  <td className="file-title-cell">
                    <span className="file-title">{file.title}</span>
                  </td>

                  {/* Category */}
                  <td>
                    <span className="category-badge">{file.category}</span>
                  </td>

                  {/* Format */}
                  <td>
                    <span className={`format-badge ${getFormatBadgeClass(file.format)}`}>
                      {file.format?.toUpperCase() || "—"}
                    </span>
                  </td>

                  {/* Uploader */}
                  <td className="uploader-cell">
                    <div className="uploader-name">{file.uploadedBy}</div>
                    {file.uploaderEmail && (
                      <div className="uploader-email">{file.uploaderEmail}</div>
                    )}
                  </td>

                  {/* Downloads */}
                  <td className="download-count">
                    ⬇️ {file.downloadCount}
                  </td>

                  {/* Reports */}
                  <td>
                    {file.reportCount > 0 ? (
                      <span className="report-badge">🚩 {file.reportCount}</span>
                    ) : (
                      <span className="no-reports">—</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="date-cell">{formatDate(file.createdAt)}</td>

                  {/* Actions */}
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

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🗑️ Delete File?</h2>
            <p>
              This will permanently delete the file and all its associated
              reports from Cloudinary and the database. This action cannot be
              undone.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button className="btn-delete" onClick={() => handleDeleteFile(confirmDelete)}>
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFiles;
