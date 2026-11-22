import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SwitchRoleButton from "../components/SwitchRoleButton.jsx";

// Simple stand-ins for the real contexts
const auth = { canSwitch: true, activeRole: "listener", switchRole: vi.fn(), switching: false };
const notifications = { messageSummary: null };

vi.mock("../context/AuthContext.jsx", () => ({ useAuth: () => auth }));
vi.mock("../context/NotificationContext.jsx", () => ({ useNotifications: () => notifications }));

describe("SwitchRoleButton", () => {
  beforeEach(() => {
    Object.assign(auth, { canSwitch: true, activeRole: "listener", switchRole: vi.fn(), switching: false });
    notifications.messageSummary = null;
  });

  it("is hidden for users with only one role", () => {
    auth.canSwitch = false;
    const { container } = render(<SwitchRoleButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it("is hidden in admin mode", () => {
    auth.activeRole = "admin";
    const { container } = render(<SwitchRoleButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it("switches a listener to Artist Studio", async () => {
    render(<SwitchRoleButton />);
    const button = screen.getByRole("button", { name: "Switch to Artist Studio" });
    await userEvent.click(button);
    expect(auth.switchRole).toHaveBeenCalledWith("artist");
  });

  it("switches an artist back to listener mode", async () => {
    auth.activeRole = "artist";
    render(<SwitchRoleButton />);
    await userEvent.click(screen.getByRole("button", { name: "Switch to Listener" }));
    expect(auth.switchRole).toHaveBeenCalledWith("listener");
  });

  it("shows unread chats waiting in the other mode", () => {
    notifications.messageSummary = { otherMode: { role: "artist", conversations: 3 } };
    render(<SwitchRoleButton />);
    expect(screen.getByRole("button", { name: "Switch to Artist Studio (3 unread)" })).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("is disabled while a switch is running", () => {
    auth.switching = true;
    render(<SwitchRoleButton />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
