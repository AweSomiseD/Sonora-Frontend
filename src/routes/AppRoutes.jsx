import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { PublicOnlyRoute } from "../components/PublicOnlyRoute";
import { RoleRoute } from "../components/RoleRoute";
import StatusScreen from "../components/StatusScreen.jsx";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "./routePaths.js";
import { Landing } from "../pages/Landing";
// Landing page ke liye just imports ko disabled kara taaky login aur register page par koi jaa na sake. Agar aapko login aur register page chahiye to aapko imports ko uncomment karna hoga.
// import { Login } from "../pages/Login";
// import { Register } from "../pages/Register";
import { NotFoundPage } from "../pages/NotFoundPage";

// Pages are loaded on demand to keep the first load small
const page = (loader, name) =>
  lazy(() => loader().then((m) => ({ default: m[name] || m.default })));

const About = page(() => import("../pages/About"), "About");
const VerifyEmail = page(() => import("../pages/VerifyEmail"), "VerifyEmail");
const ResetPassword = page(
  () => import("../pages/ResetPassword"),
  "ResetPassword",
);
const ForgotPassword = page(
  () => import("../pages/ForgotPassword"),
  "ForgotPassword",
);
//
// const ChooseRole = page(() => import("../pages/ChooseRole"), "default");
const Dashboard = page(() => import("../pages/Dashboard"), "Dashboard");
const Discover = page(() => import("../pages/Discover"), "Discover");
const Album = page(() => import("../pages/Album"), "Album");
const AlbumDetails = page(
  () => import("../pages/AlbumDetails"),
  "AlbumDetails",
);
const MyMusic = page(() => import("../pages/MyMusic"), "MyMusic");
const MyAlbums = page(() => import("../pages/MyAlbums"), "MyAlbums");
const CreateMusic = page(() => import("../pages/CreateMusic"), "CreateMusic");
const CreateAlbum = page(() => import("../pages/CreateAlbum"), "CreateAlbum");
const Profile = page(() => import("../pages/Profile"), "Profile");
const Settings = page(() => import("../pages/Settings"), "Settings");
const Liked = page(() => import("../pages/Liked"), "Liked");
const RecentlyPlayed = page(
  () => import("../pages/RecentlyPlayed"),
  "RecentlyPlayed",
);
const Following = page(() => import("../pages/Following"), "Following");
const Artists = page(() => import("../pages/Artists"), "Artists");
const ArtistDetails = page(
  () => import("../pages/ArtistDetails"),
  "ArtistDetails",
);
const Messages = page(() => import("../pages/Messages"), "Messages");
const PaymentSuccess = page(
  () => import("../pages/PaymentSuccess"),
  "PaymentSuccess",
);
const PaymentCancel = page(
  () => import("../pages/PaymentCancel"),
  "PaymentCancel",
);
const Pricing = page(() => import("../pages/Pricing"), "Pricing");
const AdminUsers = page(() => import("../pages/AdminUsers"), "AdminUsers");
const AdminContent = page(
  () => import("../pages/AdminContent"),
  "AdminContent",
);
const AdminStats = page(() => import("../pages/AdminStats"), "AdminStats");
const AdminAuditLog = page(
  () => import("../pages/AdminAuditLog"),
  "AdminAuditLog",
);
const AdminArtistRequests = page(
  () => import("../pages/AdminArtistRequests"),
  "default",
);
const AdminReports = page(() => import("../pages/AdminReports"), "default");
const BecomeArtist = page(() => import("../pages/BecomeArtist"), "default");
const Playlists = page(() => import("../pages/Playlists"), "default");
const PlaylistDetails = page(
  () => import("../pages/PlaylistDetails"),
  "default",
);
const PublicPlaylist = page(() => import("../pages/PublicPlaylist"), "default");
const ArtistAnalytics = page(
  () => import("../pages/ArtistAnalytics"),
  "default",
);
const ListenerStats = page(() => import("../pages/ListenerStats"), "default");
const Notifications = page(() => import("../pages/Notifications"), "default");

const only = (roles, element) => (
  <RoleRoute allowedRoles={roles}>{element}</RoleRoute>
);
const LISTENER = ["listener"];
const ARTIST = ["artist"];
const ADMIN = ["admin"];

