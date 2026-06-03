import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminUsers from "./pages/AdminUsers/AdminUsers";
import AdminUserFiles from "./pages/AdminUserFiles/AdminUserFiles";
import AdminFiles from "./pages/AdminFiles/AdminFiles";
import AdminReports from "./pages/AdminReports/AdminReports";
import AdminNavbar from "./components/AdminNavbar/AdminNavbar";
import "./App.css";
import AdminSidebar from "./components/AdminSidebar/AdminSidebar";

// Protected Route Component for Admin
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  const token = localStorage.getItem("adminToken");

  return (
    <BrowserRouter>
      {token && <AdminNavbar />}
      <div className="app">
        <AdminSidebar />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <AdminUsers />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:userId/files"
            element={
              <AdminProtectedRoute>
                <AdminUserFiles />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/files"
            element={
              <AdminProtectedRoute>
                <AdminFiles />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminProtectedRoute>
                <AdminReports />
              </AdminProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
