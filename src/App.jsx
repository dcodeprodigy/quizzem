import {UserProvider} from "../context/user";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignupPage from "./pages/auth/signup";
import LoginPage from "./pages/auth/login";
import Dashboard from "./pages/dashboard";
import QuizPage from "./pages/quiz";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/quiz/e/:id" element={<QuizPage isExam={true}/>}/>
        <Route path="/quiz/s/:id" element={<QuizPage isExam={false}/>}/>
        <Route path="/" element={<Dashboard />}/>
      </Routes>
    </Router>
  )
}

export default App
