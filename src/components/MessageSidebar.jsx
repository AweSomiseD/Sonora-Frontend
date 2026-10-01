import { useEffect, useState } from "react";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import socket from "../socket.js";
import api from "../services/api.js";

export const MessageSidebar = ({ conversation, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!conversation?._id) return;

    const loadMessages = async () => {
      try {
        const response = await api.get(
          `/messages/conversations/${conversation._id}/messages`,
        );

        setMessages(response.data.messages || []);
      } catch (error) {
        console.error("Load messages error:", error);
      }
    };

    const handleNewMessage = (message) => {
      if (String(message.conversation) !== String(conversation._id)) {
        return;
      }

      setMessages((current) => [...current, message]);
    };

    loadMessages();

    socket.on("message:new", handleNewMessage);

    socket.emit("conversation:join", conversation._id, (response) => {
      if (!response?.success) {
        console.error("Conversation join failed:", response);
      }
    });

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [conversation?._id]);

  const handleSendMessage = (event) => {
    event.preventDefault();

    const text = content.trim();

    if (!text || sending) return;

    setSending(true);

    socket.emit(
      "message:send",
      {
        conversationId: conversation._id,
        content: text,
        clientMessageId: crypto.randomUUID(),
      },
      (response) => {
        setSending(false);

        if (!response?.success) {
          console.error("Message send failed:", response);
          return;
        }

        setContent("");
      },
    );
  };

  if (!conversation) return null;

  return (
    <aside className="fixed right-0 top-0 z-50 flex h-screen w-95 flex-col border-l border-gray-800 bg-gray-950 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-800 px-4 py-4">
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
        >
          <FaArrowLeft />
        </button>

        <div>
          <p className="text-xs text-gray-500">Conversation</p>

          <h2 className="font-semibold text-white">
            {conversation.otherUser?.username || "Artist"}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-gray-500">
            No messages yet.
            <br />
            Start the conversation.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isMine =
                String(message.sender) !== String(conversation.otherUserId);

              return (
                <div
                  key={message._id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      isMine
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-200"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="flex gap-2 border-t border-gray-800 p-4"
      >
        <input
          type="text"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write a message..."
          maxLength={2000}
          className="min-w-0 flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-500"
        />

        <button
          type="submit"
          disabled={!content.trim() || sending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaPaperPlane />
        </button>
      </form>
    </aside>
  );
};
