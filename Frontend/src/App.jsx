import React from "react";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./Pages/About/About";
import Home from "./Pages/Home/Home";
import Upload from "./Pages/Upload/Upload";
import SavedFiles from "./Pages/SavedFiles/SavedFiles";
import "./App.css";
import LoginSignup from "./Pages/LoginSignup/LoginSignup";
import AuthCallback from "./Pages/AuthCallback";
import MyFiles from "./Pages/MyFiles/MyFiles";
import Downloads from "./Pages/Downloads/Downloads";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path='/auth/callback' element={<AuthCallback />} />
              <Route path='/about' element={<About/>}/>
              <Route path='/my-files' element={<MyFiles/>}/>
              <Route path='/upload' element={<Upload/>}/>
              <Route path='/downloads' element={<Downloads/>}/>
              <Route path='/login' element={<LoginSignup/>}/>
              <Route path='/saved-files' element={<SavedFiles/>}/>
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
