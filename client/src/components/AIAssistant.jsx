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

            const res = await axios.post("/api/ai/assistant", {
                question: input,
                history: messages.slice(-5).map(m => ({ role: m.role, content: m.content }))
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
                        className="fixed bottom-24 right-8 w-96 h-[500px] bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-[9999] overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                    <Sparkles size={16} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">NyayChat AI</h3>
                                    <div className="flex items-center gap-1.5 opacity-80">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                        <span className="text-[10px] font-medium uppercase tracking-wide">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50 custom-scrollbar">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-[#1e293b] text-slate-200 border border-white/5 rounded-bl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-[#1e293b] px-4 py-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-[#0f172a] border-t border-white/10">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask anything about Indian Law..."
                                    className="w-full bg-[#1e293b] text-white text-sm rounded-xl pl-4 pr-12 py-3 border border-white/5 focus:border-indigo-500 outline-none transition placeholder-slate-500"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500 transition"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-slate-600">Powered by NyayNow AI Engine</p>
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
