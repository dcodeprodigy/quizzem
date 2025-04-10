import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignupPage from "./pages/auth/signup";
import LoginPage from "./pages/auth/login";
import Dashboard from "./pages/dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/" element=""/>
      </Routes>
    </Router>
  )
}

export default App
