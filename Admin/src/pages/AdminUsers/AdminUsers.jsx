import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminUsers.css";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDisable = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}/disable`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to update user");
      const updatedUser = await response.json();
      
      setUsers(
        users.map((u) =>
          u._id === userId ? updatedUser.user : u
        )
      );
    } catch (err) {
      console.error("Toggle disable error:", err);
      alert("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete user");
      
      setUsers(users.filter((u) => u._id !== userId));
      setConfirmDelete(null);
    } catch (err) {
      console.error("Delete user error:", err);
      alert("Failed to delete user");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="admin-users">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="users-container">
        <h1>Manage Users</h1>
        <p className="subtitle">Total Users: {users.length}</p>

        {error && <div className="error-message">{error}</div>}

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="user-name">{user.username}</td>
                  <td>{user.email}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        user.isDisabled ? "disabled" : "active"
                      }`}
                    >
                      {user.isDisabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button
                      className={`btn-small ${
                        user.isDisabled ? "btn-enable" : "btn-disable"
                      }`}
                      title={user.isDisabled ? "Enable" : "Disable"}
                      onClick={() =>
                        handleToggleDisable(user._id, user.isDisabled)
                      }
                    >
                      {user.isDisabled ? "Enable" : "Disable"}
                    </button>

                    <button
                      className="btn-small btn-delete"
                      title="Delete user"
                      onClick={() => setConfirmDelete(user._id)}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="empty-state">No users found</div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete User?</h3>
            <p>
              Are you sure? This will delete the user and all their files
              permanently.
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={() => handleDeleteUser(confirmDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
