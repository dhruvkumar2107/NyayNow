'use client'

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { askAssistant } from "../../api";
import { Send, Sparkles, User, Scale, RefreshCw, Lock, Copy, RotateCcw } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import UpgradeModal from "../../components/UpgradeModal";

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Namaste. I can help organize a legal question and provide AI-generated information. Responses may be incomplete or out of date; verify any legal claim against an official source and consult an advocate before acting.",
};

const STARTER_QUESTIONS = [
  "My employer hasn't paid my salary for three months",
  "How do I file a consumer complaint for a defective product?",
  "Police refused to register my FIR. What can I do?",
  "My landlord will not return my security deposit",
];

const LANGUAGES = [
  "English",
  "हिन्दी",
  "मराठी",
  "বাংলা",
  "தமிழ்",
  "తెలుగు",
  "ગુજરાતી",
  "ಕನ್ನಡ",
  "മലയാളം",
  "ਪੰਜਾਬੀ",
];

const LIMIT_CODES = new Set([
  "MONTHLY_LIMIT_REACHED",
  "PLAN_UPGRADE_REQUIRED",
  "PREMIUM_REQUIRED",
  "FEATURE_LIMIT_REACHED",
]);

export default function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English");
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, error]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const send = async (rawQuestion = input, { appendUser = true } = {}) => {
    const question = rawQuestion.trim();
    if (!question || loading) return;

    const history = messages
      .filter((message) => message.role === "user" || message.role === "assistant")
      .slice(-6)
      .map(({ role, content }) => ({ role, content }));

    if (!appendUser && history.at(-1)?.role === "user" && history.at(-1)?.content === question) {
      history.pop();
    }

    if (appendUser) {
      setMessages((previous) => [...previous, { role: "user", content: question }]);
    }

    setInput("");
    setError(null);
    setLoading(true);

    try {
      const data = await askAssistant({ question, language, history });
      if (!data?.answer) {
        throw new Error("The assistant returned an empty response. Please try again.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer,
          questions: Array.isArray(data.related_questions) ? data.related_questions : [],
        },
      ]);
      if (data.usage) setUsage(data.usage);
    } catch (requestError) {
      const code = requestError.code;

      if (code === "GUEST_LIMIT_REACHED" || code === "LOGIN_REQUIRED") {
        setMessages((previous) => [
          ...previous,
          {
            role: "limit",
            action: "signin",
            content:
              code === "LOGIN_REQUIRED"
                ? "Please sign in to continue using the AI legal assistant."
                : "You've used your 3 free guest questions for today. Sign in to continue.",
          },
        ]);
      } else if (LIMIT_CODES.has(code) || requestError.status === 403) {
        setMessages((previous) => [
          ...previous,
          {
            role: "limit",
            action: "upgrade",
            content: "You've reached your AI query limit for this plan. Upgrade to continue.",
          },
        ]);
        setIsUpgradeModalOpen(true);
      } else {
        setError({
          message: requestError.message || "Something went wrong. Please try again.",
          question,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const reset = () => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
    setInput("");
    textareaRef.current?.focus();
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy the response");
    }
  };

  return (
    <main className="h-[100dvh] bg-[#000000] text-white flex flex-col overflow-hidden">
      <div className="fixed inset-0 pointer-events-none mesh-gradient" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none pattern-grid-fine opacity-20" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none pattern-noise" aria-hidden="true" />

      <header className="relative z-20 shrink-0 border-b border-white/5 bg-glass-strong backdrop-blur-xl px-4 pt-20 pb-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 rounded-xl bg-glass border border-white/10 flex items-center justify-center shrink-0"
            >
              <Scale size={18} className="text-blue-400" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-gradient-blue truncate">AI Legal Assistant</h1>
              <p className="text-[11px] text-slate-500 truncate">
                AI-generated information · verify independently
                {usage && (
                  <span className="text-slate-600">
                    {" · "}
                    {usage.remaining === "unlimited" ? "Unlimited" : `${usage.remaining} queries left`}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="assistant-language" className="sr-only">Response language</label>
            <select
              id="assistant-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="input-glossy rounded-lg px-2.5 py-2 text-xs max-w-[110px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
            >
              {LANGUAGES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <motion.button
              type="button"
              whileHover={{ scale: 1.08, rotate: 180 }}
              whileTap={{ scale: 0.92 }}
              onClick={reset}
              className="p-2 rounded-lg bg-glass hover:bg-white/10 text-slate-400 hover:text-white transition border border-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
              aria-label="Start a new conversation"
              title="New conversation"
            >
              <RefreshCw size={15} />
            </motion.button>
          </div>
        </div>
      </header>

      <div
        className="relative z-10 flex-1 min-h-0 overflow-y-auto px-4 py-6 overscroll-contain custom-scrollbar"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={loading}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            {messages.map((message, index) => (
              <MessageBubble
                key={`${message.role}-${index}`}
                msg={message}
                onFollowUp={(question) => {
                  setInput(question);
                  textareaRef.current?.focus();
                }}
                onCopy={copyToClipboard}
              />
            ))}
          </AnimatePresence>

          {messages.length === 1 && !loading && (
            <div className="grid gap-2 sm:grid-cols-2">
              {STARTER_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => {
                    setInput(question);
                    textareaRef.current?.focus();
                  }}
                  className="text-left rounded-xl border border-white/5 bg-glass px-3.5 py-3 text-xs leading-relaxed text-slate-400 transition hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
              aria-label="Assistant is typing"
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
                  {[0, 0.15, 0.3].map((delay) => (
                    <motion.span
                      key={delay}
                      className="w-2 h-2 rounded-full bg-blue-400"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="relative z-20 shrink-0 border-t border-white/5 bg-glass-strong backdrop-blur-xl px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="max-w-3xl mx-auto">
          {error && (
            <div role="alert" className="mb-3 flex items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5">
              <p className="text-xs leading-relaxed text-red-200">{error.message}</p>
              <button
                type="button"
                onClick={() => send(error.question, { appendUser: false })}
                className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-white hover:text-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 rounded"
              >
                <RotateCcw size={12} />
                Retry
              </button>
            </div>
          )}

          {!user && (
            <p className="text-center text-[11px] text-slate-500 mb-2">
              <Lock size={10} className="inline mr-1" aria-hidden="true" />
              Guests get 3 free questions per day.{" "}
              <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link>{" "}
              for more.
            </p>
          )}

          <div className="flex gap-3 items-end">
            <label htmlFor="assistant-input" className="sr-only">Ask a legal question</label>
            <textarea
              id="assistant-input"
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKey}
              placeholder="Describe your legal situation (for example, “My employer hasn't paid salary for 3 months”)"
              rows={2}
              maxLength={2000}
              className="flex-1 input-glossy rounded-2xl px-4 py-3 text-sm placeholder-slate-600 resize-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
              style={{ minHeight: "48px", maxHeight: "160px" }}
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition shrink-0 shadow-lg shadow-blue-500/30 btn-glossy-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300"
              aria-label={loading ? "Waiting for a response" : "Send question"}
            >
              <Send size={16} />
            </motion.button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-2">
            AI provides legal information, not advice. Consult a registered advocate for your specific situation.
          </p>
        </div>
      </div>

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        feature="AI queries"
      />
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
        role="status"
      >
        <div className="inline-flex flex-col items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-6 py-4 max-w-sm card-premium">
          <Lock size={18} className="text-amber-400" />
          <p className="text-sm text-amber-300 font-medium">{msg.content}</p>
          <div className="flex gap-2">
            <Link
              href={msg.action === "upgrade" ? "/pricing" : "/login"}
              className="px-4 py-1.5 bg-white text-slate-950 text-xs font-bold rounded-full hover:bg-blue-400 hover:text-white transition btn-glossy-gold"
            >
              {msg.action === "upgrade" ? "View plans" : "Sign in"}
            </Link>
            <Link
              href="/marketplace"
              className="px-4 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-full hover:bg-amber-400 transition btn-glossy-primary"
            >
              Consult an advocate
            </Link>
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
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-blue-600/30 to-blue-500/20 border border-blue-500/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xl card-glossy"
        >
          <p className="text-sm text-slate-200 whitespace-pre-wrap break-words">{msg.content}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.08, rotate: 3 }}
          transition={{ duration: 0.3 }}
          className="w-8 h-8 rounded-lg bg-glass border border-white/10 flex items-center justify-center shrink-0"
          aria-hidden="true"
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
        whileHover={{ scale: 1.08, rotate: -3 }}
        transition={{ duration: 0.3 }}
        className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-1"
        aria-hidden="true"
      >
        <Sparkles size={14} className="text-blue-400" />
      </motion.div>
      <div className="flex-1 space-y-3 min-w-0">
        <div className="bg-glass border border-white/5 rounded-2xl rounded-tl-sm px-4 py-4 max-w-2xl card-glossy">
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 text-sm leading-relaxed break-words">
            <ReactMarkdown
              components={{
                a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => onCopy(msg.content)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
              title="Copy response"
              aria-label="Copy response"
            >
              <Copy size={12} />
            </button>
            <span className="text-[10px] text-slate-600 font-medium">
              AI-generated · verify independently
            </span>
          </div>
        </div>
        {msg.questions?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {msg.questions.slice(0, 3).map((question, index) => (
              <motion.button
                key={`${question}-${index}`}
                type="button"
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onFollowUp(question)}
                className="text-xs text-slate-400 hover:text-blue-400 bg-glass hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/20 rounded-xl px-3 py-1.5 transition text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
              >
                {question}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
