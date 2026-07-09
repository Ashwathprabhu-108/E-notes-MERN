import React, { useState } from "react";
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
// Layout wrapper shown only when logged in
const AdminLayout = ({ children, onLogin }) => {
  const token = localStorage.getItem("adminToken");
  if (!token) return children;
  return (
    <>
      <AdminNavbar onLogout={onLogin} />
      <div className="app">
        <AdminSidebar onLogout={onLogin} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  );
};

function App() {
  // Use state so logout/login triggers a re-render of the layout
  const [authKey, setAuthKey] = useState(0);
  const refreshLayout = () => setAuthKey(k => k + 1);

  return (
    <BrowserRouter key={authKey}>
      <Routes>
        {/* Login page — no navbar/sidebar */}
        <Route path="/admin/login" element={<AdminLogin onLogin={refreshLayout} />} />

        {/* All other admin pages — wrapped in AdminLayout */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminLayout onLogin={refreshLayout}>
              <AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminLayout onLogin={refreshLayout}>
              <AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users/:userId/files"
          element={
            <AdminLayout onLogin={refreshLayout}>
              <AdminProtectedRoute><AdminUserFiles /></AdminProtectedRoute>
            </AdminLayout>
          }
        />
        <Route
          path="/admin/files"
          element={
            <AdminLayout onLogin={refreshLayout}>
              <AdminProtectedRoute><AdminFiles /></AdminProtectedRoute>
            </AdminLayout>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminLayout onLogin={refreshLayout}>
              <AdminProtectedRoute><AdminReports /></AdminProtectedRoute>
            </AdminLayout>
          }
        />
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
