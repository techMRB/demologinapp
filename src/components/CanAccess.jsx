import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CanAccess = ({ roles, children, variant = 0 }) => {
    const { hasRole } = useAuth();
    return hasRole(...roles)
        ? children
        : <Navigate to="/forbidden" state={{ variant }} replace />;
};

export default CanAccess;