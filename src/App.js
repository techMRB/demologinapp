import React from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import "./App.css";

import DashboardLayout from "./components/dashboard/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoutes from "./protectedRoutes/protectedRoutes";
import RouteGuard from "./components/RouteGuard";

import { publicRoutes, protectedRoutes } from "./routes/routeConfig";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      {publicRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}

      {/* Authentication-protected routes */}
      <Route element={<ProtectedRoutes />}>
        <Route element={<DashboardLayout />}>
          {protectedRoutes.map(({ path, element, permissions }) => (
            <Route
              key={path}
              path={path}
              element={
                permissions ? (
                  <RouteGuard permissions={permissions}>{element}</RouteGuard>
                ) : (
                  element
                )
              }
            />
          ))}
        </Route>
      </Route>
    </Routes>
  );
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
