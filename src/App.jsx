import { useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import StatusScreen from "./components/StatusScreen.jsx";
import UpgradeModal from "./components/UpgradeModal.jsx";
import { useAuth } from "./context/AuthContext";
import { AppRoutes } from "./routes/AppRoutes";

const DASHBOARD_PREFIXES = [
  "/artist",
  "/listener",
  "/admin",
  "/payment",
  "/playlists",
];

function App() {
  const { loading, banned, logout } = useAuth();
  const location = useLocation();

  const isDashboardRoute = DASHBOARD_PREFIXES.some(
    (prefix) =>
      location.pathname === prefix ||
      location.pathname.startsWith(`${prefix}/`),
  );

  // Public routes (like landing page) should not wait for auth context to load, so we only show the loading screen for dashboard routes.
  // if (loading) return <StatusScreen variant="loading" />;
  if (loading && isDashboardRoute) {
    return <StatusScreen variant="loading" />;
  }
  if (banned)
    return (
      <StatusScreen variant="banned" reason={banned.reason} onLogout={logout} />
    );

  return (
    <>
      {!isDashboardRoute && <Navbar />}
      <AppRoutes />
      <UpgradeModal />
    </>
  );
}

export default App;
