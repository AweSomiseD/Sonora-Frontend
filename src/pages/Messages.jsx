import { useEffect, useMemo, useRef, useState } from "react";
import { FaComments, FaSearch } from "react-icons/fa";
import api from "../services/api.js";
import socket from "../socket.js";
import { useLocation } from "react-router-dom";
import debounce from "debounce";
import { useAuth } from "../context/AuthContext.jsx";

export const Messages = () => {
  const location = useLocation();
  const { user } = useAuth();
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
        console.error("Load messages error:", error);
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
            console.error("Refresh conversations error:", error);
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
  }, [selectedConversation?._id, user?._id, user?.id, conversations]);

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
        console.error("Load conversations error:", error);
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
    <div className="h-[calc(100vh-73px)] p-6">
      <div className="flex h-full overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
        {/* Conversations */}
        <aside className="flex w-80 shrink-0 flex-col border-r border-gray-800">
          {/* Header */}
          <div className="border-b border-gray-800 p-5">
            <h1 className="text-2xl font-bold text-white">Messages</h1>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5">
              <FaSearch className="text-sm text-gray-500" />
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
            {searchQuery.trim() && (
              <div className="mt-3">
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
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
                        className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-gray-800"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 font-bold text-amber-500">
                          {conversation.otherUser?.username?.[0]?.toUpperCase() ||
                            "U"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {conversation.otherUser?.username || "Unknown user"}
                          </p>

                          <p className="mt-1 truncate text-xs text-gray-500">
                            {conversation.lastMessage?.preview ||
                              "No messages yet"}
                          </p>
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
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Loading conversations...
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
                className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-700"
              >
                Retry
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
                <FaComments className="text-xl" />
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
                  className="flex w-full items-center gap-3 border-b border-gray-800 px-4 py-4 text-left transition hover:bg-gray-800/60"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/10 font-bold text-amber-500">
                    {conversation.otherUser?.username?.[0]?.toUpperCase() ||
                      "U"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {conversation.otherUser?.username || "Unknown user"}
                      </p>

                      {conversation.unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
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

        {/* Chat Panel */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Chat Header */}
          <div className="flex items-center border-b border-gray-800 px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-sm font-bold text-amber-500">
              ?
            </div>

            <div className="ml-3">
              <h2 className="text-sm font-semibold text-white">
                {selectedConversation?.otherUser?.username ||
                  "Select a conversation to start chatting"}
              </h2>

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
                            ? "text-green-400"
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
                <p className="mt-1 text-xs text-purple-300">typing...</p>
              )}
            </div>
          </div>

          {/* Empty Chat State */}
          {!selectedConversation ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-gray-400">
                Select a conversation to start chatting
              </p>
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
              className="flex-1 overflow-y-auto p-6"
            >
              {messagesLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  Loading messages...
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
                    className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-700"
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
                              ? "bg-purple-600 text-white"
                              : "bg-gray-800 text-gray-200"
                          }`}
                        >
                          <p className="whitespace-pre-wrap wrap-break-word">
                            {message.content}
                          </p>
                          <div
                            className={`mt-1 flex items-center justify-end gap-2 text-[10px] ${
                              isMine ? "text-purple-200" : "text-gray-400"
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
                            {isMine && <span>{wasRead ? "Read" : "Sent"}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {isOtherUserTyping && (
                <p className="mt-3 text-xs text-gray-400">typing...</p>
              )}
            </div>
          )}
          {/* Message Composer */}
          {selectedConversation && (
            <form
              onSubmit={handleSendMessage}
              className="border-t border-gray-800 p-4"
            >
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={messageContent}
                  onChange={(event) => handleMessageInput(event.target.value)}
                  placeholder="Type a message..."
                  maxLength={2000}
                  disabled={sending}
                  className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <div className="flex items-center gap-2">
                  {sendError && (
                    <button
                      type="button"
                      onClick={attemptSendMessage}
                      disabled={sending}
                      className="text-xs font-medium text-red-300 hover:text-red-200 disabled:opacity-50"
                    >
                      Retry
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!messageContent.trim() || sending}
                    className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send"}
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
  );
};
