import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CanAccess = ({ roles, children }) => {
    const { hasRole } = useAuth();
    return hasRole(...roles)
        ? children
        : <Navigate to="/forbidden" state={{ type: 403 }} replace />;
};

export default CanAccess;
