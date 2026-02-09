import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext'; // NEW
import { Link } from 'react-router-dom'; // NEW

const VoiceAssistant = () => {
    const { user } = useAuth(); // NEW
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('en-IN');

    // Refs
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            toast.error("Browser does not support Voice Recognition. Try Chrome.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true; // Show words as they are spoken
        recognition.lang = language;

        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);
        recognition.onerror = (event) => {
            console.error("Speech Error:", event.error);
            setListening(false);
            if (event.error !== 'no-speech') toast.error("Could not hear you. Please try again.");
        };

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            if (event.results[0].isFinal) handleSend(text);
        };

        recognitionRef.current = recognition;
    }, [language]);

    const toggleListen = () => {
        if (listening) {
            recognitionRef.current.stop();
        } else {
            setTranscript('');
            setResponse('');
            recognitionRef.current.start();
        }
    };

    const handleSend = async (text) => {
        if (!text) return;

        // GUEST LIMIT CHECK
        if (!user) {
            const usage = parseInt(localStorage.getItem("guest_ai_usage") || "0");
            if (usage >= 1) {
                toast((t) => (
                    <div className="flex flex-col gap-2">
                        <span className="font-bold">Login to continue using AI 🔒</span>
                        <span className="text-xs">Guest limit reached (1 free chat)</span>
                        <Link
                            to="/login"
                            onClick={() => toast.dismiss(t.id)}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold text-center mt-1"
                        >
                            Login Now
                        </Link>
                    </div>
                ), { duration: 5000, icon: '🛑' });
                return;
            }
            localStorage.setItem("guest_ai_usage", (usage + 1).toString());
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/ai/assistant', {
                question: text,
                language: language
            }, {
                headers: { Authorization: token ? `Bearer ${token}` : '' }
            });

            const aiText = res.data.answer;
            setResponse(aiText);
            speak(aiText);

        } catch (err) {
            console.error(err);
            toast.error("AI Connection Failed");
            speak("I'm sorry, I'm having trouble connecting to the legal database right now.");
        } finally {
            setLoading(false);
        }
    };

    const speak = (text) => {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[*#]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = language;
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative selection:bg-purple-500/30">
            <Navbar />

            {/* Background Ambience */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">

                {/* STATUS HEADER */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute top-24 uppercase tracking-[0.3em] text-xs font-bold text-blue-300/50"
                >
                    NyayNow Voice Intelligence
                </motion.div>

                {/* THE ORB */}
                <div className="relative mb-12 group cursor-pointer" onClick={toggleListen}>
                    {/* Core */}
                    <motion.div
                        animate={{
                            scale: listening ? [1, 1.2, 1] : 1,
                            filter: listening ? "brightness(1.5) blur(2px)" : "brightness(1) blur(0px)"
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 shadow-[0_0_100px_rgba(79,70,229,0.5)] relative z-20 flex items-center justify-center border border-white/10"
                    >
                        <span className="text-6xl drop-shadow-xl">{listening ? '🎙️' : '🤖'}</span>
                    </motion.div>

                    {/* Ripples */}
                    {listening && (
                        <>
                            <motion.div
                                initial={{ opacity: 0.5, scale: 1 }}
                                animate={{ opacity: 0, scale: 2.5 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                                className="absolute inset-0 rounded-full border border-blue-400/30 z-10"
                            ></motion.div>
                            <motion.div
                                initial={{ opacity: 0.5, scale: 1 }}
                                animate={{ opacity: 0, scale: 3 }}
                                transition={{ repeat: Infinity, duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                className="absolute inset-0 rounded-full border border-purple-400/20 z-10"
                            ></motion.div>
                        </>
                    )}
                </div>

                {/* LANGUAGE PILL */}
                <motion.div whileHover={{ scale: 1.05 }} className="mb-10">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 text-sm text-blue-200 outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer appearance-none text-center font-bold tracking-wide hover:bg-white/10 transition"
                    >
                        <option className="bg-slate-900" value="en-IN">English (India)</option>
                        <option className="bg-slate-900" value="hi-IN">Hindi (हिंदी)</option>
                        <option className="bg-slate-900" value="ta-IN">Tamil (தமிழ்)</option>
                        <option className="bg-slate-900" value="te-IN">Telugu (తెలుగు)</option>
                        <option className="bg-slate-900" value="mr-IN">Marathi (मराठी)</option>
                    </select>
                </motion.div>

                {/* CHAT TRANSCRIPTS */}
                <div className="w-full max-w-2xl space-y-6 text-center min-h-[120px]">
                    <AnimatePresence mode="wait">
                        {!listening && !transcript && !response && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-2xl text-slate-400 font-light"
                            >
                                "Tap the orb and ask me anything legal..."
                            </motion.p>
                        )}

                        {transcript && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="inline-block px-6 py-3 rounded-2xl bg-white/10 border border-white/5 backdrop-blur-lg text-lg text-white font-medium"
                            >
                                "{transcript}"
                            </motion.div>
                        )}

                        {loading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center gap-2 mt-4">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></span>
                            </motion.div>
                        )}

                        {response && !loading && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="mt-8 text-left bg-gradient-to-br from-slate-900/90 to-black/90 p-8 rounded-3xl border border-blue-500/20 shadow-2xl backdrop-blur-xl max-h-[40vh] overflow-y-auto custom-scrollbar"
                            >
                                <div className="flex gap-4 mb-4 items-center border-b border-white/5 pb-4">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm">🧠</div>
                                    <span className="font-bold text-sm text-indigo-300 uppercase tracking-wider">AI Legal Analysis</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg font-light">
                                    {response}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default VoiceAssistant;
