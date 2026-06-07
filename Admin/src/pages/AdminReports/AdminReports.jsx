import React, { useState, useEffect } from "react";
import "./AdminReports.css";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://localhost:5000/api/admin/reports", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch reports");
      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error("Fetch reports error:", err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async (reportId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `http://localhost:5000/api/admin/reports/${reportId}/status`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "reviewed" }),
        }
      );

      if (!response.ok) throw new Error("Failed to resolve report");
      
      setReports(
        reports.map((r) =>
          r._id === reportId ? { ...r, status: "reviewed" } : r
        )
      );
    } catch (err) {
      console.error("Resolve report error:", err);
      alert("Failed to resolve report");
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `http://localhost:5000/api/admin/reports/${reportId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete report");
      
      setReports(reports.filter((r) => r._id !== reportId));
      setConfirmDelete(null);
    } catch (err) {
      console.error("Delete report error:", err);
      alert("Failed to delete report");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (resolved) => {
    if (resolved) {
      return <span className="status-badge resolved">✓ Resolved</span>;
    }
    return <span className="status-badge pending">⏱️ Pending</span>;
  };

  if (loading) {
    return (
      <div className="admin-reports">
        <div className="loading">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="admin-reports">
      <div className="reports-container">
        <h1>🚩 Reports Management</h1>
        <p className="subtitle">Manage user reports and violations</p>

        {error && <div className="error-message">{error}</div>}

        {reports.length === 0 ? (
          <div className="empty-state">
            <p>No reports found</p>
          </div>
        ) : (
          <div className="reports-list">
            {reports.map((report) => (
              <div key={report._id} className={`report-card ${report.status === "reviewed" || report.status === "dismissed" ? "resolved" : "pending"}`}>
                <div className="report-header">
                  <div className="report-title">
                    <h3>{report.reportedFile?.title || "Unknown File"}</h3>
                    {getStatusBadge(report.status === "reviewed" || report.status === "dismissed")}
                  </div>
                  <span className="report-date">{formatDate(report.createdAt)}</span>
                </div>

                <div className="report-details">
                  <div className="detail-row">
                    <span className="label">Reported File:</span>
                    <span className="value">{report.reportedFile?.title || "Unknown"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">File Owner:</span>
                    <span className="value">{report.reportedFile?.uploadedBy?.username || "Unknown"} ({report.reportedFile?.uploadedBy?.email || "no email"})</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Reported By:</span>
                    <span className="value">{report.reportedBy?.username || "Anonymous"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Reason:</span>
                    <span className="value">{report.reason || "N/A"}</span>
                  </div>
                </div>

                <div className="report-description">
                  <p>{report.description || "No description provided"}</p>
                </div>

                <div className="report-actions">
                  {report.status === "pending" && (
                    <button
                      className="resolve-btn"
                      onClick={() => handleMarkResolved(report._id)}
                    >
                      ✓ Mark as Resolved
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => setConfirmDelete(report._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {confirmDelete && (
          <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Confirm Delete</h2>
              <p>Are you sure you want to delete this report? This action cannot be undone.</p>
              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteReport(confirmDelete)}
                >
                  Delete Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
