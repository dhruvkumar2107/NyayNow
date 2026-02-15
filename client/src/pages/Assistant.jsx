import { useState, useRef, useEffect } from "react";
import { Copy, ThumbsUp, ThumbsDown, Send, Paperclip, Mic } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Greetings. I am your specialized Legal AI Assistant. I can help you research case laws, draft clauses, or analyze legal documents. How may I accept your brief today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate API call for now, replacing with actual endpoint if available
      // const res = await axios.post("http://localhost:4000/api/ai/chat", { message: input });

      // Mock Response for UI Demo
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: "Based on the *Indian Penal Code (IPC)* and recent Supreme Court judgments, here is an analysis of your query.\n\n### Key Legal Provisions:\n1. **Section 420 IPC**: Cheating and dishonestly inducing delivery of property.\n2. **Section 406 IPC**: Criminal breach of trust.\n\n### Strategic Advice:\nI recommend filing a formal police complaint under these sections. Additionally, you may want to issue a legal notice for recovery of dues. Would you like me to draft a *Legal Notice* for this situation?",
          },
        ]);
        setIsLoading(false);
      }, 1500);

    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden">

      {/* SIDEBAR HISTORY */}
      <aside className="w-80 border-r border-white/5 bg-midnight-950/50 hidden md:flex flex-col">
        <div className="p-6">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-lg shadow-indigo-600/20 group">
            <span className="text-xl">+</span>
            <span className="font-bold text-sm tracking-wide">New Chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Recent Inquiries</p>
          <HistoryItem label="Property Dispute Delhi" active />
          <HistoryItem label="Draft Lease Agreement" />
          <HistoryItem label="IPC 420 Analysis" />
          <HistoryItem label="Divorce Proceedings" />
        </div>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center text-midnight-900 font-bold text-xs">P</div>
            <div>
              <p className="text-sm font-bold text-white">Pro Plan</p>
              <p className="text-[10px] text-gold-500">Unlimited Queries</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">

        {/* HEADER */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-midnight-900/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <h2 className="font-serif text-lg font-bold text-white leading-none">AI Legal Assistant</h2>
              <p className="text-[10px] text-slate-400">Powered by NyayLM-70B</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs font-bold text-slate-500 hover:text-white transition cursor-pointer">
            <span>Export to PDF</span>
            <span>Share</span>
          </div>
        </header>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 scroll-smooth">
          {messages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i}
              className={`flex gap-4 max-w-4xl mx-auto ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === "model" ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white" : "bg-slate-700 text-slate-300"}`}>
                {msg.role === "model" ? "⚖️" : "👤"}
              </div>

              <div className={`flex-1 space-y-2 ${msg.role === "user" ? "text-right" : ""}`}>
                <div className={`inline-block p-5 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-sm"
                  }`}>
                  {msg.role === "model" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>

                {msg.role === "model" && (
                  <div className="flex items-center gap-3 text-slate-500 pl-2">
                    <button className="hover:text-white transition"><Copy size={14} /></button>
                    <button className="hover:text-white transition"><ThumbsUp size={14} /></button>
                    <button className="hover:text-white transition"><ThumbsDown size={14} /></button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-4xl mx-auto">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center shrink-0 animate-pulse">⚖️</div>
              <div className="flex items-center gap-1 h-10">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-6 pb-8 max-w-4xl mx-auto w-full">
          <div className="relative bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden group focus-within:border-indigo-500/50 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Ask a legal question..."
              className="w-full bg-transparent border-none text-white placeholder-slate-500 p-4 pr-32 focus:ring-0 resize-none h-20 scrollbar-hide" // Corrected: text-white and placeholder
              style={{ color: 'white' }}
            />

            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-white/5">
                <Paperclip size={18} />
              </button>
              <button className="p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-white/5">
                <Mic size={18} />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50 disabled:hover:bg-indigo-600"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-3">
            NyayNow AI can make mistakes. Please verify important information with a qualified lawyer.
          </p>
        </div>

      </main>
    </div>
  );
}

function HistoryItem({ label, active }) {
  return (
    <div className={`px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition mb-1 truncate ${active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
      {label}
    </div>
  )
}