export const AppRoutes = () => {
  const publicRoute = (element) => <PublicOnlyRoute>{element}</PublicOnlyRoute>;

  return (
    <Suspense fallback={<StatusScreen variant="loading" />}>
      <Routes>
        {/* ===== Public ===== */}
        {/* AuthContext ka background /auth/me request phir bhi chalega, lekin landing page uska wait nahi karega. */}
        {/* <Route path="/" element={publicRoute(<Landing />)} /> */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        {/* Routes for login and register are commented out to prevent access to these pages directly */}
        {/* <Route path="/login" element={publicRoute(<Login />)} />
        <Route path="/register" element={publicRoute(<Register />)} /> */}
        {/* Routes added to prevent direct access */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/forgot-password"
          element={publicRoute(<ForgotPassword />)}
        />
        {/* Kept for old links: now "finish Google sign-up" (everyone starts as a listener) */}
        {/* <Route path="/choose-role" element={publicRoute(<ChooseRole />)} /> */}
        {/* Route Changed For Direct Access */}
        <Route path="/choose-role" element={<Navigate to="/" replace />} />

        <Route
          path="/artists"
          element={<Navigate to="/listener/artists" replace />}
        />
        <Route path="/artists/:artistId" element={<ArtistDetailsRedirect />} />

        <Route
          path="/playlists/:id"
          element={
            <ProtectedRoute>
              <PublicPlaylist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/success"
          element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/cancel"
          element={
            <ProtectedRoute>
              <PaymentCancel />
            </ProtectedRoute>
          }
        />

        {/* ===== Dashboards (one per active role) ===== */}
        <Route
          path="/:role"
          element={
            <ProtectedRoute>
              <RoleDashboardRoute>
                <DashboardLayout />
              </RoleDashboardRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
          <Route
            path="messages"
            element={only(["listener", "artist"], <Messages />)}
          />
          <Route
            path="pricing"
            element={only(["listener", "artist"], <Pricing />)}
          />
          <Route path="stats" element={<StatsRoute />} />

          {/* Listener */}
          <Route path="discover" element={only(LISTENER, <Discover />)} />
          <Route path="album" element={only(LISTENER, <Album />)} />
          <Route
            path="album/:id"
            element={only(["listener", "artist"], <AlbumDetails />)}
          />
          <Route path="liked-songs" element={only(LISTENER, <Liked />)} />
          <Route
            path="recently-played"
            element={only(LISTENER, <RecentlyPlayed />)}
          />
          <Route path="following" element={only(LISTENER, <Following />)} />
          <Route path="artists" element={only(LISTENER, <Artists />)} />
          <Route
            path="artists/:artistId"
            element={only(LISTENER, <ArtistDetails />)}
          />
          <Route path="playlists" element={only(LISTENER, <Playlists />)} />
          <Route
            path="playlists/:id"
            element={only(LISTENER, <PlaylistDetails />)}
          />
          <Route
            path="become-artist"
            element={only(LISTENER, <BecomeArtist />)}
          />

          {/* Artist */}
          <Route path="my-music" element={only(ARTIST, <MyMusic />)} />
          <Route path="my-albums" element={only(ARTIST, <MyAlbums />)} />
          <Route path="upload-music" element={only(ARTIST, <CreateMusic />)} />
          <Route path="create-album" element={only(ARTIST, <CreateAlbum />)} />
          <Route path="analytics" element={only(ARTIST, <ArtistAnalytics />)} />

          {/* Admin */}
          <Route path="users" element={only(ADMIN, <AdminUsers />)} />
          <Route
            path="artist-requests"
            element={only(ADMIN, <AdminArtistRequests />)}
          />
          <Route path="reports" element={only(ADMIN, <AdminReports />)} />
          <Route path="content" element={only(ADMIN, <AdminContent />)} />
          <Route path="audit-log" element={only(ADMIN, <AdminAuditLog />)} />
        </Route>

        <Route path="/dashboard/*" element={<LegacyDashboardRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

// "stats" means "Your Stats" for listeners and platform stats for admins
const StatsRoute = () => {
  const { activeRole } = useAuth();
  if (activeRole === "admin") return <AdminStats />;
  if (activeRole === "listener") return <ListenerStats />;
  return <Navigate to={getDashboardPath(activeRole)} replace />;
};

// The URL role must match the active role. If the user owns the role in the
// URL (e.g. a notification link to /artist/... while in listener mode), we
// switch modes automatically instead of bouncing them away.
const RoleDashboardRoute = ({ children }) => {
  const { role } = useParams();
  const { user, activeRole } = useAuth();

  const known = ["artist", "listener", "admin"].includes(role);

  if (!known) return <NotFoundPage />;
  if (role !== activeRole) {
    return <Navigate to={getDashboardPath(activeRole || user?.role)} replace />;
  }

  return children;
};

const LegacyDashboardRedirect = () => {
  const { activeRole } = useAuth();
  return <Navigate to={getDashboardPath(activeRole)} replace />;
};

const ArtistDetailsRedirect = () => {
  const { artistId } = useParams();
  return <Navigate to={`/listener/artists/${artistId}`} replace />;
};
