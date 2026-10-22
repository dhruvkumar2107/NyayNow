"use client"

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, ShieldAlert, ArrowRight, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { askAssistant } from "../api";
import UpgradeModal from "./UpgradeModal";

const GREETING = {
    role: "assistant",
    content: "Namaste. I can help you understand a legal issue and prepare questions for an advocate. I provide AI-generated information, not legal advice. How can I help today?",
};

const STARTER_QUESTIONS = [
    "My employer hasn't paid my salary for three months",
    "Police refused to register my FIR. What can I do?",
    "My landlord will not return my security deposit",
];

const LANGUAGE_NAMES = {
    en: "English",
    hi: "हिन्दी",
    ta: "தமிழ்",
    te: "తెలుగు",
    kn: "ಕನ್ನಡ",
    mr: "मराठी",
    bn: "বাংলা",
    gu: "ગુજરાતી",
    pa: "ਪੰਜਾਬੀ",
    ml: "മലയാളം",
    or: "ଓଡ଼ିଆ",
    as: "অসমীয়া",
    ur: "اردو",
    sa: "संस्कृतम्",
};

const HIDDEN_PREFIXES = [
    "/assistant",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/setup-profile",
    "/verification-pending",
    "/lawyer/dashboard",
    "/client/dashboard",
    "/admin",
    "/meet",
    "/video-call",
    "/messages",
    "/payment",
];

function readActiveCase() {
    try {
        const storedCase = localStorage.getItem("nyaynow_active_case");
        return storedCase ? JSON.parse(storedCase) : null;
    } catch {
        return null;
    }
}

