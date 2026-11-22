import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getDashboardPath } from "../routes/routePaths.js";
import StatusScreen from "./StatusScreen.jsx";

export const PublicOnlyRoute = ({ children }) => {
  const { user, activeRole, loading } = useAuth();

  if (loading) return <StatusScreen variant="loading" />;
  if (user) return <Navigate to={getDashboardPath(activeRole)} replace />;
  return children;
};
