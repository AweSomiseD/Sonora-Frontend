import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Messages } from "../pages/Messages.jsx";

const { api, socket, auth, notifications } = vi.hoisted(() => ({
  api: { get: vi.fn(), post: vi.fn() },
  socket: {
    connected: false,
    isReady: false,
    on: vi.fn(),
    off: vi.fn(),
  },
  auth: { user: { _id: "artist-1" }, activeRole: "artist" },
  notifications: { refreshMessages: vi.fn() },
}));
const conversation = {
  _id: "conversation-1",
  otherUserId: "listener-1",
  otherUser: { username: "testlistener", role: "listener" },
  unreadCount: 0,
  lastMessage: { preview: "hello" },
};

vi.mock("../services/api.js", () => ({ default: api }));
vi.mock("../socket.js", () => ({ default: socket }));
vi.mock("../context/AuthContext.jsx", () => ({ useAuth: () => auth }));
vi.mock("../context/NotificationContext.jsx", () => ({
  useNotifications: () => notifications,
}));

describe("Messages responsive navigation", () => {
  beforeEach(() => {
    api.get.mockReset();
    api.get.mockImplementation(async (path) => {
      if (path === "/messages/conversations") {
        return { data: { conversations: [conversation] } };
      }
      if (path.endsWith("/messages")) return { data: { messages: [] } };
      return { data: {} };
    });
    api.post.mockReset();
    notifications.refreshMessages.mockReset();
    socket.on.mockReset();
    socket.off.mockReset();
    HTMLElement.prototype.scrollTo = vi.fn();
  });

  it("switches between the conversation list and chat panel", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <Messages />
      </MemoryRouter>,
    );
    const sidebar = container.querySelector("aside");
    const chatPanel = container.querySelector("section");

    expect(await screen.findByRole("button", { name: /testlistener hello/ })).toBeInTheDocument();
    expect(sidebar).toHaveClass("flex");
    expect(chatPanel).toHaveClass("hidden");

    await user.click(screen.getByRole("button", { name: /testlistener hello/ }));

    expect(await screen.findByRole("button", { name: "Back to conversations" })).toBeInTheDocument();
    expect(sidebar).toHaveClass("hidden");
    expect(chatPanel).toHaveClass("flex");

    await user.click(screen.getByRole("button", { name: "Back to conversations" }));

    expect(sidebar).toHaveClass("flex");
    expect(chatPanel).toHaveClass("hidden");
  });
});
