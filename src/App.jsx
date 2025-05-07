import {UserProvider} from "../context/user";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import SignupPage from "./pages/auth/signup";
import LoginPage from "./pages/auth/login";
import Dashboard from "./pages/dashboard";
import QuizPage from "./pages/quiz";
import VerifyAccount from "./pages/auth/verify-account";

function App() {
  const isAuth = localStorage.getItem("token") ? true : false;

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={isAuth ? <Navigate to="/dashboard"/> : <SignupPage/>}/>
        <Route path="/login" element={isAuth ?  <Navigate to="/dashboard"/> : <LoginPage/>}/>
        <Route path="/verify-account/:token" element={isAuth ? <Navigate to="/dashboard"/> : <VerifyAccount/>}/>
        <Route path="/dashboard" element={isAuth ? <Dashboard/> : <Navigate to="/login"/>}/>
        {/* exam mode */}
        <Route path="/quiz/e/:id" element={isAuth ? <QuizPage isExam={true}/> : <Navigate to="/login"/>}/> 
        {/* study mode */}
        <Route path="/quiz/s/:id" element={isAuth ? <QuizPage isExam={false}/> : <Navigate to="login"/>}/> 
        <Route path="/" element={isAuth ? <Dashboard/> : <Navigate to="/login"/>}/>
        <Route path="*" element={isAuth ? <Dashboard/> : <Navigate to="/login"/>}/>
      </Routes>
    </Router>
  )
}

export default App
