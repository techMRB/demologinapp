import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RouteGuard = ({ children, roles }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if(isLoading) return null;
  if(!isAuthenticated) return <Navigate to="/login" replace />;
  if(roles && !hasRole(...roles)) return <Navigate to="/unauthorized" replace />;

    return children;
}

export default RouteGuard;