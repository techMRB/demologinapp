import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  BrowserRouter,
} from "react-router-dom";
import "./App.css";
import RouteGuard from "./components/RouteGuard";
import { publicRoutes, protectedRoutes } from "./routes/routeConfig";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoutes from "./protectedRoutes/protectedRoutes";

function AppRoutes() {
  return (
    <Routes>
      {publicRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
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
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
