// Smoke test: every main page renders with sample API data and shows its heading.
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";

const user = {
  _id: "u1",
  username: "sara",
  email: "sara@example.com",
  roles: ["listener", "artist"],
  activeRole: "artist",
  role: "artist",
  emailVerified: true,
  authProvider: "local",
  hasPassword: true,
  subscriptionStatus: "free",
  subscriptionPlan: "free",
  artistProfile: { displayName: "Sara", bio: "", genres: ["pop"], links: [], banner: null, verified: false },
  createdAt: "2026-01-01T00:00:00Z",
};
const auth = {
  user,
  roles: user.roles,
  activeRole: "artist",
  isAuthenticated: true,
  loading: false,
  hasArtistRole: true,
  canSwitch: true,
  switching: false,
  artistRequest: null,
  switchRole: vi.fn(),
  refreshUser: vi.fn(),
  updateUser: vi.fn(),
  logoutAll: vi.fn(),
  logout: vi.fn(),
};
const series = [{ date: "2026-11-01", plays: 3, signups: 1 }, { date: "2026-11-02", plays: 5, signups: 0 }];
const track = { _id: "m1", title: "Song", uri: "https://x/a.mp3", duration: 120, genre: "pop", playCount: 9, artist: { _id: "u1", username: "sara" }, status: "published" };
const page = (items) => ({ items, page: 1, limit: 20, total: items.length, hasMore: false });

const responses = [
  ["/payments/status", { plan: "free", status: "free", isPremium: false, hasCustomer: false }],
  ["/admin/users", page([{ ...user, roles: ["listener"], isBanned: false }])],
  ["/admin/content/music", page([track])],
  ["/admin/stats", { stats: { totalUsers: 3, totalSongs: 2, totalAlbums: 1, bannedUsers: 0, roleCounts: { listener: 3, artist: 1, admin: 1 }, pendingArtistRequests: 1, openReports: 0, recentSignups: [{ ...user }], series } }],
  ["/admin/audit-logs", page([{ _id: "a1", action: "USER_BANNED", admin: { username: "boss" }, targetType: "user", details: { username: "x", reason: "spam" }, createdAt: "2026-11-01T00:00:00Z" }])],
  ["/admin/artist-requests", page([{ _id: "r1", artistName: "New Star", status: "pending", genres: ["pop"], links: ["https://example.com"], user: { username: "nina", email: "n@example.com" }, createdAt: "2026-11-01T00:00:00Z" }])],
  ["/admin/reports", page([{ _id: "rp1", targetType: "music", targetLabel: "Song", reason: "spam", status: "open", reporter: { username: "kim" }, createdAt: "2026-11-01T00:00:00Z" }])],
  ["/artist-requests/me", { request: null }],
  ["/playlists/mine", { items: [{ _id: "p1", name: "Chill", isPublic: false, trackCount: 1, updatedAt: "2026-11-01T00:00:00Z" }], total: 1 }],
  ["/playlists/p1", { playlist: { _id: "p1", name: "Chill", description: "", isPublic: true, isOwner: true, owner: { _id: "u1", username: "sara" }, trackCount: 1, tracks: [{ addedAt: "2026-11-01T00:00:00Z", music: track }], updatedAt: "2026-11-01T00:00:00Z" } }],
  ["/notifications", { ...page([{ _id: "n1", type: "new_release", title: "New song", body: "Sara released Song", isRead: false, link: "/listener", createdAt: "2026-11-01T00:00:00Z" }]), unread: 1 }],
  ["/analytics/artist/overview", { rangeDays: 7, totals: { plays: 8, uniqueListeners: 2, likes: 1, followers: 4, newFollowers: 1, tracks: 1 }, playsPerDay: series, topTracks: [{ _id: "m1", title: "Song", plays: 8 }], genreSplit: [{ genre: "pop", plays: 8 }], limits: { analyticsMaxRangeDays: 7, trackAnalytics: false } }],
  ["/analytics/listener/me", { since: "2026-11-01T00:00:00Z", totalPlays: 4, minutesListened: 12, topTracks: [{ ...track, plays: 4 }], topArtists: [{ _id: "u1", displayName: "Sara", plays: 4 }] }],
];

