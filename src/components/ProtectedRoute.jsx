import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Auth check complete hone ka wait
  if (loading) {
    return <div>Checking authentication...</div>;
  }

  // User authenticated nahi hai
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User authenticated hai
  return children;
};
