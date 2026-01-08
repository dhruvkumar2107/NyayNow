import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";

// Connect to Socket.io (Backend URL)
const socket = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:4000");

export default function Messages() {
  const { user } = useAuth();

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
    }
  }, [user]);

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`/api/connections?userId=${user._id || user.id}`);
      setChatList(res.data);
      if (res.data.length > 0) {
        setActiveChat(res.data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch connections", err);
      setLoading(false);
    }
  };

  // 2. Fetch Messages & Join Real-Time Room
  useEffect(() => {
    if (!activeChat || !user) return;

    const fetchMessages = async () => {
      try {
        // Determine IDs based on roles
        const clientId = user.role === 'client' ? (user._id || user.id) : activeChat._id;
        const lawyerId = user.role === 'lawyer' ? (user._id || user.id) : activeChat._id;

        const res = await axios.get("/api/messages", {
          params: { clientId, lawyerId }
        });
        setMessages(res.data);

        // Join unique room for this pair
        const roomName = `${clientId}-${lawyerId}`;
        socket.emit("join_room", roomName);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();

    const handleReceive = (newMessage) => {
      // Only append if it belongs to current active chat
      // Check if the message involves the current activeChat ID
      const isRelated =
        (newMessage.clientId === activeChat._id) ||
        (newMessage.lawyerId === activeChat._id);

      if (isRelated) {
        setMessages((prev) => [...prev, newMessage]);
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

  // 4. Send Message
  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;

    const clientId = user.role === 'client' ? (user._id || user.id) : activeChat._id;
    const lawyerId = user.role === 'lawyer' ? (user._id || user.id) : activeChat._id;

    const tempMsg = {
      sender: user.role, // 'client' or 'lawyer'
      senderId: user._id || user.id,
      text: input,
      clientId,
      lawyerId
    };

    // Optimistic UI update (optional, but let's wait for socket/response for safety)
    setInput("");

    try {
      await axios.post("/api/messages", tempMsg);
    } catch (err) {
      console.error("Send failed", err);
      alert("Failed to send message");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading chats...</div>;

  return (
    <main className="min-h-screen bg-white text-gray-900 flex pt-24 pb-4 px-4 h-screen">
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
                  // msg.senderId might be populated or plain ID
                  const isMe = (msg.senderId === (user._id || user.id)) || (msg.sender === user.role);

                  return (
                    <div
                      key={i}
                      className={`max-w-md px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${isMe
                        ? "bg-blue-600 text-white ml-auto rounded-tr-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                        }`}
                    >
                      {msg.text}
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
    </main>
  );
}
