import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Smile, Video, MoreVertical, Search, Phone } from "lucide-react";

const socket = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:4000");

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const chatIdParam = searchParams.get("chatId");

  const [chatList, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Connections
  useEffect(() => {
    if (user) {
      fetchConnections();
    } else {
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const fetchConnections = async () => {
    try {
      const id = user._id || user.id;
      if (!id) { setLoading(false); return; }

      const res = await axios.get(`/api/connections?userId=${id}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setChatList(list);

      if (chatIdParam) {
        const target = list.find(c => c._id === chatIdParam);
        if (target) setActiveChat(target);
        else if (list.length > 0) setActiveChat(list[0]);
      } else if (list.length > 0) {
        setActiveChat(list[0]);
      }
    } catch (err) {
      console.error("Failed to fetch connections", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Messages & Join Room
  useEffect(() => {
    if (!activeChat || !user) return;

    const fetchMessages = async () => {
      try {
        const otherUserId = activeChat._id;
        const res = await axios.get(`/api/messages/${otherUserId}`);
        setMessages(res.data);

        const myId = user._id || user.id;
        const roomName = [myId, otherUserId].sort().join("-");
        socket.emit("join_room", roomName);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();

    const handleReceive = (newMessage) => {
      const myId = user._id || user.id;
      const otherUserId = activeChat._id;
      const isRelevant =
        (newMessage.sender._id === otherUserId) ||
        (newMessage.sender === otherUserId) ||
        (newMessage.sender._id === myId) ||
        (newMessage.sender === myId);

      if (isRelevant) {
        setMessages((prev) => {
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

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;

    const recipientId = activeChat._id;
    const content = input;
    const tempMsg = {
      _id: Date.now().toString(),
      sender: { _id: user._id || user.id, name: user.name },
      content: content,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMsg]);
    setInput("");

    try {
      await axios.post("/api/messages/send", { recipientId, content });
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-300 font-bold uppercase tracking-widest text-xs">Establishing Secure Uplink...</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#020617] overflow-hidden flex flex-col font-sans text-slate-400 selection:bg-indigo-500/30">
      <Navbar />

      <div className="flex-1 flex max-w-[1800px] mx-auto w-full pt-20 px-4 pb-4 gap-6 h-[calc(100vh)]">

        {/* SIDEBAR */}
        <aside className="w-96 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 flex flex-col overflow-hidden hidden md:flex shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
            <h2 className="text-xl font-bold text-white mb-4 font-serif">Encrypted Chats</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                placeholder="Search conversations..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {chatList.length === 0 && (
              <div className="text-center p-8 opacity-30 mt-10">
                <span className="text-4xl block mb-4 grayscale">📭</span>
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500">No Active Links</p>
              </div>
            )}

            {chatList.map((chat) => (
              <motion.div
                key={chat._id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveChat(chat)}
                className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 relative group ${activeChat?._id === chat._id
                  ? "bg-indigo-600/20 border border-indigo-500/50 shadow-lg shadow-indigo-600/10"
                  : "hover:bg-white/5 border border-transparent hover:border-white/5"
                  }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner ${activeChat?._id === chat._id ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-400"
                  }`}>
                  {chat.name ? chat.name[0] : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold truncate text-sm ${activeChat?._id === chat._id ? "text-white" : "text-slate-300"}`}>
                    {chat.name}
                  </h4>
                  <p className={`text-xs truncate font-medium ${activeChat?._id === chat._id ? "text-indigo-300" : "text-slate-500"}`}>
                    {chat.role === 'lawyer' ? `⚖️ ${chat.specialization}` : `📍 ${chat.location}`}
                  </p>
                </div>
                {activeChat?._id === chat._id && (
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(129,140,248,0.8)]"></div>
                )}
              </motion.div>
            ))}
          </div>
        </aside>

        {/* MAIN CHAT AREA */}
        <section className="flex-1 bg-[#020617]/50 backdrop-blur-xl rounded-[2rem] border border-white/10 flex flex-col overflow-hidden relative shadow-2xl">

          {activeChat ? (
            <>
              {/* CHAT HEADER */}
              <header className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20 text-xl">
                    {activeChat.name ? activeChat.name[0] : "?"}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg font-serif">{activeChat.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Secure Connection Active</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition border border-white/5">
                    <Phone size={20} />
                  </button>
                  <button
                    onClick={() => {
                      const roomId = `nyay-${Date.now()}`;
                      const link = `${window.location.origin}/meet/${roomId}`;
                      window.open(link, "_blank");
                      setInput(`📞 Join Secure Video Link: ${link}`);
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 border border-indigo-500"
                    title="Start Video Call"
                  >
                    <Video size={20} />
                  </button>
                  <button className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition border border-white/5">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </header>

              {/* MESSAGES LIST */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-30">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-5xl mb-6 grayscale">💬</div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest">Encrypted Channel Ready</p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const senderId = msg.sender?._id || msg.sender;
                  const isMe = senderId === (user._id || user.id);

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={i}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-lg backdrop-blur-md border ${isMe
                        ? "bg-indigo-600 text-white border-indigo-500 rounded-tr-md"
                        : "bg-white/5 text-slate-200 border-white/10 rounded-tl-md"
                        }`}>
                        {msg.content.includes("http") && msg.content.includes("meet/") ? (
                          <div className="flex flex-col gap-2">
                            <span className="font-bold flex items-center gap-2 text-indigo-200"><Video size={14} /> Video Meeting Invite</span>
                            <a href={msg.content.split(": ")[1]} target="_blank" rel="noreferrer" className="underline font-bold text-white hover:text-indigo-200 break-all">
                              Join Now
                            </a>
                          </div>
                        ) : (
                          msg.content
                        )}

                        <div className={`text-[10px] mt-2 opacity-60 text-right font-bold tracking-wider ${isMe ? "text-indigo-200" : "text-slate-500"}`}>
                          {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={scrollRef}></div>
              </div>

              {/* INPUT AREA */}
              <div className="p-6 border-t border-white/5 bg-black/20 backdrop-blur-lg">
                <div className="relative flex items-center gap-3 bg-white/5 p-2 pr-3 rounded-2xl border border-white/10 focus-within:border-indigo-500/50 focus-within:bg-black/40 transition-all shadow-inner">
                  <button className="p-3 text-slate-400 hover:text-white transition rounded-xl hover:bg-white/5"><Paperclip size={20} /></button>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type an encrypted message..."
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 font-medium h-10 px-2"
                  />
                  <button className="p-3 text-slate-400 hover:text-yellow-400 transition rounded-xl hover:bg-white/5"><Smile size={20} /></button>
                  <button
                    onClick={sendMessage}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 border border-indigo-400/20"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>

            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-black/20">
              <div className="w-40 h-40 bg-white/5 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)] mb-8 animate-pulse-slow">
                <span className="text-7xl drop-shadow-2xl">📡</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 font-serif">Secure Command Center</h3>
              <p className="max-w-xs text-center text-sm">Select a secure frequency from the left to establish communication.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
