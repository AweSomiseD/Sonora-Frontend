import { Routes, Route } from "react-router-dom";
import { Navigate, useParams } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { RoleRoute } from "../components/RoleRoute";
import { PublicOnlyRoute } from "../components/PublicOnlyRoute";
import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "./routePaths.js";
import { Landing } from "../pages/Landing";
import { About } from "../pages/About";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { VerifyEmail } from "../pages/VerifyEmail";
import { ResetPassword } from "../pages/ResetPassword";
import { ForgotPassword } from "../pages/ForgotPassword";
import ChooseRole from "../pages/ChooseRole.jsx";
import { Dashboard } from "../pages/Dashboard";
import { Discover } from "../pages/Discover";
import { Album } from "../pages/Album";
import { AlbumDetails } from "../pages/AlbumDetails";
import { MyMusic } from "../pages/MyMusic";
import { MyAlbums } from "../pages/MyAlbums";
import { CreateMusic } from "../pages/CreateMusic";
import { CreateAlbum } from "../pages/CreateAlbum";
import { Profile } from "../pages/Profile";
import { Settings } from "../pages/Settings";
import { AdminUsers } from "../pages/AdminUsers";
import { Liked } from "../pages/Liked";
import { RecentlyPlayed } from "../pages/RecentlyPlayed";
import { Following } from "../pages/Following";
import { NotFoundPage } from "../pages/NotFoundPage";
import { Artists } from "../pages/Artists";
import { ArtistDetails } from "../pages/ArtistDetails";
import { AdminContent } from "../pages/AdminContent";
import { AdminStats } from "../pages/AdminStats.jsx";
import { AdminAuditLog } from "../pages/AdminAuditLog";
import { Messages } from "../pages/Messages";

export const AppRoutes = () => {
  const publicRoute = (element) => <PublicOnlyRoute>{element}</PublicOnlyRoute>;

  return (
    <Routes>
      {/* ===== Public ===== */}
      <Route path="/" element={publicRoute(<Landing />)} />
      <Route path="/about" element={publicRoute(<About />)} />
      <Route path="/login" element={publicRoute(<Login />)} />
      <Route path="/register" element={publicRoute(<Register />)} />
      <Route
        path="/verify-email/:token"
        element={publicRoute(<VerifyEmail />)}
      />
      <Route
        path="/reset-password/:token"
        element={publicRoute(<ResetPassword />)}
      />
      <Route
        path="/forgot-password"
        element={publicRoute(<ForgotPassword />)}
      />
      <Route path="/choose-role" element={publicRoute(<ChooseRole />)} />

      {/* Friendly listener URLs; the role-scoped routes remain canonical. */}
      <Route
        path="/artists"
        element={<Navigate to="/listener/artists" replace />}
      />
      <Route path="/artists/:artistId" element={<ArtistDetailsRedirect />} />

      {/* ===== Dashboard Workspace (role-based) ===== */}
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

        <Route
          path="messages"
          element={
            <RoleRoute allowedRoles={["listener", "artist"]}>
              <Messages />
            </RoleRoute>
          }
        />

        {/* Listener */}
        <Route path="discover" element={<Discover />} />
        <Route path="album" element={<Album />} />
        <Route path="album/:id" element={<AlbumDetails />} />
        <Route path="liked-songs" element={<Liked />} />
        <Route path="recently-played" element={<RecentlyPlayed />} />
        <Route path="following" element={<Following />} />
        <Route
          path="artists"
          element={
            <RoleRoute allowedRoles={["listener"]}>
              <Artists />
            </RoleRoute>
          }
        />
        <Route
          path="artists/:artistId"
          element={
            <RoleRoute allowedRoles={["listener"]}>
              <ArtistDetails />
            </RoleRoute>
          }
        />

        {/* Artist only */}
        <Route
          path="my-music"
          element={
            <RoleRoute allowedRoles={["artist"]}>
              <MyMusic />
            </RoleRoute>
          }
        />
        <Route
          path="my-albums"
          element={
            <RoleRoute allowedRoles={["artist"]}>
              <MyAlbums />
            </RoleRoute>
          }
        />
        <Route
          path="upload-music"
          element={
            <RoleRoute allowedRoles={["artist"]}>
              <CreateMusic />
            </RoleRoute>
          }
        />
        <Route
          path="create-album"
          element={
            <RoleRoute allowedRoles={["artist"]}>
              <CreateAlbum />
            </RoleRoute>
          }
        />

        {/* Admin only */}
        <Route
          path="users"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </RoleRoute>
          }
        />
        <Route
          path="content"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminContent />
            </RoleRoute>
          }
        />
        <Route
          path="stats"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminStats />
            </RoleRoute>
          }
        />
        <Route
          path="audit-log"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminAuditLog />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="/dashboard/*" element={<LegacyDashboardRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const RoleDashboardRoute = ({ children }) => {
  const { role } = useParams();
  const { user } = useAuth();

  if (!["artist", "listener", "admin"].includes(role) || role !== user?.role) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return children;
};

const LegacyDashboardRedirect = () => {
  const { user } = useAuth();

  return <Navigate to={getDashboardPath(user?.role)} replace />;
};

const ArtistDetailsRedirect = () => {
  const { artistId } = useParams();
  return <Navigate to={`/listener/artists/${artistId}`} replace />;
};
