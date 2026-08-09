'use client'

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Send, Sparkles, User, Scale, RefreshCw, Lock, Mic, Copy, Check } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Namaste! I am NyayNow's AI Legal Assistant, trained on Indian law (BNS 2024, BNSS, Constitution). Ask me anything about your legal situation and I'll provide information grounded in current Indian law." }
  ]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [language, setLanguage] = useState("English");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 pointer-events-none mesh-gradient" />
      <div className="absolute inset-0 pointer-events-none pattern-grid-fine opacity-20" />
      <div className="absolute inset-0 pointer-events-none pattern-noise" />

      {/* Header */}
      <div className="relative z-10 border-b border-white/5 bg-glass-strong backdrop-blur-xl sticky top-0 z-10 pt-20 pb-4 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
                whileHover={{ scale: 1.1, rotate: 3 }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-xl bg-glass border border-white/10 flex items-center justify-center"
            >
              <Scale size={18} className="text-blue-400" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gradient-blue">AI Legal Assistant</h1>
              <p className="text-xs text-slate-500">Grounded in BNS 2024 · Indian Law</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="input-glossy rounded-lg px-3 py-1.5 text-xs"
            >
              {["English","हिंदी","தமிழ்","తెలుగు","ಕನ್ನಡ","मराठी","বাংলা","ગુજરાતી"].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={reset}
                className="p-2 rounded-lg bg-glass hover:bg-white/10 text-slate-400 hover:text-white transition border border-white/10"
            >
              <RefreshCw size={15} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} onFollowUp={q => { setInput(q); textareaRef.current?.focus(); }} onCopy={copyToClipboard} />
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
            >
              <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0"
              >
                <Sparkles size={14} className="text-blue-400" />
              </motion.div>
              <div className="bg-glass border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  <motion.span
                      className="w-2 h-2 rounded-full bg-blue-400"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span
                      className="w-2 h-2 rounded-full bg-blue-400"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                  />
                  <motion.span
                      className="w-2 h-2 rounded-full bg-blue-400"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10 border-t border-white/5 bg-glass-strong backdrop-blur-xl px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {!user && (
            <p className="text-center text-xs text-slate-500 mb-3">
              <Lock size={10} className="inline mr-1" />
              Guests get 3 free queries/day. <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link> for more.
            </p>
          )}
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Describe your legal situation… (e.g. 'My employer hasn't paid salary for 3 months')"
              rows={2}
              className="flex-1 input-glossy rounded-2xl px-4 py-3 text-sm placeholder-slate-600 resize-none transition"
              style={{ minHeight: '48px', maxHeight: '160px' }}
            />
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition shrink-0 shadow-lg shadow-blue-500/30 btn-glossy-primary"
            >
              <Send size={16} />
            </motion.button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-2">
            AI provides legal information, not advice. Consult a registered lawyer for your specific situation.
          </p>
        </div>
      </div>
    </main>
  );
}

function MessageBubble({ msg, onFollowUp, onCopy }) {
  const isUser = msg.role === "user";
  const isLimit = msg.role === "limit";

  if (isLimit) {
    return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4"
      >
        <div className="inline-flex flex-col items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-6 py-4 max-w-sm card-premium">
          <Lock size={18} className="text-amber-400" />
          <p className="text-sm text-amber-300 font-medium">{msg.content}</p>
          <div className="flex gap-2">
            <Link href="/login" className="px-4 py-1.5 bg-white text-slate-950 text-xs font-bold rounded-full hover:bg-blue-400 hover:text-white transition btn-glossy-gold">Sign In</Link>
            <Link href="/pricing" className="px-4 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-full hover:bg-amber-400 transition btn-glossy-primary">Upgrade</Link>
          </div>
        </div>
      </motion.div>
    );
  }

  if (isUser) {
    return (
      <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-start gap-3 justify-end"
      >
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-600/30 to-blue-500/20 border border-blue-500/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xl card-glossy"
        >
          <p className="text-sm text-slate-200">{msg.content}</p>
        </motion.div>
        <motion.div
            whileHover={{ scale: 1.1, rotate: 3 }}
            transition={{ duration: 0.3 }}
            className="w-8 h-8 rounded-lg bg-glass border border-white/10 flex items-center justify-center shrink-0"
        >
          <User size={14} className="text-slate-400" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3"
    >
      <motion.div
          whileHover={{ scale: 1.1, rotate: -3 }}
          transition={{ duration: 0.3 }}
          className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-1"
      >
        <Sparkles size={14} className="text-blue-400" />
      </motion.div>
      <div className="flex-1 space-y-3 min-w-0">
        <div className="bg-glass border border-white/5 rounded-2xl rounded-tl-sm px-4 py-4 max-w-2xl card-glossy">
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 text-sm leading-relaxed">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCopy(msg.content)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition text-xs"
                title="Copy response"
            >
              <Copy size={12} />
            </motion.button>
            <span className="text-[10px] text-slate-600 font-medium">Response generated</span>
          </div>
        </div>
        {msg.questions?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {msg.questions.slice(0, 3).map((q, i) => (
              <motion.button
                  key={i}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onFollowUp(q)}
                  className="text-xs text-slate-400 hover:text-blue-400 bg-glass hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/20 rounded-xl px-3 py-1.5 transition text-left"
              >
                {q}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
