import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import * as chatAPI from "../../services/chatAPI.js";
import { getSocket } from "../../services/socket.js";

const Chat = () => {
  const { user } = useSelector((state) => state.auth);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    chatAPI
      .getMyChats()
      .then(({ chats }) => setChats(chats))
      .catch(() => toast.error("Could not load conversations"));
  }, []);

  useEffect(() => {
    if (!activeChat) return;
    chatAPI
      .getMessages(activeChat._id)
      .then(({ messages }) => setMessages(messages))
      .catch(() => toast.error("Could not load messages"));
  }, [activeChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Live-append incoming messages for the currently open chat
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const handleNewMessage = ({ chatId, message }) => {
      if (activeChat && chatId === activeChat._id) {
        setMessages((prev) => [...prev, message]);
      }
      setChats((prev) =>
        prev.map((c) => (c._id === chatId ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt } : c))
      );
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [activeChat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeChat) return;
    try {
      const { message } = await chatAPI.sendMessage(activeChat._id, draft.trim());
      setMessages((prev) => [...prev, message]);
      setDraft("");
    } catch (err) {
      toast.error("Message failed to send");
    }
  };

  const otherParticipant = (chat) => chat.participants.find((p) => p._id !== user._id);

  return (
    <div className="mx-auto grid h-[calc(100vh-64px)] max-w-5xl grid-cols-[280px_1fr] px-4 py-6">
      {/* Conversation list */}
      <aside className="overflow-y-auto border-r border-river-100 pr-3">
        <h2 className="mb-3 font-display text-lg font-semibold text-river-900">Chats</h2>
        {chats.length === 0 && <p className="text-sm text-ink/50">No conversations yet.</p>}
        <ul className="space-y-1">
          {chats.map((c) => {
            const other = otherParticipant(c);
            return (
              <li key={c._id}>
                <button
                  onClick={() => setActiveChat(c)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                    activeChat?._id === c._id ? "bg-river-100 text-river-900" : "hover:bg-river-50"
                  }`}
                >
                  <p className="font-medium">{other?.name || "Unknown"}</p>
                  <p className="truncate text-xs text-ink/50">{c.lastMessage || "No messages yet"}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Active thread */}
      <section className="flex flex-col pl-4">
        {!activeChat ? (
          <p className="m-auto text-sm text-ink/50">Select a conversation to start chatting.</p>
        ) : (
          <>
            <div className="flex-1 space-y-2 overflow-y-auto pb-3">
              {messages.map((m) => {
                const isMine = m.sender._id === user._id;
                return (
                  <div key={m._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                        isMine ? "bg-river-600 text-white" : "bg-river-50 text-ink"
                      }`}
                    >
                      {m.text}
                      <p className={`mt-1 text-[10px] ${isMine ? "text-river-100/70" : "text-ink/40"}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="flex gap-2 border-t border-river-100 pt-3">
              <input
                className="input flex-1"
                placeholder="Type a message…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button type="submit" className="btn-primary">Send</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
};

export default Chat;
