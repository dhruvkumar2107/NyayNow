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
import { useNavigate } from "react-router-dom";
import PaywallModal from "../components/PaywallModal";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Assistant() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([{
    role: "assistant", // System greeting
    content: `## Hello, I'm NyaySathi. ⚖️\n\nI am India's most advanced legal AI, trained on the **Bharatiya Nyaya Sanhita (BNS)** and **Constitution of India**.\n\n### How can I assist you today?\n- **Draft a Legal Notice** for property dispute\n- **Analyze a Contract** for risks\n- **Explain Section 420** of IPC/BNS`,
  }]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showNoticeForm, setShowNoticeForm] = useState(false);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages, loading]);

  const sendMessage = async (textOverride) => {
    const userText = textOverride || input;
    if (!userText.trim()) return;

    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await axios.post("/api/ai/assistant", {
        question: userText, history: historyPayload, language: "English", location: "India"
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.data.answer,
        relatedQuestions: res.data.related_questions || [],
      }]);
    } catch (err) {
      if (err.response?.status === 403) setShowPaywall(true);
      else setMessages(prev => [...prev, { role: "assistant", content: "⚠️ **Connection Error**: I couldn't reach the legal database." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen bg-[#0f172a] text-white flex flex-col font-sans overflow-hidden relative">
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">⚖️</div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">NyaySathi AI</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-slate-400 font-medium">Online • v2.5-Pro</span>
            </div>
          </div>
        </div>
        <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition border border-white/5">
          📜 New Draft
        </button>
      </header>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-4 md:px-20 py-8 space-y-8 z-10 custom-scrollbar">
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mr-4 mt-1 shrink-0">
                🤖
              </div>
            )}

            <div className={`max-w-[85%] md:max-w-[70%] space-y-2`}>
              <div className={`p-5 rounded-2xl text-[15px] leading-relaxed shadow-lg backdrop-blur-sm border
                 ${msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm border-indigo-500"
                  : "bg-[#1e293b]/60 text-slate-200 rounded-tl-sm border-white/5"
                }`}>
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-7 prose-headings:text-indigo-300 prose-strong:text-indigo-200">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>

              {/* RELATED QUESTIONS */}
              {msg.relatedQuestions?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 pl-1">
                  {msg.relatedQuestions.map((q, idx) => (
                    <button key={idx} onClick={() => sendMessage(q)} className="text-xs bg-indigo-900/30 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-full hover:bg-indigo-900/50 transition">
                      {q} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center text-indigo-400">⚡</div>
            <div className="bg-[#1e293b]/60 px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5 flex gap-2 items-center">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-6 bg-[#0f172a]/90 backdrop-blur-xl border-t border-white/5 z-20">
        <div className="max-w-4xl mx-auto relative cursor-text group">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative flex items-center gap-2 bg-[#1e293b] border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:ring-2 focus-within:ring-indigo-500/50 transition">
            <button className="p-3 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition"><span className="text-xl">📎</span></button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask anything about Indian Law..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 h-10"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none"
            >
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-3">NyaySathi AI can make mistakes. Verify with a lawyer.</p>
        </div>
      </div>
    </main>
  );
}
