import { useLocation } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import { Navbar } from "./components/Navbar";
import { useAuth } from "./context/AuthContext";

function App() {
  const { loading } = useAuth();
  const location = useLocation();

  const isDashboardRoute =
    location.pathname === "/artist" ||
    location.pathname.startsWith("/artist/") ||
    location.pathname === "/listener" ||
    location.pathname.startsWith("/listener/") ||
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/") ||
    location.pathname === "/payment/success" ||
    location.pathname === "/payment/cancel";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      {!isDashboardRoute && <Navbar />}
      <AppRoutes />
    </>
  );
}

export default App;
