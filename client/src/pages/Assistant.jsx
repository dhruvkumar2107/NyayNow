// // import { useState } from "react";

// // export default function Assistant() {
// //   const [messages, setMessages] = useState([
// //     {
// //       role: "assistant",
// //       content: "Hello 👋 I’m your AI Legal Assistant. Ask me any legal question.",
// //     },
// //   ]);
// //   const [input, setInput] = useState("");
// //   const [loading, setLoading] = useState(false);

// //   const sendMessage = async () => {
// //     if (!input.trim()) return;

// //     const userMsg = { role: "user", content: input };
// //     setMessages((prev) => [...prev, userMsg]);
// //     setInput("");
// //     setLoading(true);

// //     // TEMP response (API will be wired later)
// //     setTimeout(() => {
// //       setMessages((prev) => [
// //         ...prev,
// //         {
// //           role: "assistant",
// //           content:
// //             "Thanks for your question. I will analyze it based on Indian law and respond accurately.",
// //         },
// //       ]);
// //       setLoading(false);
// //     }, 1000);
// //   };

// //   return (
// //     <main className="min-h-screen bg-gradient-to-b from-slate-950 to-black text-white">
// //       <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-80px)]">
// //         <h1 className="text-3xl font-bold mb-4 text-indigo-400">
// //           AI Legal Assistant
// //         </h1>

// //         {/* CHAT AREA */}
// //         <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
// //           {messages.map((msg, i) => (
// //             <div
// //               key={i}
// //               className={`max-w-[75%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
// //                 msg.role === "user"
// //                   ? "ml-auto bg-indigo-600 text-white"
// //                   : "bg-slate-800 text-slate-200"
// //               }`}
// //             >
// //               {msg.content}
// //             </div>
// //           ))}

// //           {loading && (
// //             <div className="bg-slate-800 text-slate-400 px-4 py-3 rounded-xl w-fit">
// //               Typing…
// //             </div>
// //           )}
// //         </div>

// //         {/* INPUT */}
// //         <div className="mt-4 flex gap-2">
// //           <input
// //             value={input}
// //             onChange={(e) => setInput(e.target.value)}
// //             placeholder="Ask your legal question..."
// //             className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500"
// //           />
// //           <button
// //             onClick={sendMessage}
// //             className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold"
// //           >
// //             Send
// //           </button>
// //         </div>
// //       </div>
// //     </main>
// //   );
// // }
// import { useState } from "react";
// import axios from "axios";

// export default function Assistant() {
//   const [messages, setMessages] = useState([
//     { role: "assistant", content: "Hello 👋 I’m your AI Legal Assistant." },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userText = input;
//     setMessages((m) => [...m, { role: "user", content: userText }]);
//     setInput("");
//     setLoading(true);

//     try {
//       const res = await axios.post("/api/assistant", {
//         question: userText,
//         language: "English",
//         location: "India",
//       });

//       setMessages((m) => [
//         ...m,
//         { role: "assistant", content: res.data.answer },
//       ]);
//     } catch {
//       setMessages((m) => [
//         ...m,
//         {
//           role: "assistant",
//           content: "⚠️ Unable to reach AI service.",
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-black text-white p-6">
//       <div className="max-w-3xl mx-auto space-y-4">
//         {messages.map((m, i) => (
//           <div key={i} className={m.role === "user" ? "text-right" : ""}>
//             <span className="inline-block bg-slate-800 p-3 rounded-xl">
//               {m.content}
//             </span>
//           </div>
//         ))}
//         {loading && <p>Typing…</p>}
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           className="w-full p-3 bg-slate-900 rounded"
//           placeholder="Ask a legal question…"
//         />
//         <button onClick={sendMessage} className="bg-indigo-600 px-4 py-2 rounded">
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import { useNavigate, Link } from "react-router-dom";
import PaywallModal from "../components/PaywallModal";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast"; // NEW
import { motion, AnimatePresence } from "framer-motion";

// --- TYPEWRITER EFFECT COMPONENT ---
const TypewriterEffect = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current));
        indexRef.current++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 15); // Speed of typing

    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <ReactMarkdown>{displayedText}</ReactMarkdown>;
};

