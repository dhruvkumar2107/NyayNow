"use client"
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, User, Anchor } from "lucide-react";
import axios from "axios";

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "system", content: "Hello! I am NyayChat. How can I assist you with your legal queries today?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

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

            setMessages(prev => [...prev, { role: "system", content: aiResponse }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "system", content: "I am currently experiencing high traffic. Please try again in a moment." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-8 w-96 h-[550px] bg-[#020617] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-[9999] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-indigo-900 via-midnight-950 to-indigo-900 flex justify-between items-center text-white border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gold-400 blur-[10px] opacity-20"></div>
                                    <img src="/logo.png" alt="NyayNow Logo" className="w-8 h-8 relative object-contain drop-shadow-[0_0_5px_rgba(212,175,55,0.4)]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-tight">NyayNow AI</h3>
                                    <div className="flex items-center gap-1.5 opacity-80">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
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

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent custom-scrollbar">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-300 ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-600/20'
                                        : 'bg-white/5 text-slate-200 border border-white/10 rounded-bl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
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
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your legal query..."
                                    className="w-full bg-white/5 text-white text-sm rounded-xl pl-4 pr-12 py-3.5 border border-white/10 focus:border-indigo-500/50 outline-none transition placeholder-slate-600 shadow-inner"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isTyping}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-30 transition shadow-lg shadow-indigo-600/20"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                            <div className="flex justify-between items-center mt-3 px-1">
                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                    Secure & Encrypted
                                </p>
                                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">
                                    NyayNow AI 2.5
                                </p>
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
        </>
    );
}
