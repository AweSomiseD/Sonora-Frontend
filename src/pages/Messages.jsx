import { useEffect, useMemo, useRef, useState } from "react";
import { FaArrowLeft, FaComments, FaSearch } from "react-icons/fa";
import api from "../services/api.js";
import socket from "../socket.js";
import { useLocation } from "react-router-dom";
import debounce from "debounce";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import PremiumBadge from "../components/PremiumBadge.jsx";

export const Messages = () => {
  const location = useLocation();
  const { user, activeRole } = useAuth();
  const { refreshMessages } = useNotifications();
  usePageTitle("Messages");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState("");
  const [conversationLoadAttempt, setConversationLoadAttempt] = useState(0);
  const [messageLoadAttempt, setMessageLoadAttempt] = useState(0);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isSocketReady, setIsSocketReady] = useState(socket.isReady);
  const messagesContainerRef = useRef(null);
  const activeConversationIdRef = useRef(null);
  const wasAtBottomRef = useRef(true);
  const seenMessageIdsRef = useRef(new Set());
  const presenceEventsRef = useRef(0);
  const isTypingRef = useRef(false);
  const typingStopTimerRef = useRef(null);
  const peerTypingTimerRef = useRef(null);
  const pendingMessageRef = useRef(null);
  const handleSearch = useMemo(
    () => debounce((value) => setSearchQuery(value), 300),
    [],
  );

  const updateConversation = (conversationId, update) => {
    setConversations((current) =>
      current
        .map((conversation) =>
          String(conversation._id) === String(conversationId)
            ? { ...conversation, ...update }
            : conversation,
        )
        .sort(
          (first, second) =>
            new Date(second.lastMessageAt || 0) -
            new Date(first.lastMessageAt || 0),
        ),
    );
  };

  const markConversationRead = (conversationId) => {
    setTimeout(refreshMessages, 300);
    if (!socket.connected || !socket.isReady) return;

    socket
      .timeout(10000)
      .emit("conversation:read", conversationId, (error, response) => {
        if (error || !response?.success) return;

        const readAt = response.readAt || new Date().toISOString();
        updateConversation(conversationId, {
          unreadCount: 0,
          lastReadAt: readAt,
        });
        setSelectedConversation((current) =>
          String(current?._id) === String(conversationId)
            ? { ...current, unreadCount: 0, lastReadAt: readAt }
            : current,
        );
      });
  };

  const stopTyping = (conversationId = selectedConversation?._id) => {
    if (typingStopTimerRef.current) {
      clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }

    if (isTypingRef.current && conversationId) {
      socket.emit("typing:stop", { conversationId });
      isTypingRef.current = false;
    }
  };

  const handleMessageInput = (value) => {
    setMessageContent(value);
    if (pendingMessageRef.current?.content !== value.trim()) {
      pendingMessageRef.current = null;
      setSendError("");
    }

    const conversationId = selectedConversation?._id;
    if (!conversationId || !socket.connected || !socket.isReady) return;

    if (value.trim() && !isTypingRef.current) {
      socket.emit("typing:start", { conversationId });
      isTypingRef.current = true;
    } else if (!value.trim()) {
      stopTyping(conversationId);
      return;
    }

    if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);
    typingStopTimerRef.current = setTimeout(
      () => stopTyping(conversationId),
      900,
    );
  };

  const attemptSendMessage = () => {
    const pendingMessage = pendingMessageRef.current;
    if (
      !selectedConversation?._id ||
      !pendingMessage ||
      String(pendingMessage.conversationId) !== String(selectedConversation._id)
    ) {
      return;
    }

    if (!socket.connected || !socket.isReady) {
      setSendError("You are disconnected. Reconnect and retry your message.");
      return;
    }

    setSending(true);
    setSendError("");
    stopTyping(pendingMessage.conversationId);

    const { content, clientMessageId, conversationId } = pendingMessage;
    socket.timeout(10000).emit(
      "message:send",
      {
        conversationId,
        content,
        clientMessageId,
      },
      (error, response) => {
        if (pendingMessageRef.current !== pendingMessage) return;
        setSending(false);

        if (error || !response?.success) {
          setSendError(
            response?.message || "Message could not be sent. Please retry.",
          );
          return;
        }

        if (
          String(selectedConversation?._id) === String(conversationId) &&
          response.message?._id
        ) {
          const messageId = String(response.message._id);
          if (!seenMessageIdsRef.current.has(messageId)) {
            seenMessageIdsRef.current.add(messageId);
            setMessages((current) => [...current, response.message]);
          }
        }

        pendingMessageRef.current = null;
        setMessageContent("");
      },
    );
  };

  useEffect(() => {
    const conversation = location.state?.conversation;

    if (!conversation?._id) return;

    setSelectedConversation(conversation);

    window.history.replaceState({}, document.title);
  }, [location.state]);

  useEffect(
    () => () => {
      handleSearch.clear();
    },
    [handleSearch],
  );

  useEffect(() => {
    if (!selectedConversation?._id) {
      activeConversationIdRef.current = null;
      return;
    }

    const conversationId = selectedConversation._id;
    let active = true;
    const conversationChanged =
      activeConversationIdRef.current !== String(conversationId);
    activeConversationIdRef.current = String(conversationId);
    if (conversationChanged) {
      presenceEventsRef.current = 0;
      wasAtBottomRef.current = true;
      pendingMessageRef.current = null;
      setMessageContent("");
      setSending(false);
      setSendError("");
      setMessages([]);
      setIsOtherUserOnline(null);
      setIsOtherUserTyping(false);
    }
    setMessagesError("");

    const loadMessages = async () => {
      try {
        setMessagesLoading(true);
        const response = await api.get(
          `/messages/conversations/${conversationId}/messages`,
        );

        if (!active) return;
        const loadedMessages = response.data.messages || [];
        loadedMessages.forEach((message) =>
          seenMessageIdsRef.current.add(String(message._id)),
        );
        setMessages((current) => {
          const loadedIds = new Set(
            loadedMessages.map((message) => String(message._id)),
          );
          return [
            ...loadedMessages,
            ...current.filter((message) => !loadedIds.has(String(message._id))),
          ];
        });
      } catch (error) {
        void ("Load messages error:", error);
        if (active) setMessagesError("Messages could not be loaded.");
      } finally {
        if (active) setMessagesLoading(false);
      }
    };

    const handleTypingStart = (payload) => {
      if (
        String(payload.conversationId) === String(conversationId) &&
        String(payload.userId) === String(selectedConversation.otherUserId)
      ) {
        setIsOtherUserTyping(true);
        if (peerTypingTimerRef.current) {
          clearTimeout(peerTypingTimerRef.current);
        }
        peerTypingTimerRef.current = setTimeout(
          () => setIsOtherUserTyping(false),
          2500,
        );
      }
    };

    const handleTypingStop = (payload) => {
      if (
        String(payload.conversationId) === String(conversationId) &&
        String(payload.userId) === String(selectedConversation.otherUserId)
      ) {
        setIsOtherUserTyping(false);
        if (peerTypingTimerRef.current) {
          clearTimeout(peerTypingTimerRef.current);
          peerTypingTimerRef.current = null;
        }
      }
    };

    const handlePresence = (payload) => {
      if (String(payload.userId) === String(selectedConversation.otherUserId)) {
        presenceEventsRef.current += 1;
        setIsOtherUserOnline(Boolean(payload.isOnline));
      }
    };

    const joinConversation = () => {
      if (!socket.connected || !socket.isReady) return;
      const presenceEventCount = presenceEventsRef.current;
      socket
        .timeout(10000)
        .emit("conversation:join", conversationId, (error, response) => {
          if (!active) return;
          if (error || !response?.success) {
            setMessagesError(
              response?.message || "Could not join this conversation.",
            );
            return;
          }

          setMessagesError("");
          if (presenceEventsRef.current === presenceEventCount) {
            setIsOtherUserOnline(Boolean(response.isOtherUserOnline));
          }
          markConversationRead(conversationId);
        });
    };

    const handleSocketDisconnect = () => {
      setIsSocketReady(false);
      setIsOtherUserOnline(null);
      setIsOtherUserTyping(false);
      if (peerTypingTimerRef.current) {
        clearTimeout(peerTypingTimerRef.current);
        peerTypingTimerRef.current = null;
      }
      isTypingRef.current = false;
      if (typingStopTimerRef.current) {
        clearTimeout(typingStopTimerRef.current);
        typingStopTimerRef.current = null;
      }
    };

    const handleSocketReady = () => {
      setIsSocketReady(true);
      joinConversation();
    };

    loadMessages();
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    socket.on("user:presence", handlePresence);
    socket.on("socket:ready", handleSocketReady);
    socket.on("disconnect", handleSocketDisconnect);
    setIsSocketReady(socket.isReady);
    if (socket.isReady) joinConversation();

    return () => {
      active = false;
      stopTyping(conversationId);
      if (peerTypingTimerRef.current) {
        clearTimeout(peerTypingTimerRef.current);
        peerTypingTimerRef.current = null;
      }
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.off("user:presence", handlePresence);
      socket.off("socket:ready", handleSocketReady);
      socket.off("disconnect", handleSocketDisconnect);
    };
  }, [
    selectedConversation?._id,
    selectedConversation?.otherUserId,
    user?._id,
    user?.id,
    messageLoadAttempt,
  ]);

  useEffect(() => {
    const currentUserId = user?._id || user?.id;
    const selectedId = selectedConversation?._id;

    const handleReadReceipt = (receipt) => {
      setConversations((current) =>
        current.map((conversation) => {
          if (String(conversation._id) !== String(receipt.conversationId)) {
            return conversation;
          }

          return String(receipt.userId) === String(conversation.otherUserId)
            ? { ...conversation, otherLastReadAt: receipt.readAt }
            : { ...conversation, unreadCount: 0, lastReadAt: receipt.readAt };
        }),
      );

      if (String(receipt.conversationId) === String(selectedId)) {
        setSelectedConversation((current) =>
          String(receipt.userId) === String(current?.otherUserId)
            ? { ...current, otherLastReadAt: receipt.readAt }
            : { ...current, unreadCount: 0, lastReadAt: receipt.readAt },
        );
      }
    };

    const handleNewMessage = (message) => {
      // Chats of the other dashboard (dual-role users) are handled by the
      // notification badge + toast, not by this inbox.
      if (message.conversationMode && message.conversationMode !== activeRole)
        return;
      const conversationId = String(message.conversation);
      const messageId = String(message._id);
      if (!messageId || seenMessageIdsRef.current.has(messageId)) return;
      seenMessageIdsRef.current.add(messageId);

      const isIncoming = String(message.sender) !== String(currentUserId);
      const isOpen = conversationId === String(selectedId);
      if (isOpen) setMessages((current) => [...current, message]);

      if (
        isIncoming &&
        !conversations.some(
          (conversation) => String(conversation._id) === conversationId,
        )
      ) {
        api
          .get("/messages/conversations")
          .then((response) => {
            const refreshed = response.data.conversations || [];
            setConversations(
              isOpen
                ? refreshed.map((conversation) =>
                    String(conversation._id) === conversationId
                      ? { ...conversation, unreadCount: 0 }
                      : conversation,
                  )
                : refreshed,
            );
          })
          .catch((error) => {
            void ("Refresh conversations error:", error);
          });
      }

      setConversations((current) =>
        current
          .map((conversation) =>
            String(conversation._id) === conversationId
              ? {
                  ...conversation,
                  lastMessage: {
                    messageId: message._id,
                    sender: message.sender,
                    preview: message.content.slice(0, 120),
                    createdAt: message.createdAt,
                  },
                  lastMessageAt: message.createdAt,
                  unreadCount:
                    isIncoming && !isOpen
                      ? (conversation.unreadCount || 0) + 1
                      : conversation.unreadCount,
                }
              : conversation,
          )
          .sort(
            (first, second) =>
              new Date(second.lastMessageAt || 0) -
              new Date(first.lastMessageAt || 0),
          ),
      );

      if (isIncoming && isOpen) markConversationRead(conversationId);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("conversation:read", handleReadReceipt);
    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("conversation:read", handleReadReceipt);
    };
  }, [
    selectedConversation?._id,
    user?._id,
    user?.id,
    conversations,
    activeRole,
  ]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !wasAtBottomRef.current) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, selectedConversation?._id]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await api.get("/messages/conversations");

        setConversations(response.data.conversations || []);
        setConversationsError("");
      } catch (error) {
        void ("Load conversations error:", error);
        setConversationsError("Conversations could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [conversationLoadAttempt]);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.otherUser?.username
      ?.toLowerCase()
      .includes(searchQuery.trim().toLowerCase()),
  );

  const handleSendMessage = (event) => {
    event?.preventDefault?.();
    if (!selectedConversation?._id) return;

    const content = messageContent.trim();

    if (!content || sending) return;

    pendingMessageRef.current = {
      conversationId: selectedConversation._id,
      content,
      clientMessageId: crypto.randomUUID(),
    };
    attemptSendMessage();
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-[120px]" />
        <div
          className="absolute -right-40 bottom-20 h-96 w-96 animate-pulse rounded-full bg-fuchsia-600/8 blur-[120px]"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col p-3 animate-fade-in-up sm:p-6">
        <div className="flex h-full min-h-0 overflow-hidden rounded-2xl border border-violet-500/20 bg-gray-900/60 shadow-[0_20px_60px_-15px_rgba(139,92,246,0.25)] backdrop-blur-xl">
          {/* ========================================
              Conversations Sidebar
          ======================================== */}
          <aside
            className={`min-h-0 w-full shrink-0 flex-col border-r border-violet-500/10 md:w-80 md:flex ${
              selectedConversation ? "hidden" : "flex"
            }`}
          >
            {/* Header */}
            <div className="border-b border-violet-500/10 p-5">
              <h1 className="text-2xl font-black">
                <span className="bg-linear-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                  Messages
                </span>
              </h1>

              <div className="relative mt-4 rounded-xl p-px">
                <div className="absolute inset-0 rounded-xl bg-linear-to-r from-violet-500/40 via-fuchsia-500/40 to-purple-500/40 opacity-70" />
                <div className="relative flex items-center gap-3 rounded-[calc(0.75rem-1px)] bg-gray-950/90 px-3 py-2.5 backdrop-blur-md">
                  <FaSearch className="text-sm text-violet-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(event) => {
                      const value = event.target.value;

                      setSearchInput(value);
                      handleSearch(value);
                    }}
                    placeholder="Search conversations..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                  />
                </div>
              </div>

              {searchQuery.trim() && (
                <div className="mt-3">
                  <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-400">
                    Search results
                  </p>

                  {filteredConversations.length === 0 ? (
                    <p className="px-1 py-3 text-sm text-gray-500">
                      No conversations found.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {filteredConversations.map((conversation) => (
                        <button
                          key={conversation._id}
                          type="button"
                          onClick={() => {
                            setSelectedConversation(conversation);
                            setSearchQuery("");
                          }}
                          className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-300 hover:bg-violet-500/10"
                        >
                          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-linear-to-br from-violet-500/25 to-fuchsia-500/15 font-bold text-violet-300">
                            {conversation.otherUser?.username?.[0]?.toUpperCase() ||
                              "U"}
                          </div>

                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">
                              {conversation.otherUser?.username ||
                                "Unknown user"}
                            </p>
                            {conversation.otherUser?.isPremium && (
                              <PremiumBadge />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Conversation List */}
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
                  <p className="mt-3 text-sm text-gray-500">
                    Loading conversations...
                  </p>
                </div>
              </div>
            ) : conversationsError ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-sm text-red-300">{conversationsError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    setConversationLoadAttempt((attempt) => attempt + 1);
                  }}
                  className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-all hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-200"
                >
                  Retry
                </button>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-violet-500/15 blur-2xl" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-violet-500/30 bg-linear-to-br from-violet-500/25 to-fuchsia-500/15 text-violet-300">
                    <FaComments className="text-xl" />
                  </div>
                </div>

                <p className="mt-4 text-sm font-medium text-gray-300">
                  No conversations yet
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Your conversations will appear here.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                  <button
                    key={conversation._id}
                    type="button"
                    onClick={() => setSelectedConversation(conversation)}
                    className={`flex w-full items-center gap-3 border-b border-gray-800/50 px-4 py-4 text-left transition-all duration-300 ${
                      String(selectedConversation?._id) ===
                      String(conversation._id)
                        ? "bg-violet-500/10"
                        : "hover:bg-violet-500/5"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">
                            {conversation.otherUser?.username || "Unknown user"}
                          </p>
                          {conversation.otherUser?.isPremium && (
                            <PremiumBadge />
                          )}
                        </div>

                        {conversation.unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-red-500 to-rose-500 px-1.5 text-xs font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                            {conversation.unreadCount > 9
                              ? "9+"
                              : conversation.unreadCount}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {conversation.lastMessage?.preview || "No messages yet"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* ========================================
              Chat Panel
          ======================================== */}
          <section
            className={`min-h-0 min-w-0 flex-1 flex-col ${
              selectedConversation ? "flex" : "hidden md:flex"
            }`}
          >
            {/* Chat Header */}
            <div className="flex items-center border-b border-violet-500/10 px-3 py-4 sm:px-6">
              {selectedConversation && (
                <button
                  type="button"
                  aria-label="Back to conversations"
                  onClick={() => setSelectedConversation(null)}
                  className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-300 transition hover:bg-white/5 md:hidden"
                >
                  <FaArrowLeft aria-hidden="true" />
                </button>
              )}
              {selectedConversation ? (
                <>
                  <div className="relative h-10 w-10">
                    <div className="absolute inset-0 rounded-full bg-linear-to-br from-violet-500/40 to-fuchsia-500/30 blur-sm" />
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/30 bg-linear-to-br from-violet-500/30 to-fuchsia-500/20 text-sm font-bold text-violet-200">
                      {selectedConversation?.otherUser?.username?.[0]?.toUpperCase() ||
                        "U"}
                    </div>
                    {/* Online dot */}
                    {isOtherUserOnline && isSocketReady && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-gray-900 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/30 bg-linear-to-br from-violet-500/20 to-fuchsia-500/10 text-sm font-bold text-violet-300">
                  ?
                </div>
              )}

              <div className="ml-3 min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="truncate text-sm font-semibold text-white">
                    {selectedConversation?.otherUser?.username ||
                      "Select a conversation to start chatting"}
                  </h2>
                  {selectedConversation?.otherUser?.isPremium && (
                    <PremiumBadge />
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  {selectedConversation && (
                    <>
                      {selectedConversation.otherUser?.role === "artist"
                        ? "Artist"
                        : "Listener"}
                      {" · "}
                      <span
                        className={
                          !isSocketReady || isOtherUserOnline === null
                            ? "text-gray-500"
                            : isOtherUserOnline
                              ? "text-emerald-400"
                              : "text-gray-500"
                        }
                      >
                        {!isSocketReady
                          ? "● Reconnecting..."
                          : isOtherUserOnline === null
                            ? "● Checking status..."
                            : isOtherUserOnline
                              ? "● Online"
                              : "● Offline"}
                      </span>
                    </>
                  )}
                </p>
                {isOtherUserTyping && (
                  <p
                    className="mt-1 text-xs text-violet-300"
                    style={{ animation: "pulseDot 1.5s ease-in-out infinite" }}
                  >
                    typing...
                  </p>
                )}
              </div>
            </div>

            {/* Empty Chat State */}
            {!selectedConversation ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-violet-500/15 blur-2xl" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-violet-500/30 bg-linear-to-br from-violet-500/25 to-fuchsia-500/15 text-violet-300">
                      <FaComments className="text-xl" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-400">
                    Select a conversation to start chatting
                  </p>
                </div>
              </div>
            ) : (
              <div
                ref={messagesContainerRef}
                onScroll={(event) => {
                  const { scrollTop, scrollHeight, clientHeight } =
                    event.currentTarget;
                  wasAtBottomRef.current =
                    scrollHeight - scrollTop - clientHeight < 120;
                }}
                className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6"
              >
                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
                      <p className="mt-3 text-sm text-gray-500">
                        Loading messages...
                      </p>
                    </div>
                  </div>
                ) : messagesError ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                    <p className="text-sm text-red-300">{messagesError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setMessagesLoading(true);
                        setMessageLoadAttempt((attempt) => attempt + 1);
                      }}
                      className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-all hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-200"
                    >
                      Retry
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-gray-400">No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const isMine =
                        String(message.sender) !==
                        String(selectedConversation.otherUserId);
                      const wasRead =
                        isMine &&
                        selectedConversation.otherLastReadAt &&
                        new Date(selectedConversation.otherLastReadAt) >=
                          new Date(message.createdAt);

                      return (
                        <div
                          key={message._id}
                          className={`flex ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                              isMine
                                ? "bg-linear-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                                : "border border-gray-800/50 bg-gray-800/80 text-gray-200 backdrop-blur-sm"
                            }`}
                          >
                            <p className="whitespace-pre-wrap wrap-break-word">
                              {message.content}
                            </p>
                            <div
                              className={`mt-1 flex items-center justify-end gap-2 text-[10px] ${
                                isMine ? "text-violet-100" : "text-gray-400"
                              }`}
                            >
                              <time dateTime={message.createdAt}>
                                {message.createdAt
                                  ? new Date(
                                      message.createdAt,
                                    ).toLocaleTimeString([], {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </time>
                              {isMine && (
                                <span
                                  className={
                                    wasRead
                                      ? "text-emerald-200"
                                      : "text-violet-200"
                                  }
                                >
                                  {wasRead ? "Read" : "Sent"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {isOtherUserTyping && (
                  <p
                    className="mt-3 text-xs text-violet-300"
                    style={{ animation: "pulseDot 1.5s ease-in-out infinite" }}
                  >
                    typing...
                  </p>
                )}
              </div>
            )}

            {/* Message Composer */}
            {selectedConversation && (
              <form
                onSubmit={handleSendMessage}
                className="shrink-0 border-t border-violet-500/10 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] sm:p-4"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={messageContent}
                    onChange={(event) => handleMessageInput(event.target.value)}
                    placeholder="Type a message..."
                    maxLength={2000}
                    disabled={sending}
                    className="min-w-0 flex-1 rounded-xl border border-gray-700/50 bg-gray-950/60 px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-gray-500 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <div className="flex items-center gap-2">
                    {sendError && (
                      <button
                        type="button"
                        onClick={attemptSendMessage}
                        disabled={sending}
                        className="text-xs font-medium text-red-300 transition-colors hover:text-red-200 disabled:opacity-50"
                      >
                        Retry
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={!messageContent.trim() || sending}
                      className="group/btn relative overflow-hidden rounded-xl bg-linear-to-r from-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-50 disabled:shadow-none"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                      <span className="relative">
                        {sending ? "Sending..." : "Send"}
                      </span>
                    </button>
                  </div>
                </div>
                {sendError && (
                  <p role="alert" className="mt-2 text-xs text-red-300">
                    {sendError}
                  </p>
                )}
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
