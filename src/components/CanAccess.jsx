import { useAuth } from "../context/AuthContext";

const CanAccess = ({ permissions, children }) => {
  const { hasPermission } = useAuth();

  return hasPermission(...permissions) ? children : null;
};

export default CanAccess;
