import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Flag, Trash2, ChevronRight } from "lucide-react";
import API_BASE_URL from "../../config/api";
import "./AdminUserFiles.css";

const AdminUserFiles = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [files, setFiles] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showReportsModal, setShowReportsModal] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  useEffect(() => {
    fetchUserFiles();
  }, [userId]);

  const fetchUserFiles = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${API_BASE_URL}/api/admin/users/${userId}/files`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      
      // Fetch user info to get username
      const userResponse = await fetch(
        `${API_BASE_URL}/api/admin/users`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      
      if (userResponse.ok) {
        const users = await userResponse.json();
        const user = users.find(u => u._id === userId);
        if (user) setUsername(user.username);
      }
      
      setFiles(data);
    } catch (err) {
      console.error("Fetch user files error:", err);
      setError("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (fileId) => {
    setReportsLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${API_BASE_URL}/api/admin/files/${fileId}/reports`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch reports");
      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error("Fetch reports error:", err);
      alert("Failed to load reports");
    } finally {
      setReportsLoading(false);
    }
  };

  const handleViewReports = (fileId) => {
    setShowReportsModal(fileId);
    fetchReports(fileId);
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${API_BASE_URL}/api/admin/files/${fileId}`,
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

  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${API_BASE_URL}/api/admin/reports/${reportId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Failed to update report");
      
      // Re-fetch reports
      if (showReportsModal) {
        fetchReports(showReportsModal);
      }
    } catch (err) {
      console.error("Update report error:", err);
      alert("Failed to update report");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getFormatBadgeColor = (format) => {
    switch (format?.toLowerCase()) {
      case "pdf":
        return "badge-pdf";
      case "docx":
      case "doc":
        return "badge-docx";
      case "pptx":
      case "ppt":
        return "badge-pptx";
      default:
        return "badge-other";
    }
  };

  if (loading) {
    return (
      <div className="admin-user-files">
        <div className="loading">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="admin-user-files">
      <div className="files-container">
        <div className="breadcrumb">
          <button onClick={() => navigate("/admin/users")}>Users</button>
          <ChevronRight size={14} color="#5a4f8a" />
          <span>{username}</span>
          <ChevronRight size={14} color="#5a4f8a" />
          <span>Files</span>
        </div>

        <h1>Files — {username}</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="files-table-wrapper">
          <table className="files-table">
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Title</th>
                <th>Category</th>
                <th>Format</th>
                <th>Downloads</th>
                <th>Reports</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file._id}>
                  <td className="thumbnail-cell">
                    {file.thumbnail ? (
                      <img src={file.thumbnail} alt={file.title} />
                    ) : (
                      <div className="no-thumbnail">No Image</div>
                    )}
                  </td>
                  <td className="file-title">{file.title}</td>
                  <td>{file.category}</td>
                  <td>
                    <span className={`format-badge ${getFormatBadgeColor(file.format)}`}>
                      {file.format.toUpperCase()}
                    </span>
                  </td>
                  <td className="download-count">{file.downloadCount}</td>
                  <td>
                    {file.reportCount > 0 && (
                      <span className="report-badge">{file.reportCount}</span>
                    )}
                  </td>
                  <td>{formatDate(file.createdAt)}</td>
                  <td className="action-buttons">
                    {file.reportCount > 0 && (
                      <button
                        className="btn-small btn-reports"
                        onClick={() => handleViewReports(file._id)}
                        title="View reports"
                      >
                        <Flag size={13} strokeWidth={2} />
                      </button>
                    )}

                    <button
                      className="btn-small btn-delete"
                      onClick={() => setConfirmDelete(file._id)}
                      title="Delete file"
                    >
                      <Trash2 size={13} strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {files.length === 0 && (
          <div className="empty-state">No files uploaded by this user</div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete File?</h3>
            <p>Delete this file permanently?</p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={() => handleDeleteFile(confirmDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports Modal */}
      {showReportsModal && (
        <div className="modal-overlay">
          <div className="modal modal-reports">
            <div className="modal-header">
              <h3>File Reports</h3>
              <button
                className="close-btn"
                onClick={() => setShowReportsModal(null)}
              >
                ✕
              </button>
            </div>

            {reportsLoading ? (
              <div className="loading-reports">Loading reports...</div>
            ) : reports.length === 0 ? (
              <p className="no-reports">No reports found</p>
            ) : (
              <div className="reports-list">
                {reports.map((report) => (
                  <div key={report._id} className="report-card">
                    <div className="report-header">
                      <div>
                        <p className="report-by">
                          Reported by: <strong>{report.reportedBy?.username}</strong>
                          <br />
                          <small>{report.reportedBy?.email}</small>
                        </p>
                        <p className="report-reason">
                          Reason: <strong>{report.reason}</strong>
                        </p>
                      </div>
                      <span
                        className={`report-status-badge ${report.status}`}
                      >
                        {report.status}
                      </span>
                    </div>

                    {report.description && (
                      <p className="report-description">
                        {report.description}
                      </p>
                    )}

                    <div className="report-footer">
                      <small>{formatDate(report.createdAt)}</small>
                      <select
                        className="status-select"
                        value={report.status}
                        onChange={(e) =>
                          handleUpdateReportStatus(report._id, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserFiles;
