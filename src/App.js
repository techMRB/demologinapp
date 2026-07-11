import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./authContext/AuthContext";

import Login from "./components/loginForm/login";
import Register from "./components/registerForm/register";
import EmailVerification from "./components/emailVerification/EmailVerification";
import Dashboard from "./components/dashboard/Dashboard";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<EmailVerification />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};
export default App;