export default function Assistant() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "## Hello, I'm NyayNow. ⚖️\n\nI am India's most advanced legal AI, trained on the **Bharatiya Nyaya Sanhita (BNS)** and **Constitution of India**.\n\n### How can I assist you today?\n- **Draft a Legal Notice** for property dispute\n- **Analyze a Contract** for risks\n- **Explain Section 420** of IPC/BNS",
    isTyping: false // Existing messages are strictly static
  }]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages, loading]);

  // FIX: Prevent background scrolling when chat is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const sendMessage = async (textOverride) => {
    const userText = textOverride || input;
    if (!userText.trim()) return;

    // GUEST LIMIT CHECK
    if (!user) {
      const usage = parseInt(localStorage.getItem("guest_ai_usage") || "0");
      if (usage >= 1) {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="font-bold">Login to continue using AI 🔒</span>
            <span className="text-xs">Guest limit reached (1 free chat)</span>
            <Link
              to="/login"
              onClick={() => toast.dismiss(t.id)}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold text-center mt-1"
            >
              Login Now
            </Link>
          </div>
        ), { duration: 5000, icon: '🛑' });
        return;
      }
      localStorage.setItem("guest_ai_usage", (usage + 1).toString());
    }

    // Add User Message immediately
    setMessages(prev => [...prev, { role: "user", content: userText, isTyping: false }]);
    setInput("");
    setLoading(true);

    try {
      // Build History
      const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));

      const res = await axios.post("/api/ai/assistant", {
        question: userText, history: historyPayload, language: "English", location: "India"
      });

      // Add Assistant Message with Typing Effect enabled
      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.data.answer,
        relatedQuestions: res.data.related_questions || [],
        isTyping: true // Trigger Typewriter
      }]);

    } catch (err) {
      if (err.response?.status === 403) setShowPaywall(true);
      else setMessages(prev => [...prev, { role: "assistant", content: "⚠️ **Connection Error**: I couldn't reach the legal database.", isTyping: false }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-[100dvh] bg-[#050505] text-slate-100 flex flex-col font-sans overflow-hidden relative selection:bg-indigo-500/30">
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* --- AMBIENT BACKGROUND --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse duration-1000"></div>
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] opacity-30 mix-blend-screen"></div>
      </div>

      {/* --- HEADER --- */}
      <header className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-xl border-b border-white/5 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">⚖️</div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white/90">NyayNow AI</h1>
          </div>
        </div>
        <button className="hidden md:flex bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition border border-white/5 hover:border-white/10">
          📜 New Draft
        </button>
      </header>

      {/* --- CHAT AREA --- */}
      <div
        className="flex-1 overflow-y-auto px-4 md:px-32 py-8 space-y-8 z-10 custom-scrollbar scroll-smooth"
        data-lenis-prevent="true" // FIX: Prevent Lenis from hijacking scroll
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              key={i}
              className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* ICON FOR AI */}
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mr-3 mt-1 shrink-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.22-7.52-3.22 3.22 7.52 3.22-7.52z"></path></svg>
                </div>
              )}

              <div className={`max-w-[85%] md:max-w-[70%] space-y-2`}>
                <div className={`p-6 rounded-2xl text-[15px] leading-relaxed shadow-xl backdrop-blur-md border relative overflow-hidden group
                        ${msg.role === "user"
                    ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-sm border-indigo-500/50 shadow-indigo-900/20"
                    : "bg-[#111] text-slate-300 rounded-tl-sm border-white/10 shadow-black/50"
                  }`}>

                  {/* Shimmer Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>

                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-7 prose-headings:text-indigo-300 prose-a:text-indigo-400 prose-code:text-amber-300 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                    {msg.role === "assistant" && msg.isTyping ? (
                      <TypewriterEffect
                        text={msg.content}
                        onComplete={() => {
                          // Disable typing once done to prevent re-typing on re-renders
                          setMessages(prev => {
                            const newMsgs = [...prev];
                            newMsgs[i].isTyping = false;
                            return newMsgs;
                          });
                        }}
                      />
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>
                </div>

                {/* RELATED QUESTIONS CHIPS */}
                {msg.relatedQuestions?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex flex-wrap gap-2 pt-1 pl-1"
                  >
                    {msg.relatedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(q)}
                        className="text-xs font-medium bg-white/5 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-full hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all active:scale-95"
                      >
                        {q} →
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">⚡</div>
            <div className="bg-[#111] px-5 py-3 rounded-2xl rounded-tl-sm border border-white/10 flex gap-2 items-center">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-6 bg-black/60 backdrop-blur-xl border-t border-white/5 z-20 relative">
        <div className="max-w-4xl mx-auto relative cursor-text group">
          {/* Glowing Border Animation */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>

          <div className="relative flex items-center gap-2 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:ring-1 focus-within:ring-indigo-500/50 transition">
            <button className="p-3 text-slate-500 hover:text-indigo-400 rounded-xl hover:bg-white/5 transition"><span className="text-xl">📎</span></button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Ask anything about Indian Law..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 min-h-[44px] max-h-[120px] resize-none py-2.5 custom-scrollbar"
              rows={1}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-3 font-medium tracking-wide flex items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              NyayNow AI v3.0 Pro
            </span>
            <span>•</span>
            <span>Trained on BNS & Constitution</span>
          </p>
        </div>
      </div>
    </main>
  );
}
