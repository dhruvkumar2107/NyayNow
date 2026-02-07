import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import { useSearchParams } from "react-router-dom"; // IMPORT

// Connect to Socket.io (Backend URL)
const socket = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:4000");

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams(); // HOOK
  const chatIdParam = searchParams.get("chatId"); // GET PARAM

  const [chatList, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Real Connections (Clients or Lawyers)
  useEffect(() => {
    if (user) {
      fetchConnections();
    } else {
      // If user is not yet available, we might want to wait or stop loading if it takes too long
      const timer = setTimeout(() => setLoading(false), 3000); // 3s fallback
      return () => clearTimeout(timer);
    }
  }, [user]);

  const fetchConnections = async () => {
    try {
      const id = user._id || user.id;

      // Safety check: if ID is somehow still missing, stop loading
      if (!id) {
        setLoading(false);
        return;
      }

      const res = await axios.get(`/api/connections?userId=${id}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setChatList(list);

      // AUTO-SELECT LOGIC
      if (chatIdParam) {
        const target = list.find(c => c._id === chatIdParam);
        if (target) {
          setActiveChat(target);
        } else {
          // If not found in list (maybe new connection?), try to fetch explicitly or just default
          // For now, if not in list, we can't easily message without a 'room' setup logic
          // But normally 'Message' button is only enabled if status='active', so they SHOULD be in list.
          // Fallback if not found:
          if (list.length > 0) setActiveChat(list[0]);
        }
      } else if (list.length > 0) {
        setActiveChat(list[0]);
      }

    } catch (err) {
      console.error("Failed to fetch connections", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Messages & Join Real-Time Room (Refactored)
  useEffect(() => {
    if (!activeChat || !user) return;

    const fetchMessages = async () => {
      try {
        const otherUserId = activeChat._id;
        const res = await axios.get(`/api/messages/${otherUserId}`);
        setMessages(res.data);

        // Join room: Sorted ID pair ensures both join SAME room
        const myId = user._id || user.id;
        const roomName = [myId, otherUserId].sort().join("-");
        socket.emit("join_room", roomName);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();

    const handleReceive = (newMessage) => {
      // Logic to check if message belongs to current chat
      // The backend 'receive_message' payload should ideally be the message object
      // We check if the sender or recipient matches the activeChat
      // But simpler: just check conversationId if we had it, or check sender/recipient IDs

      const myId = user._id || user.id;
      const otherUserId = activeChat._id;

      // If message is from the person I'm chatting with, OR I sent it (multi-device sync)
      const isRelevant =
        (newMessage.sender._id === otherUserId) ||
        (newMessage.sender === otherUserId) ||
        (newMessage.sender._id === myId) ||
        (newMessage.sender === myId);

      if (isRelevant) {
        setMessages((prev) => {
          // Prevent duplicates incase of optimistic UI + socket race
          if (prev.some(m => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
      }
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [activeChat, user]);

  // 3. Auto Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Send Message (Refactored)
  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;

    const recipientId = activeChat._id;
    const content = input;

    // Optimistic UI
    const tempMsg = {
      _id: Date.now().toString(), // Temp ID
      sender: { _id: user._id || user.id, name: user.name }, // Mock populated sender
      content: content,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMsg]);
    setInput("");

    try {
      await axios.post("/api/messages/send", { recipientId, content });
      // The socket event 'receive_message' will likely fire back from server.
      // We might get a duplicate if we don't handle ID collisions, but for MVP this is fine.
      // Ideally, we replace the tempMsg with real one, but appending is safer for now.
    } catch (err) {
      console.error("Send failed", err);
      alert("Failed to send message");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading chats...</div>;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-white text-gray-900 flex pb-4 px-4 h-[calc(100vh-72px)]">
      <div className="flex-1 max-w-[1128px] mx-auto flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">

        {/* SIDEBAR */}
        <aside className="w-80 border-r border-gray-200 p-4 bg-gray-50 flex flex-col hidden md:flex">
          <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">
            Messages
          </h2>

          <div className="space-y-2 overflow-y-auto flex-1">
            {chatList.length === 0 && (
              <div className="text-gray-400 text-sm text-center mt-10">
                No connections yet.<br />
                {user?.role === 'client' ? "Find a lawyer to connect!" : "Wait for client requests."}
              </div>
            )}
            {chatList.map((chat) => (
              <div
                key={chat._id}
                onClick={() => setActiveChat(chat)}
                className={`p-4 rounded-xl cursor-pointer transition flex flex-col gap-1 ${activeChat?._id === chat._id
                  ? "bg-blue-50 border border-blue-100 shadow-sm"
                  : "hover:bg-gray-100 border border-transparent"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    {chat.name ? chat.name[0] : "?"}
                  </div>
                  <div>
                    <p className={`font-semibold ${activeChat?._id === chat._id ? "text-blue-700" : "text-gray-900"}`}>
                      {chat.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {chat.role === 'lawyer' ? chat.specialization : chat.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* CHAT AREA */}
        <section className="flex-1 flex flex-col bg-white">
          {activeChat ? (
            <>
              {/* HEADER */}
              <header className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                    {activeChat.name ? activeChat.name[0] : "?"}
                  </div>
                  {activeChat.name}
                </h3>
                <button
                  onClick={() => {
                    const roomId = `nyay-${Date.now()}`;
                    const link = `${window.location.origin}/meet/${roomId}`;
                    window.open(link, "_blank");
                    setInput(`📞 Join Video Meeting: ${link}`);
                    setTimeout(() => sendMessage(), 100);
                  }}
                  className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                >
                  📹 Video Call
                </button>
              </header>

              {/* MESSAGES */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-10">
                    Start the conversation with {activeChat.name}!
                  </div>
                )}

                {messages.map((msg, i) => {
                  // Check if 'I' am the sender
                  const senderId = msg.sender?._id || msg.sender; // Handle populated or raw ID
                  const isMe = senderId === (user._id || user.id);

                  return (
                    <div
                      key={i}
                      className={`max-w-md px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${isMe
                        ? "bg-blue-600 text-white ml-auto rounded-tr-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                        }`}
                    >
                      {msg.content}
                      {msg.createdAt && <div className={`text-[10px] mt-1 ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>}
                    </div>
                  );
                })}
                <div ref={scrollRef}></div>
              </div>

              {/* INPUT */}
              <div className="p-4 border-t border-gray-100 flex gap-3 bg-white">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-200"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4">
              <span className="text-4xl">👋</span>
              <p>Select a connection to start chatting</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
