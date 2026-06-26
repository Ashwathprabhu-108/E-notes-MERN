import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Trash2, CheckCircle, Ban, AlertTriangle, X } from "lucide-react";
import "./AdminUsers.css";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      setUsers(await res.json());
    } catch (err) {
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDisable = async (userId, currentStatus) => {
    setTogglingId(userId);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/disable`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setUsers(users.map((u) => (u._id === userId ? updated.user : u)));
    } catch {
      alert("Failed to update user status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    setDeletingId(userId);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setUsers(users.filter((u) => u._id !== userId));
      setConfirmDelete(null);
    } catch {
      alert("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  const getInitials = (name = "") =>
    name.slice(0, 2).toUpperCase();

  // Avatar colour from username hash
  const avatarColor = (name = "") => {
    const colors = ["#7c3aed", "#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];
    let hash = 0;
    for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="search-highlight">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const activeCount   = users.filter((u) => !u.isDisabled).length;
  const disabledCount = users.filter((u) =>  u.isDisabled).length;

  if (loading) return (
    <div className="au-root">
      <div className="au-loader">
        <div className="au-spinner" />
        <p>Loading users…</p>
      </div>
    </div>
  );

  return (
    <div className="au-root">
      <div className="au-container">

        {/* ── Page Header ───────────────────────────────────── */}
        <div className="au-page-header">
          <div className="au-page-title">
            <div className="au-title-icon">
              <Users size={22} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <h1>Users</h1>
            </div>
          </div>

          {/* Quick Stats Pills */}
          <div className="au-stat-pills">
            <div className="au-pill au-pill-total">
              <span className="au-pill-num">{users.length}</span>
              <span className="au-pill-label">Total</span>
            </div>
            <div className="au-pill au-pill-active">
              <span className="au-pill-num">{activeCount}</span>
              <span className="au-pill-label">Active</span>
            </div>
            <div className="au-pill au-pill-disabled">
              <span className="au-pill-num">{disabledCount}</span>
              <span className="au-pill-label">Disabled</span>
            </div>
          </div>
        </div>

        {/* ── Toolbar ───────────────────────────────────────── */}
        <div className="au-toolbar">
          <div className="au-search-wrap">
            <Search size={15} className="au-search-icon" color="#7c3aed" strokeWidth={2} />
            <input
              className="au-search-input"
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="au-search-clear" onClick={() => setSearch("")}>
                <X size={13} strokeWidth={2.5} />
              </button>
            )}
          </div>

        </div>

        {error && <div className="au-error">{error}</div>}

        {/* ── Table ─────────────────────────────────────────── */}
        <div className="au-table-card">
          <table className="au-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Files</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="au-empty">
                    <div className="au-empty-inner">
                      <Search size={28} color="#4a4080" strokeWidth={1.5} />
                      <p>{search ? `No users found for "${search}"` : "No users yet"}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className={user.isDisabled ? "au-row-disabled" : ""}>
                    {/* Avatar + Username */}
                    <td>
                      <div className="au-user-cell">
                        <div className="au-avatar" style={{ background: avatarColor(user.username) }}>
                          {getInitials(user.username)}
                        </div>
                        <span className="au-username">{highlightMatch(user.username, search)}</span>
                      </div>
                    </td>

                    <td className="au-email">{highlightMatch(user.email, search)}</td>
                    <td className="au-files-count">{user.filesCount ?? 0}</td>
                    <td className="au-date">{formatDate(user.createdAt)}</td>

                    <td>
                      <span className={`au-badge ${user.isDisabled ? "au-badge-disabled" : "au-badge-active"}`}>
                        <span className="au-badge-dot" />
                        {user.isDisabled ? "Disabled" : "Active"}
                      </span>
                    </td>

                    <td>
                      <div className="au-actions">
                        <button
                          className={`au-btn ${user.isDisabled ? "au-btn-enable" : "au-btn-disable"}`}
                          onClick={() => handleToggleDisable(user._id, user.isDisabled)}
                          disabled={togglingId === user._id}
                          title={user.isDisabled ? "Enable user" : "Disable user"}
                        >
                          {togglingId === user._id
                            ? "…"
                            : user.isDisabled
                            ? <><CheckCircle size={13} strokeWidth={2}/> Enable</>
                            : <><Ban size={13} strokeWidth={2}/> Disable</>}
                        </button>
                        <button
                          className="au-btn au-btn-delete"
                          onClick={() => setConfirmDelete(user._id)}
                          title="Delete user"
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ──────────────────────── */}
      {confirmDelete && (
        <div className="au-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="au-modal" onClick={(e) => e.stopPropagation()}>
            <div className="au-modal-icon">
              <AlertTriangle size={28} color="#f59e0b" strokeWidth={1.8} />
            </div>
            <h3>Delete User?</h3>
            <p>This will permanently delete the user and <strong>all their files</strong>. This action cannot be undone.</p>
            <div className="au-modal-actions">
              <button className="au-modal-cancel" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button
                className="au-modal-confirm"
                onClick={() => handleDeleteUser(confirmDelete)}
                disabled={!!deletingId}
              >
                {deletingId ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
