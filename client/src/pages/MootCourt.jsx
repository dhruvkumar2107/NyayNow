import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import SubscriptionModal from '../components/SubscriptionModal';

const MootCourt = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [micPermission, setMicPermission] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);

    const recognitionRef = useRef(null);

    // Audio Visualizer Simulation
    useEffect(() => {
        let interval;
        if (isListening) {
            interval = setInterval(() => {
                setAudioLevel(Math.random() * 100);
            }, 100);
        } else {
            setAudioLevel(10);
        }
        return () => clearInterval(interval);
    }, [isListening]);

    const handleStart = () => {
        if (user?.plan === 'free') {
            toast.error("Moot Court is a premium feature. Please upgrade.");
            setTimeout(() => navigate("/pricing"), 2000);
            return;
        }
        setStep(2);
    };

    const initializeSpeech = () => {
        if (!('webkitSpeechRecognition' in window)) {
            toast.error("Browser not supported. Use Chrome.");
            return;
        }
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    setTranscript(prev => prev + event.results[i][0].transcript + ' ');
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    };

    const handleConnectMic = () => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
            setMicPermission(true);
            initializeSpeech();
            setTimeout(() => setStep(3), 1500);
        }).catch(() => {
            alert("Microphone access needed for Oral Arguments.");
        });
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
            setTranscript(''); // Clear previous for fresh argument
            setFeedback(null);
        }
    };

    const handleSubmitArgument = async () => {
        if (isListening) recognitionRef.current.stop();
        setIsListening(false);

        if (!transcript.trim()) {
            toast.error("Please speak your argument first.");
            return;
        }

        // Check Free Trial
        if (!checkFreeTrial()) return;

        setLoading(true); // Using analyzing state
        setFeedback(null); // Clear previous feedback

        try {
            // Pass token if exists, otherwise endpoint is optional auth now
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const { data } = await axios.post('https://nyaynow.in/api/ai/moot-court', {
                transcript,
                caseContext: "Criminal Appeal against conviction under Section 302 IPC. Defense arguing self-defense." // Kept as string literal
            }, { headers });

            setFeedback(data);
            speakFeedback(data.judge_remarks); // Auto-speak remarks

            // Mark as used if guest
            if (!token) {
                localStorage.setItem('mootCourtUsed', 'true');
            }

        } catch (err) {
            console.error(err);
            toast.error("Judge is busy. Try again."); // Updated toast message
        } finally {
            setLoading(false); // Using analyzing state
        }
    };

    const speakFeedback = (text) => { // Renamed from speakJudgeResponse
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 0.8; // Deeper voice attempt
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="min-h-screen bg-black font-sans text-white overflow-hidden relative selection:bg-purple-500/30">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>
                <img
                    src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2000&auto=format&fit=crop"
                    className="w-full h-full object-cover opacity-40 scale-105 animate-pan-slow"
                />
            </div>

            <div className="relative z-20 flex flex-col min-h-screen">
                <div className="flex justify-between items-center p-6 border-b border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                        <span className="font-mono text-xs text-red-400 tracking-widest">LIVE SIMULATION // SESSION ID: {Date.now().toString().slice(-6)}</span>
                    </div>
                    <button onClick={() => navigate("/dashboard")} className="text-xs font-bold text-slate-400 hover:text-white transition uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full hover:bg-white/10">
                        Exit Session
                    </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: LOBBY */}
                        {step === 1 && (
                            <motion.div
                                key="lobby"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                                className="text-center max-w-2xl"
                            >
                                <div className="mb-8 relative inline-block">
                                    <div className="absolute inset-0 bg-purple-500 blur-[60px] opacity-40 rounded-full"></div>
                                    <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-900/50 to-black border border-purple-500/50 flex items-center justify-center backdrop-blur-xl shadow-2xl">
                                        <span className="text-5xl">⚖️</span>
                                    </div>
                                </div>
                                <h1 className="text-6xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
                                    Moot Court VR
                                </h1>
                                <p className="text-xl text-slate-400 mb-10 leading-relaxed font-light">
                                    Step into the <span className="text-white font-bold">Virtual High Court</span>.
                                    Practice your arguments against an AI Judge trained on 50 years of case law.
                                </p>
                                <button
                                    onClick={handleStart}
                                    className="group relative px-10 py-5 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Initialize Session <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 2: SETUP */}
                        {step === 2 && (
                            <motion.div
                                key="setup"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -50 }}
                                className="w-full max-w-md bg-black/50 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl"
                            >
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                    <span className="w-1 h-8 bg-purple-500 rounded-full"></span>
                                    System Check
                                </h2>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">🎤</div>
                                            <div>
                                                <p className="font-bold text-sm">Audio Input</p>
                                                <p className="text-xs text-slate-400">Required for Oral Arguments</p>
                                            </div>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${micPermission ? 'bg-green-500 shadow-[0_0_10px_lime]' : 'bg-yellow-500 animate-pulse'}`}></div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConnectMic}
                                    disabled={micPermission}
                                    className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                                    ${micPermission
                                            ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'}`}
                                >
                                    {micPermission ? (
                                        <><span>✓</span> Connected</>
                                    ) : (
                                        "Connect Microphone"
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 3: SIMULATION */}
                        {step === 3 && (
                            <motion.div
                                key="simulation"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full max-w-7xl h-[80vh] flex gap-6"
                            >
                                {/* LEFT: COURTROOM VIEW */}
                                <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                                    <img
                                        src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=2000"
                                        className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80"></div>

                                    {/* HUD Overlay */}
                                    <div className="absolute top-8 left-8 p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                                        <p className="text-[10px] text-purple-400 font-mono mb-1">PRESIDING JUDGE</p>
                                        <p className="font-bold text-lg">Hon. Justice AI System v2.4</p>
                                        <div className="flex gap-1 mt-2">
                                            <div className="h-1 w-8 bg-purple-500 rounded-full"></div>
                                            <div className="h-1 w-2 bg-slate-700 rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Center Focus (Judge Avatar) */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                        <motion.div
                                            animate={loading ? { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] } : {}}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="w-32 h-32 rounded-full border-4 border-purple-500/30 flex items-center justify-center relative bg-black/50 backdrop-blur-sm"
                                        >
                                            {loading && <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-purple-500 animate-spin"></div>}
                                            <span className="text-4xl">👨‍⚖️</span>
                                        </motion.div>

                                        {feedback ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-6 max-w-lg text-center"
                                            >
                                                <div className="bg-black/80 backdrop-blur-xl border border-purple-500/30 p-6 rounded-2xl shadow-2xl">
                                                    <p className="text-xl font-serif italic text-purple-100 mb-4">"{feedback.judge_remarks}"</p>
                                                    <div className="flex gap-4 justify-center">
                                                        <div className="bg-white/10 px-4 py-2 rounded-lg">
                                                            <p className="text-xs text-slate-400">SCORE</p>
                                                            <p className="text-2xl font-bold text-green-400">{feedback.score}/100</p>
                                                        </div>
                                                        <div className="bg-white/10 px-4 py-2 rounded-lg">
                                                            <p className="text-xs text-slate-400">TONE</p>
                                                            <p className="text-xl font-bold text-blue-400">{feedback.emotional_tone}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <p className="mt-6 text-xl font-light text-purple-200 bg-black/50 px-6 py-2 rounded-full backdrop-blur-sm">
                                                {isListening ? "Listening to your argument..." : "Ready. Press Mic to start."}
                                            </p>
                                        )}
                                    </div>

                                    {/* Bottom Controls */}
                                    <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black to-transparent flex items-end justify-between">
                                        <div className="flex-1 max-w-xl">
                                            <p className="text-[10px] text-slate-500 font-mono mb-2">LIVE TRANSCRIPT</p>
                                            <div className="h-24 overflow-y-auto mb-2 text-sm text-slate-300 font-mono bg-black/30 p-2 rounded border border-white/5">
                                                {transcript || "..."}
                                            </div>

                                            {/* Visualizer */}
                                            <div className="h-8 flex items-end gap-1 opacity-80">
                                                {[...Array(30)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-1 bg-purple-500 rounded-full transition-all duration-75"
                                                        style={{ height: `${Math.random() * audioLevel}%`, opacity: Math.random() }}
                                                    ></div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={toggleListening}
                                                className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all ${isListening ? 'bg-red-500 border-red-500 animate-pulse' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
                                            >
                                                {isListening ? "⏹" : "🎤"}
                                            </button>

                                            {!isListening && transcript.length > 10 && (
                                                <button
                                                    onClick={handleSubmitArgument}
                                                    disabled={loading}
                                                    className="px-6 rounded-full bg-purple-600 hover:bg-purple-500 font-bold text-sm shadow-lg shadow-purple-600/20 disabled:opacity-50"
                                                >
                                                    SUBMIT TO JUDGE
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: FEEDBACK PANEL */}
                                {feedback && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="w-80 bg-slate-900 rounded-3xl border border-white/10 p-6 flex flex-col gap-6"
                                    >
                                        <h3 className="text-xl font-bold border-b border-white/10 pb-4">Analysis Report</h3>

                                        <div>
                                            <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Feedback</h4>
                                            <ul className="space-y-3">
                                                {feedback.feedback?.map((point, i) => (
                                                    <li key={i} className="text-sm bg-white/5 p-3 rounded-lg border-l-2 border-purple-500">
                                                        {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <button
                                            onClick={() => { setFeedback(null); setTranscript(''); }}
                                            className="mt-auto w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition"
                                        >
                                            Next Argument
                                        </button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MootCourt;
