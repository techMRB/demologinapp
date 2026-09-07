import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

import Login from "./components/loginForm/login";
import Register from "./components/registerForm/register";
import EmailVerification from "./components/emailVerification/EmailVerification";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Dashboard from "./components/dashboard/Dashboard";
import UserList from "./components/users/UserList";
import Settings from "./components/settings/Settings";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoutes from "./protectedRoutes/protectedRoutes";
import CanAccess from "./components/CanAccess";
import AccessError from "./protectedRouteError/AccessError";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<EmailVerification />} />
          <Route element={<ProtectedRoutes />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/users"
                element={
                  <CanAccess roles={["admin"]}>
                    <UserList />
                  </CanAccess>
                }
              />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="/unauthorized" element={<AccessError />} />
          <Route path="*"             element={<AccessError type={404} />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