export default function AIAssistant() {
    const { user } = useAuth();
    const { language } = useLanguage();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([GREETING]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const [usage, setUsage] = useState(null);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const isHidden = HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

    useEffect(() => {
        if (isHidden) setIsOpen(false);
    }, [isHidden]);

    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (event) => {
            if (event.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", handleEscape);
        const focusTimer = setTimeout(() => inputRef.current?.focus(), 150);
        return () => {
            window.removeEventListener("keydown", handleEscape);
            clearTimeout(focusTimer);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping, isOpen]);

    const sendQuestion = async (rawQuestion, { appendUser = true } = {}) => {
        const question = rawQuestion.trim();
        if (!question || isTyping) return;

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
        setIsTyping(true);

        try {
            const data = await askAssistant({
                question,
                history,
                language: LANGUAGE_NAMES[language] || "English",
                caseContext: readActiveCase(),
            });

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: data.answer || "I could not generate an answer. Please try rephrasing your question.",
                },
            ]);

            if (data.usage) setUsage(data.usage);
        } catch (requestError) {
            const code = requestError.code;
            if (code === "GUEST_LIMIT_REACHED" || code === "LOGIN_REQUIRED") {
                setShowSignupModal(true);
            } else if (
                code === "MONTHLY_LIMIT_REACHED" ||
                code === "PLAN_UPGRADE_REQUIRED" ||
                code === "PREMIUM_REQUIRED"
            ) {
                setIsUpgradeModalOpen(true);
            } else {
                setError({
                    message: requestError.message || "I could not reach the assistant. Please try again.",
                    question,
                });
            }
        } finally {
            setIsTyping(false);
        }
    };

    const handleSubmit = (event) => {
        event?.preventDefault();
        sendQuestion(input);
    };

    const resetChat = () => {
        setMessages([GREETING]);
        setError(null);
        setInput("");
        inputRef.current?.focus();
    };

    const handleConsultLawyer = (aiText) => {
        localStorage.setItem("nyaynow_pending_enquiry", JSON.stringify({
            brief: aiText.slice(0, 1000),
        }));
        setIsOpen(false);
        toast.success("Opening the marketplace with your question prepared.");
        window.location.href = "/marketplace";
    };

    if (isHidden) return null;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.section
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.97 }}
                        id="nyaynow-ai-assistant"
                        role="dialog"
                        aria-label="NyayNow AI legal assistant"
                        className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-8 sm:w-[400px] h-[calc(100dvh-130px)] sm:h-[min(620px,calc(100dvh-130px))] bg-[#020617] border border-white/10 rounded-3xl shadow-2xl flex flex-col z-[9999] overflow-hidden pb-[env(safe-area-inset-bottom)]"
                    >
                        <header className="p-4 bg-gradient-to-r from-indigo-950 via-[#020617] to-indigo-950 flex justify-between items-center text-white border-b border-white/5">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative shrink-0">
                                    <div className="absolute inset-0 bg-gold-400 blur-[10px] opacity-20" />
                                    <Image src="/logo.png" alt="" width={32} height={32} className="relative object-contain" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="font-bold text-sm tracking-tight truncate">NyayChat</h2>
                                    <div className="flex items-center gap-1.5 opacity-80">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                            AI-assisted
                                        </span>
                                        {usage && (
                                            <>
                                                <span className="text-slate-600" aria-hidden="true">·</span>
                                                <span className="text-[10px] text-slate-400">
                                                    {usage.remaining === "unlimited"
                                                        ? "Unlimited"
                                                        : `${usage.remaining} left`}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={resetChat}
                                    className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                                    title="Start a new chat"
                                    aria-label="Start a new chat"
                                >
                                    <Sparkles size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                                    aria-label="Close assistant"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </header>

                        <div className="bg-red-500/10 border-b border-red-500/20 py-2 px-4 text-center text-[10px] text-red-300 font-medium leading-relaxed">
                            AI answers can be incomplete or wrong. Verify citations and consult an advocate before acting.
                        </div>

                        <div
                            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar overscroll-contain"
                            role="log"
                            aria-live="polite"
                            aria-relevant="additions"
                        >
                            {messages.map((message, index) => (
                                <div
                                    key={`${message.role}-${index}`}
                                    className={`flex flex-col gap-1.5 ${message.role === "user" ? "items-end" : "items-start"}`}
                                >
                                    <div
                                        className={`max-w-[88%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap transition-all duration-300 ${
                                            message.role === "user"
                                                ? "bg-indigo-600 text-white rounded-br-sm"
                                                : "bg-white/5 text-slate-200 border border-white/10 rounded-bl-sm"
                                        }`}
                                    >
                                        {message.content}
                                    </div>
                                    {message.role === "assistant" && index > 0 && (
                                        <div className="flex items-center gap-3 px-1">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                                AI-generated · verify independently
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleConsultLawyer(message.content)}
                                                className="text-[9px] font-black text-blue-400 uppercase tracking-wider hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 rounded"
                                            >
                                                Consult a lawyer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {messages.length === 1 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {STARTER_QUESTIONS.map((question) => (
                                        <button
                                            key={question}
                                            type="button"
                                            onClick={() => {
                                                setInput(question);
                                                inputRef.current?.focus();
                                            }}
                                            className="text-left px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/40 text-[11px] text-slate-400 hover:text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {isTyping && (
                                <div className="flex justify-start" aria-label="Assistant is typing">
                                    <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-bl-sm border border-white/10 flex gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/5 p-3">
                                    <p className="text-xs leading-relaxed text-red-200">{error.message}</p>
                                    <button
                                        type="button"
                                        onClick={() => sendQuestion(error.question, { appendUser: false })}
                                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-white hover:text-blue-300"
                                    >
                                        <RotateCcw size={12} />
                                        Try again
                                    </button>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSubmit} className="p-3.5 bg-[#020617] border-t border-white/10">
                            {!user && (
                                <p className="mb-2 text-center text-[10px] text-slate-500">
                                    Guests get 3 free questions per day. Sign in for more.
                                </p>
                            )}
                            <div className="relative">
                                <label htmlFor="floating-assistant-input" className="sr-only">
                                    Ask the AI legal assistant
                                </label>
                                <input
                                    id="floating-assistant-input"
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    placeholder="Describe your legal question…"
                                    maxLength={2000}
                                    className="w-full bg-white/5 text-white text-[13px] rounded-xl pl-4 pr-12 py-3.5 border border-white/10 focus:border-indigo-500/60 outline-none transition placeholder-slate-600"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-30 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300"
                                    aria-label="Send question"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </form>
                    </motion.section>
                )}
            </AnimatePresence>

            <motion.button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 sm:bottom-[calc(2rem+env(safe-area-inset-bottom))] sm:right-8 w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-full shadow-[0_0_24px_rgba(79,70,229,0.5)] flex items-center justify-center text-white z-[9998] border border-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                aria-label={isOpen ? "Close AI legal assistant" : "Open AI legal assistant"}
                aria-expanded={isOpen}
                aria-controls="nyaynow-ai-assistant"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X size={26} />
                        </motion.span>
                    ) : (
                        <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <MessageSquare size={25} fill="currentColor" />
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            <AnimatePresence>
                {showSignupModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-6" role="presentation">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="guest-limit-title"
                            className="bg-[#020617] border border-white/10 p-8 rounded-3xl max-w-md w-full relative overflow-hidden text-center"
                        >
                            <button
                                type="button"
                                onClick={() => setShowSignupModal(false)}
                                className="absolute right-4 top-4 p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5"
                                aria-label="Close sign-up prompt"
                            >
                                <X size={18} />
                            </button>
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6 mx-auto">
                                <ShieldAlert size={24} />
                            </div>
                            <h2 id="guest-limit-title" className="text-2xl font-bold text-white mb-3 tracking-tight">
                                Free questions used
                            </h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                Guests get 3 free questions per day. Create a free account to keep going and save your question history.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={() => { window.location.href = "/register"; }}
                                    className="w-full py-3.5 bg-white text-slate-950 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition"
                                >
                                    Create free account
                                    <ArrowRight size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { window.location.href = "/login"; }}
                                    className="w-full py-3.5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl text-sm hover:bg-white/10 transition"
                                >
                                    Log in
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                feature="AI Queries"
            />
        </>
    );
}
