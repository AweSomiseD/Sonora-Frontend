import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getDashboardPath } from "../routes/routePaths.js";

export const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  console.log("PublicOnlyRoute:", { user, loading });

  if (loading) {
    return <div>Checking authentication...</div>;
  }

  if (user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  console.log("PublicOnlyRoute allowing public page");
  return children;
};
