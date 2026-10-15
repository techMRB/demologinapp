import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RouteGuard = ({ permissions, children }) => {
  const { hasPermission } = useAuth();

  if (permissions && !hasPermission(...permissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RouteGuard;
