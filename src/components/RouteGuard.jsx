import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const RouteGuard = ({ permissions, children }) => {
  const { hasPermission } = useAuth();
  if (permissions && !hasPermission(...permissions)) {
    return <Navigate to="/unauthorized" state={{ type: 403 }} replace />;
  }
  return children;
};

export default RouteGuard;
