"use client"
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, User, Anchor, ShieldAlert, ArrowRight, UserCheck } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function AIAssistant() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "system", content: "Hello! I am NyayChat. How can I assist you with your legal queries today?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Guest counter
    const [guestQueries, setGuestQueries] = useState(0);
    const [showSignupModal, setShowSignupModal] = useState(false);

    useEffect(() => {
        if (!user) {
            const stored = parseInt(localStorage.getItem("nyaynow_guest_queries") || "0");
            setGuestQueries(stored);
        }
    }, [user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Guest check
        if (!user) {
            const stored = parseInt(localStorage.getItem("nyaynow_guest_queries") || "0");
            if (stored >= 2) {
                setShowSignupModal(true);
                toast.error("Free trial query limit reached.");
                return;
            }
            const updated = stored + 1;
            localStorage.setItem("nyaynow_guest_queries", updated.toString());
            setGuestQueries(updated);
        }

        const userMsg = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            
            // Read active case context if available
            let activeCaseContext = null;
            try {
                const storedCase = localStorage.getItem("nyaynow_active_case");
                if (storedCase) activeCaseContext = JSON.parse(storedCase);
            } catch (e) { console.error("Could not parse active case config", e); }

            const res = await axios.post("/api/ai/assistant", {
                question: input,
                history: messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
                caseContext: activeCaseContext
            }, { headers });

            const aiResponse = res.data.answer;

            setMessages(prev => [...prev, { 
                role: "system", 
                content: aiResponse,
                citations: ["BNS 2024"] // default category grounding
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "system", content: "I am currently experiencing high traffic. Please try again in a moment." }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Consult Lawyer Handoff Router
    const handleConsultLawyer = (aiText) => {
        localStorage.setItem("nyaynow_pending_enquiry", JSON.stringify({
            brief: aiText.slice(0, 1000)
        }));
        setIsOpen(false);
        toast.success("Redirecting to Marketplace. Query pre-populated!");
        if (typeof window !== "undefined") window.location.href = "/marketplace";
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-8 w-96 h-[570px] bg-[#020617] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-[9999] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-indigo-900 via-midnight-950 to-indigo-900 flex justify-between items-center text-white border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gold-400 blur-[10px] opacity-20"></div>
                                    <img src="/logo.png" alt="NyayNow Logo" className="w-8 h-8 relative object-contain" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-tight">NyayNow AI</h3>
                                    <div className="flex items-center gap-1.5 opacity-80">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Secure AI</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setMessages([{ role: "system", content: "Hello! I am NyayChat. How can I assist you with your legal queries today?" }])}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white"
                                    title="New Chat"
                                >
                                    <Sparkles size={16} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* STICKY DISCLAIMER BAR */}
                        <div className="bg-[#dc2626]/10 border-b border-[#dc2626]/20 py-2 px-4 text-center text-[9px] text-red-400 font-bold">
                            ⚠️ Grounded in BNS (2024). AI guidance, not legal advice.
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent custom-scrollbar">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm transition-all duration-300 ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white/5 text-slate-200 border border-white/10 rounded-bl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    {msg.role === 'system' && i > 0 && (
                                        <div className="flex items-center gap-2 px-1">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Grounded (BNS 2024)</span>
                                            <button 
                                                onClick={() => handleConsultLawyer(msg.content)}
                                                className="text-[9px] font-black text-blue-400 uppercase tracking-wider hover:underline"
                                            >
                                                Consult Lawyer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-bl-none border border-white/10 flex gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-[#020617] border-t border-white/10">
                            {messages.length <= 1 && (
                                <div className="mb-3 flex flex-wrap gap-1.5">
                                    {["BNS 318 Cheating", "FIR Rights"].map((chip) => (
                                        <button
                                            key={chip}
                                            onClick={() => setInput(chip)}
                                            className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 hover:border-indigo-500/30 text-[10px] text-slate-400 hover:text-white transition-all"
                                        >
                                            {chip}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your legal query..."
                                    className="w-full bg-white/5 text-white text-xs rounded-xl pl-4 pr-12 py-3.5 border border-white/10 focus:border-indigo-500/50 outline-none transition placeholder-slate-600"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isTyping}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-30 transition"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] flex items-center justify-center text-white z-[9998] border border-white/20"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X size={28} />
                        </motion.div>
                    ) : (
                        <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <MessageSquare size={28} fill="currentColor" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* GUEST LIMIT MODAL INTERCEPT */}
            <AnimatePresence>
                {showSignupModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-6">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-[#020617] border border-white/10 p-8 rounded-3xl max-w-md w-full relative overflow-hidden text-center"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6 mx-auto">
                            <ShieldAlert size={24} />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Free Queries Exhausted</h3>
                          <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            You have reached your 2-query free trial limit. Create a free account to continue consulting our legal AI and access advocate portals.
                          </p>
                          <div className="flex flex-col gap-3">
                            <button
                              onClick={() => { setShowSignupModal(false); if (typeof window !== "undefined") window.location.href = "/register"; }}
                              className="w-full py-4 bg-white text-slate-950 font-bold rounded-2xl text-sm flex items-center justify-center gap-2"
                            >
                              Create Free Account
                              <ArrowRight size={16} />
                            </button>
                            <button
                              onClick={() => { setShowSignupModal(false); if (typeof window !== "undefined") window.location.href = "/login"; }}
                              className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl text-sm"
                            >
                              Log In
                            </button>
                          </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
