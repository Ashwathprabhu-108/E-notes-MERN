import React from "react";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import About from "./Pages/About/About";
import Home from "./Pages/Home/Home";
import Upload from "./Pages/Upload/Upload";
import SavedFiles from "./Pages/SavedFiles/SavedFiles";
import "./App.css";
import LoginSignup from "./Pages/LoginSignup/LoginSignup";
import AuthCallback from "./Pages/AuthCallback";
import MyFiles from "./Pages/MyFiles/MyFiles";
import Downloads from "./Pages/Downloads/Downloads";
import PreviewFile from "./components/PreviewFile/PreviewFile";
import { SearchFilterProvider } from "./context/SearchFilterContext";
import AdSidebar from "./components/ad-sidebar/AdSidebar";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <SearchFilterProvider>
        <div className="app">
          <Navbar />
          <div style={{ display: "flex" }}>
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/auth/callback' element={<AuthCallback />} />
                <Route path='/about' element={<About/>}/>
                <Route path='/my-files' element={<ProtectedRoute><MyFiles/></ProtectedRoute>}/>
                <Route path='/upload' element={<ProtectedRoute><Upload/></ProtectedRoute>}/>
                <Route path='/downloads' element={<ProtectedRoute><Downloads/></ProtectedRoute>}/>
                <Route path='/login' element={<LoginSignup/>}/>
                <Route path='/saved-files' element={<ProtectedRoute><SavedFiles/></ProtectedRoute>}/>
                <Route path='/preview/:fileId' element={<ProtectedRoute><PreviewFile/></ProtectedRoute>}/>
              </Routes>
            </main>
            <AdSidebar />
          </div>
        </div>
      </SearchFilterProvider>
    </BrowserRouter>
  );
}

export default App;
