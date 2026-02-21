import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Zap, MessageCircle, ChevronRight } from "lucide-react";
import axios from "axios";

const SUGGESTED = [
    "What are my rights if a shopkeeper refuses to give a bill?",
    "How do I file a consumer complaint in India?",
    "What is the punishment for domestic violence under IPC?",
    "Can police arrest me without a warrant?",
];

const VoiceAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [response, setResponse] = useState("");
    const [speaking, setSpeaking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const historyEndRef = useRef(null);

    useEffect(() => {
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                const t = Array.from(event.results).map(r => r[0].transcript).join("");
                setTranscript(t);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    useEffect(() => {
        historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    const handleAIResponse = async (text) => {
        if (!text.trim()) return;
        setLoading(true);
        const userMsg = text;
        setHistory(prev => [...prev, { role: "user", text: userMsg }]);
        setTranscript("");

        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.post("/api/ai/assistant", { question: userMsg }, { headers });
            const reply = res.data.answer || "I can connect you with a qualified lawyer for this.";
            setResponse(reply);
            setHistory(prev => [...prev, { role: "ai", text: reply }]);
            speak(reply);
        } catch {
            const fallback = "I'm having trouble reaching the AI right now. Please try again.";
            setResponse(fallback);
            setHistory(prev => [...prev, { role: "ai", text: fallback }]);
            speak(fallback);
        } finally {
            setLoading(false);
        }
    };

    const speak = (text) => {
        if (synthRef.current) {
            synthRef.current.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.onstart = () => setSpeaking(true);
            utterance.onend = () => setSpeaking(false);
            synthRef.current.speak(utterance);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            if (transcript) handleAIResponse(transcript);
        } else {
            setTranscript("");
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const stopSpeaking = () => {
        synthRef.current?.cancel();
        setSpeaking(false);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans selection:bg-indigo-500/30">
            <Navbar />

            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]" />
                <div className="absolute top-3/4 left-1/2 w-[300px] h-[300px] bg-cyan-600/8 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col lg:flex-row pt-20">

                {/* LEFT — ORB + STATUS */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-0">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8"
                    >
                        <Sparkles size={12} /> NyayVoice — AI Legal Assistant
                    </motion.div>

                    {/* Dynamic Title */}
                    <motion.h1
                        key={isListening ? "listening" : speaking ? "speaking" : loading ? "thinking" : "idle"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-center mb-12 leading-tight"
                    >
                        {isListening ? (
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Listening...</span>
                        ) : loading ? (
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Thinking...</span>
                        ) : speaking ? (
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Speaking...</span>
                        ) : (
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Tap to Speak</span>
                        )}
                    </motion.h1>

                    {/* ORB */}
                    <div className="relative mb-10" onClick={toggleListening}>
                        {/* Outer ripple rings */}
                        {isListening && (
                            <>
                                <motion.div
                                    animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                                    className="absolute inset-0 rounded-full border-2 border-indigo-500/60 cursor-pointer"
                                />
                                <motion.div
                                    animate={{ scale: [1, 2.8], opacity: [0.2, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.8, delay: 0.4, ease: "easeOut" }}
                                    className="absolute inset-0 rounded-full border-2 border-indigo-400/30 cursor-pointer"
                                />
                                <motion.div
                                    animate={{ scale: [1, 3.4], opacity: [0.1, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.8, delay: 0.8, ease: "easeOut" }}
                                    className="absolute inset-0 rounded-full border border-indigo-300/20 cursor-pointer"
                                />
                            </>
                        )}

                        {/* Speaking waveform */}
                        {speaking && (
                            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 h-10">
                                {[0.4, 0.7, 1, 0.85, 0.6, 0.9, 0.5].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ scaleY: [h, 1, h] }}
                                        transition={{ repeat: Infinity, duration: 0.5 + i * 0.07, delay: i * 0.08 }}
                                        className="w-1.5 bg-emerald-400 rounded-full"
                                        style={{ height: 32 }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Core ORB */}
                        <motion.div
                            animate={{
                                scale: isListening ? [1, 1.08, 1] : loading ? [1, 1.05, 1] : 1,
                                boxShadow: isListening
                                    ? ["0 0 40px rgba(99,102,241,0.6)", "0 0 70px rgba(99,102,241,0.8)", "0 0 40px rgba(99,102,241,0.6)"]
                                    : speaking
                                        ? ["0 0 40px rgba(16,185,129,0.5)", "0 0 60px rgba(16,185,129,0.7)", "0 0 40px rgba(16,185,129,0.5)"]
                                        : "0 0 30px rgba(99,102,241,0.2)"
                            }}
                            transition={{ repeat: isListening || loading || speaking ? Infinity : 0, duration: 1.5 }}
                            className={`w-44 h-44 rounded-full flex items-center justify-center cursor-pointer relative transition-all duration-500 ${isListening ? 'bg-gradient-to-br from-indigo-500 to-violet-600' :
                                    loading ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                                        speaking ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                                            'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-white/10'
                                }`}
                        >
                            {isListening ? (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                >
                                    <Mic size={56} className="text-white drop-shadow-xl" />
                                </motion.div>
                            ) : loading ? (
                                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : speaking ? (
                                <Volume2 size={56} className="text-white" />
                            ) : (
                                <MicOff size={56} className="text-slate-500" />
                            )}
                        </motion.div>
                    </div>

                    {/* Control buttons */}
                    <div className="flex gap-3 mt-16">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleListening}
                            className={`px-8 py-3.5 font-bold rounded-xl text-sm transition flex items-center gap-2 ${isListening
                                    ? 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/30'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                                }`}
                        >
                            {isListening ? <><MicOff size={16} /> Stop</> : <><Mic size={16} /> Speak</>}
                        </motion.button>

                        {speaking && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={stopSpeaking}
                                className="px-6 py-3.5 font-bold rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 flex items-center gap-2 transition"
                            >
                                <VolumeX size={16} /> Stop Speaking
                            </motion.button>
                        )}
                    </div>

                    {/* Live Transcript */}
                    <AnimatePresence>
                        {transcript && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-8 max-w-md w-full text-center px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md"
                            >
                                <p className="text-indigo-200 text-lg font-serif italic">"{transcript}"</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Suggested Questions */}
                    {history.length === 0 && !isListening && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-10 max-w-md w-full"
                        >
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 text-center mb-3">Try asking</p>
                            <div className="space-y-2">
                                {SUGGESTED.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAIResponse(q)}
                                        className="w-full text-left px-4 py-3 bg-white/3 border border-white/8 hover:bg-white/8 hover:border-indigo-500/30 rounded-xl text-sm text-slate-400 hover:text-white transition flex items-center gap-2 group"
                                    >
                                        <ChevronRight size={14} className="text-indigo-500 group-hover:translate-x-1 transition flex-shrink-0" />
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* RIGHT — CONVERSATION HISTORY */}
                {history.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full lg:w-[420px] border-l border-white/5 bg-[#0a0f1e]/80 backdrop-blur-xl flex flex-col"
                    >
                        <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
                            <MessageCircle size={18} className="text-indigo-400" />
                            <h2 className="font-bold text-white text-sm">Conversation</h2>
                            <span className="ml-auto text-xs text-slate-600">{history.length} messages</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {history.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600/20 border border-emerald-500/20'}`}>
                                        {msg.role === 'user' ? '👤' : '⚖️'}
                                    </div>
                                    <div className={`flex-1 rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/8 text-slate-300 rounded-tl-none'}`}>
                                        <p className={`text-[10px] font-bold uppercase mb-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-emerald-400'}`}>
                                            {msg.role === 'user' ? 'You' : 'NyayVoice AI'}
                                        </p>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center text-sm flex-shrink-0">⚖️</div>
                                    <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={historyEndRef} />
                        </div>

                        <div className="p-4 border-t border-white/5">
                            <button
                                onClick={() => { setHistory([]); setResponse(""); setTranscript(""); }}
                                className="w-full py-3 text-xs font-bold text-slate-500 hover:text-white border border-white/10 rounded-xl hover:bg-white/5 transition"
                            >
                                Clear Conversation
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
        <Footer />
    );
};

export default VoiceAssistant;
