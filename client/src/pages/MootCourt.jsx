import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Mic, MicOff, Video, VideoOff, MessageSquare, Gavel, Users, User, ArrowRight } from "lucide-react";

// Connect to backend
const socket = io(import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:4000");

const MootCourt = () => {
    const { user } = useAuth();
    const [sessionActive, setSessionActive] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [argument, setArgument] = useState("");
    const [feedback, setFeedback] = useState(null);

    // Mock function to start session
    const startSession = () => setSessionActive(true);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-400 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
            <Navbar />

            {/* AMBIENT BACKGROUND */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-5 pointer-events-none mix-blend-overlay"></div>

            {!sessionActive ? (
                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 mb-8 animate-pulse shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                        <Gavel size={40} className="text-slate-300" />
                    </div>
                    <h1 className="text-6xl font-serif font-bold text-white mb-6">Virtual Moot Court</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mb-12">
                        Step into the courtroom. Practice your arguments against an AI Opposing Counsel and get real-time feedback on your tone, citation accuracy, and legal logic.
                    </p>
                    <button
                        onClick={startSession}
                        className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-lg transition shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center gap-3 group"
                    >
                        Enter Courtroom <ArrowRight className="group-hover:translate-x-1 transition" />
                    </button>
                    <p className="mt-8 text-xs text-slate-500 uppercase tracking-widest font-bold">VR Headset Compatible • Microphone Required</p>
                </div>
            ) : (
                <div className="relative z-10 h-screen flex flex-col pt-16">
                    {/* TOP BAR */}
                    <div className="h-16 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-xs font-bold uppercase tracking-wider text-red-400">Live Session</span>
                            <span className="text-slate-500 text-xs">|</span>
                            <span className="text-sm font-bold text-slate-300">Case #2024-MC-882: State vs. Sharma</span>
                        </div>
                        <button onClick={() => setSessionActive(false)} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition">
                            End Session
                        </button>
                    </div>

                    <div className="flex-1 grid grid-cols-12 gap-6 p-6">

                        {/* MAIN STAGE (JUDGE & OPPOSING COUNSEL) */}
                        <div className="col-span-9 flex flex-col gap-6">
                            <div className="flex-1 bg-[#0f172a] rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-center group shadow-2xl">
                                {/* AI AVATAR PLACEHOLDER */}
                                <div className="text-center opacity-50 group-hover:opacity-100 transition duration-500">
                                    <div className="w-32 h-32 bg-indigo-500/20 rounded-full mx-auto mb-4 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                                        <User size={60} className="text-indigo-300" />
                                    </div>
                                    <h3 className="text-2xl font-serif font-bold text-white">Hon. AI Justice</h3>
                                    <p className="text-indigo-400 font-mono text-xs mt-2 animate-pulse">Listening to argument...</p>
                                </div>
                            </div>

                            {/* USER CONTROLS & TRANSCRIPT */}
                            <div className="h-64 bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex flex-col shadow-lg">
                                <div className="flex-1 overflow-y-auto mb-4 font-mono text-sm text-slate-400">
                                    <span className="text-indigo-400 font-bold">You:</span> Your Honor, the prosecution's evidence is circumstantial at best...
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 bg-black/50 rounded-xl p-2 border border-white/5 flex items-center px-4 md:px-6 focus-within:border-indigo-500/50 transition">
                                        <input type="text" className="bg-transparent border-none outline-none text-white w-full placeholder-slate-600 font-medium" placeholder="Type your argument or speak..." value={argument} onChange={e => setArgument(e.target.value)} />
                                        <Mic className="text-slate-400 cursor-pointer hover:text-red-500 transition" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SIDEBAR ANALYTICS */}
                        <div className="col-span-3 space-y-6">
                            <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10 h-1/2 shadow-lg">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6 flex items-center gap-2">
                                    <MessageSquare size={14} /> Live Analysis
                                </h4>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                                            <span>Legal Logic</span>
                                            <span className="text-emerald-400">92%</span>
                                        </div>
                                        <div className="w-full bg-white/10 h-1 rounded-full"><div className="bg-emerald-500 h-full w-[92%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                                            <span>Persuasion</span>
                                            <span className="text-amber-400">68%</span>
                                        </div>
                                        <div className="w-full bg-white/10 h-1 rounded-full"><div className="bg-amber-400 h-full w-[68%] rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                                            <span>Voice Modulation</span>
                                            <span className="text-indigo-400">74%</span>
                                        </div>
                                        <div className="w-full bg-white/10 h-1 rounded-full"><div className="bg-indigo-500 h-full w-[74%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10 h-[calc(50%-1.5rem)] shadow-lg">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                                    <Users size={14} /> Spectators
                                </h4>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0f172a]"></div>)}
                                    <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-[#0f172a] flex items-center justify-center text-[10px] font-bold text-slate-400">+12</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default MootCourt;
