import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "../components/ProtectedRoute.jsx";
import { PublicOnlyRoute } from "../components/PublicOnlyRoute.jsx";
import { RoleRoute } from "../components/RoleRoute.jsx";

const auth = {};
vi.mock("../context/AuthContext.jsx", () => ({ useAuth: () => auth }));
vi.mock("../context/AuthContext", () => ({ useAuth: () => auth }));

function Where() {
  const location = useLocation();
  return <p data-testid="where">{location.pathname + location.search}</p>;
}

// Only the start path renders the guard; every redirect lands on <Where />
const renderAt = (path, element) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={path.split("?")[0]} element={element} />
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  );

const setAuth = (values) => {
  Object.keys(auth).forEach((key) => delete auth[key]);
  Object.assign(auth, { loading: false, user: null, isAuthenticated: false, activeRole: null }, values);
};

describe("route guards", () => {
  beforeEach(() => setAuth({}));

  it("ProtectedRoute sends visitors to login with ?next=", () => {
    renderAt("/secret?tab=1", <ProtectedRoute><p>secret page</p></ProtectedRoute>);
    expect(screen.getByTestId("where")).toHaveTextContent("/login?next=%2Fsecret%3Ftab%3D1");
  });

  it("ProtectedRoute shows the page when logged in", () => {
    setAuth({ user: { _id: "1" }, isAuthenticated: true, activeRole: "listener" });
    renderAt("/secret", <ProtectedRoute><p>secret page</p></ProtectedRoute>);
    expect(screen.getByText("secret page")).toBeInTheDocument();
  });

  it("RoleRoute blocks the wrong active role", () => {
    setAuth({ user: { _id: "1" }, isAuthenticated: true, activeRole: "listener" });
    renderAt("/secret", <RoleRoute allowedRoles={["artist"]}><p>artist page</p></RoleRoute>);
    expect(screen.queryByText("artist page")).not.toBeInTheDocument();
    expect(screen.getByTestId("where")).toHaveTextContent("/listener");
  });

  it("RoleRoute allows the active role", () => {
    setAuth({ user: { _id: "1" }, isAuthenticated: true, activeRole: "artist" });
    renderAt("/secret", <RoleRoute allowedRoles={["artist"]}><p>artist page</p></RoleRoute>);
    expect(screen.getByText("artist page")).toBeInTheDocument();
  });

  it("PublicOnlyRoute sends logged-in users to their dashboard", () => {
    setAuth({ user: { _id: "1" }, isAuthenticated: true, activeRole: "admin" });
    renderAt("/login", <PublicOnlyRoute><p>login form</p></PublicOnlyRoute>);
    expect(screen.getByTestId("where")).toHaveTextContent("/admin");
  });

  it("PublicOnlyRoute shows the page to visitors", () => {
    renderAt("/login", <PublicOnlyRoute><p>login form</p></PublicOnlyRoute>);
    expect(screen.getByText("login form")).toBeInTheDocument();
  });
});