vi.mock("../services/api.js", () => {
  const get = vi.fn(async (url) => {
    const match = responses.find(([prefix]) => url.startsWith(prefix));
    return { data: match ? match[1] : {} };
  });
  return {
    default: { get, post: vi.fn(async () => ({ data: {} })), patch: vi.fn(async () => ({ data: {} })), put: vi.fn(), delete: vi.fn() },
    getErrorMessage: (e, fallback) => fallback || "error",
    getErrorCode: () => "",
  };
});
vi.mock("../context/AuthContext.jsx", () => ({ useAuth: () => auth }));
vi.mock("../context/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("../context/ToastContext.jsx", () => ({ useToast: () => ({ showToast: vi.fn() }) }));
vi.mock("../context/NotificationContext.jsx", () => ({
  useNotifications: () => ({ pendingCounts: { artistRequests: 1, reports: 0 }, unread: 1, markRead: vi.fn(), markAllRead: vi.fn(), messageSummary: null }),
}));
vi.mock("../context/PlayerContext.jsx", () => ({
  usePlayer: () => ({ playQueue: vi.fn(), isCurrent: () => false, isPlaying: false, togglePlay: vi.fn(), addToQueue: vi.fn(), shuffle: false, toggleShuffle: vi.fn() }),
}));

beforeAll(() => {
  // recharts needs ResizeObserver
  globalThis.ResizeObserver ||= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const pages = [
  ["Profile", () => import("../pages/Profile.jsx"), "Profile"],
  ["Settings", () => import("../pages/Settings.jsx"), "Settings"],
  ["Pricing", () => import("../pages/Pricing.jsx"), "Premium"],
  ["AdminUsers", () => import("../pages/AdminUsers.jsx"), "Users"],
  ["AdminContent", () => import("../pages/AdminContent.jsx"), "Content"],
  ["AdminStats", () => import("../pages/AdminStats.jsx"), "Platform stats"],
  ["AdminAuditLog", () => import("../pages/AdminAuditLog.jsx"), "Audit log"],
  ["AdminArtistRequests", () => import("../pages/AdminArtistRequests.jsx"), "Artist requests"],
  ["AdminReports", () => import("../pages/AdminReports.jsx"), "Reports"],
  ["BecomeArtist", () => import("../pages/BecomeArtist.jsx"), "Become an artist"],
  ["Playlists", () => import("../pages/Playlists.jsx"), "Your playlists"],
  ["Notifications", () => import("../pages/Notifications.jsx"), "Notifications"],
  ["ArtistAnalytics", () => import("../pages/ArtistAnalytics.jsx"), "Analytics"],
  ["ListenerStats", () => import("../pages/ListenerStats.jsx"), "Your stats"],
];

describe("pages render", () => {
  it.each(pages)("%s", async (_name, load, heading) => {
    const Page = (await load()).default;
    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { level: 1, name: new RegExp(heading) })).toBeInTheDocument();
  });

  it("playlist details shows the tracks", async () => {
    const Page = (await import("../pages/PlaylistDetails.jsx")).default;
    render(
      <MemoryRouter initialEntries={["/listener/playlists/p1"]}>
        <Routes>
          <Route path="/listener/playlists/:id" element={<Page />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { level: 1, name: "Chill" })).toBeInTheDocument();
    expect(screen.getByText("Song")).toBeInTheDocument();
  });

  it("admin requests list shows the applicant", async () => {
    const Page = (await import("../pages/AdminArtistRequests.jsx")).default;
    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>,
    );
    expect(await screen.findByText("New Star")).toBeInTheDocument();
  });

  it("listener dashboard displays the saved full name instead of the username", async () => {
    const previousUser = auth.user;
    const previousRole = auth.activeRole;
    auth.user = {
      ...user,
      username: "kashifaltaf",
      displayName: "Kashif Altaf",
      activeRole: "listener",
      isPremium: true,
      subscriptionStatus: "premium",
    };
    auth.activeRole = "listener";

    const Dashboard = (await import("../pages/Dashboard.jsx")).default;
    const view = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    try {
      expect(screen.getByRole("heading", { level: 1, name: /Kashif Altaf/ })).toBeInTheDocument();
      expect(screen.getAllByText("Premium").length).toBeGreaterThan(0);
    } finally {
      view.unmount();
      auth.user = previousUser;
      auth.activeRole = previousRole;
    }
  });
});
