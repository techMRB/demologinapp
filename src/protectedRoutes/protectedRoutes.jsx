import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <p style={{ padding: 24, fontFamily: "sans-serif" }}>
        Checking your session...
      </p>
    );
  }

  if (!isAuthenticated) {
    console.log("User is not authenticated. Redirecting to /unauthorized.", isAuthenticated);
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
