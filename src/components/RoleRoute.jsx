import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../routes/routePaths.js";
import { SkeletonList } from "./ui/index.jsx";

// Allows the page only for the ACTIVE role (listener / artist / admin mode)
export const RoleRoute = ({ allowedRoles, children }) => {
  const { user, activeRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-6">
        <SkeletonList />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(activeRole)) return <Navigate to={getDashboardPath(activeRole)} replace />;
  return children;
};
