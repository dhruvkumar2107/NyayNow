'use client'

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Send, Sparkles, User, Scale, RefreshCw, Lock } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Namaste! I am NyayNow's AI Legal Assistant, trained on Indian law (BNS 2024, BNSS, Constitution). Ask me anything about your legal situation and I'll provide information grounded in current Indian law." }
  ]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [language, setLanguage] = useState("English");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg = { role: "user", content: q };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.filter(m => m.role !== "system").slice(-6);
      const { data } = await axios.post("/api/ai/assistant", {
        question: q,
        language,
        history,
      });

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.answer, questions: data.related_questions },
      ]);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        const code = err.response?.data?.code;
        if (code === "GUEST_LIMIT_REACHED") {
          setMessages(prev => [...prev, { role: "limit", content: "You've used your 3 free guest queries. Sign in for 5 free queries per day." }]);
        } else {
          setMessages(prev => [...prev, { role: "limit", content: "Daily query limit reached. Upgrade to Pro for unlimited queries." }]);
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const reset = () => {
    setMessages([{ role: "assistant", content: "New conversation started. What legal question can I help you with?" }]);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0a0f1e]/80 backdrop-blur-xl sticky top-0 z-10 pt-20 pb-4 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Scale size={18} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AI Legal Assistant</h1>
              <p className="text-xs text-slate-500">Grounded in BNS 2024 · Indian Law</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none"
            >
              {["English","हिंदी","தமிழ்","తెలుగు","ಕನ್ನಡ","मराठी","বাংলা","ગુજરાતી"].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <button onClick={reset} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onFollowUp={q => { setInput(q); }} />
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-blue-400" />
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/5 bg-[#0a0f1e]/80 backdrop-blur-xl px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {!user && (
            <p className="text-center text-xs text-slate-500 mb-3">
              <Lock size={10} className="inline mr-1" />
              Guests get 3 free queries/day. <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link> for more.
            </p>
          )}
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Describe your legal situation… (e.g. 'My employer hasn't paid salary for 3 months')"
              rows={2}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/40 resize-none transition"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-2">
            AI provides legal information, not advice. Consult a registered lawyer for your specific situation.
          </p>
        </div>
      </div>
    </main>
  );
}

function MessageBubble({ msg, onFollowUp }) {
  const isUser = msg.role === "user";
  const isLimit = msg.role === "limit";

  if (isLimit) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex flex-col items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-6 py-4 max-w-sm">
          <Lock size={18} className="text-amber-400" />
          <p className="text-sm text-amber-300 font-medium">{msg.content}</p>
          <div className="flex gap-2">
            <Link href="/login" className="px-4 py-1.5 bg-white text-slate-950 text-xs font-bold rounded-full hover:bg-blue-400 hover:text-white transition">Sign In</Link>
            <Link href="/pricing" className="px-4 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-full hover:bg-amber-400 transition">Upgrade</Link>
          </div>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex items-start gap-3 justify-end">
        <div className="bg-blue-600/20 border border-blue-500/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xl">
          <p className="text-sm text-slate-200">{msg.content}</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <User size={14} className="text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-1">
        <Sparkles size={14} className="text-blue-400" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-4 max-w-2xl">
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 text-sm leading-relaxed">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        </div>
        {msg.questions?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {msg.questions.slice(0, 3).map((q, i) => (
              <button
                key={i}
                onClick={() => onFollowUp(q)}
                className="text-xs text-slate-400 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/20 rounded-xl px-3 py-1.5 transition text-left"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
