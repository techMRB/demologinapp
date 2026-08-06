import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

import Login from './components/loginForm/login';
import Register from './components/registerForm/register';
import EmailVerification from './components/emailVerification/EmailVerification';
import Dashboard from './components/dashboard/Dashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoutes from './protectedRoutes/protectedRoutes';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<EmailVerification />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}
export default App;
