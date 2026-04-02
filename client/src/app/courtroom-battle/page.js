'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Gavel, Scale, Shield, ChevronRight, Loader2,
    BookOpen, Mic2, Star, RotateCcw, Sparkles
} from 'lucide-react';

// ── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text, speed = 18, active = false) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    useEffect(() => {
        if (!active || !text) return;
        setDisplayed('');
        setDone(false);
        let i = 0;
        const id = setInterval(() => {
            setDisplayed(text.slice(0, i + 1));
            i++;
            if (i >= text.length) { clearInterval(id); setDone(true); }
        }, speed);
        return () => clearInterval(id);
    }, [text, active, speed]);
    return { displayed, done };
}

// ── Speaker config ───────────────────────────────────────────────────────────
const SPEAKERS = {
    plaintiff: {
        color: 'from-amber-500 to-yellow-600',
        glow: 'rgba(245,158,11,0.35)',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/5',
        tag: 'bg-amber-500/20 text-amber-300',
        avatar: '👨‍⚖️',
        side: 'PROSECUTION',
    },
    defense: {
        color: 'from-blue-500 to-indigo-600',
        glow: 'rgba(99,102,241,0.35)',
        border: 'border-indigo-500/30',
        bg: 'bg-indigo-500/5',
        tag: 'bg-indigo-500/20 text-indigo-300',
        avatar: '👩‍⚖️',
        side: 'DEFENSE',
    },
    judge: {
        color: 'from-rose-500 to-red-600',
        glow: 'rgba(239,68,68,0.35)',
        border: 'border-red-500/40',
        bg: 'bg-red-500/5',
        tag: 'bg-red-500/20 text-red-300',
        avatar: '⚖️',
        side: 'BENCH',
    },
};

// ── RoundCard: renders one courtroom round with typewriter ───────────────────
function RoundCard({ round, index, isActive, onDone }) {
    const cfg = SPEAKERS[round.speaker] || SPEAKERS.judge;
    const { displayed, done } = useTypewriter(round.speech, 15, isActive);
    
    // STABILITY FIX: Ensure onDone is only called once when 'done' transitions to true
    const hasTriggeredDone = useRef(false);
    useEffect(() => {
        if (done && !hasTriggeredDone.current) {
            hasTriggeredDone.current = true;
            if (onDone) onDone();
        }
    }, [done, onDone]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`relative rounded-3xl border ${cfg.border} ${cfg.bg} overflow-hidden`}
            style={{ boxShadow: isActive ? `0 0 40px ${cfg.glow}` : undefined }}
        >
            {/* Animated spotlight when active */}
            {isActive && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ background: `radial-gradient(ellipse at 30% 20%, ${cfg.glow}, transparent 70%)` }}
                />
            )}

            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-2xl shadow-lg`}>
                        {cfg.avatar}
                    </div>
                    <div>
                        <p className="text-white font-black text-sm">{round.name}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block ${cfg.tag}`}>
                            {cfg.side}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Round {index + 1}</p>
                    <p className="text-white font-bold text-xs mt-0.5">{round.type}</p>
                </div>
            </div>

            {/* Speech area */}
            <div className="px-6 py-5">
                <div className="text-slate-300 leading-relaxed text-[15px] font-medium whitespace-pre-wrap">
                    {isActive ? displayed : round.speech}
                    {isActive && !done && (
                        <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                            className="inline-block ml-0.5 w-0.5 h-4 bg-white align-middle"
                        />
                    )}
                </div>

                {/* Cited sections */}
                {round.sections?.length > 0 && (!isActive || done) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {round.sections.map((s, i) => (
                            <span key={i} className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-slate-400 text-[11px] font-bold rounded-lg">
                                {s}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Active pulse bar */}
            {isActive && !done && (
                <motion.div
                    className={`h-0.5 bg-gradient-to-r ${cfg.color}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: round.speech.length * 0.015 }}
                    style={{ transformOrigin: 'left' }}
                />
            )}
        </motion.div>
    );
}

// ── VerdictReveal ────────────────────────────────────────────────────────────
function VerdictReveal({ verdict }) {
    const [show, setShow] = useState(false);
    useEffect(() => { const t = setTimeout(() => setShow(true), 500); return () => clearTimeout(t); }, []);
    if (!verdict) return null;
    const plaintiff = verdict.win_probability_plaintiff ?? 50;
    const defense = verdict.win_probability_defense ?? 50;
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, type: 'spring' }}
                    className="relative rounded-[2rem] overflow-hidden border border-white/10"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d1a] to-[#020617]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.2),_transparent_70%)]" />

                    <div className="relative z-10 p-8 md:p-12">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-center mb-8"
                        >
                            <motion.div
                                animate={{ rotate: [-10, 10, -10, 10, 0] }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="text-6xl mb-4"
                            >
                                ⚖️
                            </motion.div>
                            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-2">Final Judgment</p>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight">
                                {verdict.ruling}
                            </h2>
                            <p className="text-slate-400 text-sm">— Hon. Justice R.K. Krishnamurthy</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mb-8"
                        >
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                <span className="text-amber-400">Plaintiff — {plaintiff}%</span>
                                <span className="text-indigo-400">{defense}% — Defense</span>
                            </div>
                            <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-amber-500 to-indigo-500"
                                    initial={{ width: '50%' }}
                                    animate={{ width: `${plaintiff}%` }}
                                    transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
                                />
                            </div>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-5 mb-6">
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Star size={12} className="text-amber-400" /> Judge's Summary
                                </p>
                                <p className="text-slate-300 text-sm leading-relaxed">{verdict.judge_summary}</p>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Scale size={12} className="text-indigo-400" /> Deciding Factor
                                </p>
                                <p className="text-slate-300 text-sm leading-relaxed">{verdict.deciding_factor}</p>
                            </div>
                        </div>

                        {verdict.key_precedents?.length > 0 && (
                            <div className="mb-6">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <BookOpen size={12} className="text-emerald-400" /> Key Precedents Cited
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {verdict.key_precedents.map((p, i) => (
                                        <span key={i} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest rounded-xl">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {verdict.final_order && (
                            <div className="border border-white/10 bg-white/5 rounded-2xl p-6">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Gavel size={12} className="text-violet-400" /> Final Court Order
                                </p>
                                <p className="text-white font-bold text-sm leading-relaxed">{verdict.final_order}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CourtroomBattle() {
    const [phase, setPhase] = useState('input'); // input | loading | trial | verdict
    const [caseData, setCaseData] = useState({
        caseTitle: '',
        caseDescription: '',
        caseType: 'Civil',
        plaintiffSide: '',
        defenseSide: '',
    });
    const [result, setResult] = useState(null);
    const [activeRound, setActiveRound] = useState(-1);
    const [shownRounds, setShownRounds] = useState([]);
    const bottomRef = useRef(null);
    const recognitionRef = useRef(null);

    const startVoiceInput = (field) => {
        if (typeof window === 'undefined') return;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Speech recognition not supported in this browser.");
            return;
        }
        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
        }

        recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results).map(r => r[0].transcript).join("");
            setCaseData(prev => ({ ...prev, [field]: transcript }));
        };

        recognitionRef.current.onerror = (err) => {
            console.error("Speech error:", err);
            toast.error("Voice input failed.");
        };

        recognitionRef.current.start();
        toast.success("Listening...");
    };

    // Progressive round reveal
    useEffect(() => {
        if (phase !== 'trial' || !result) return;
        if (shownRounds.length === 0) {
            setActiveRound(0);
            setShownRounds([0]);
        }
    }, [phase, result, shownRounds.length]);

    // STABILITY FIX: useCallback to prevent infinite effect triggers in RoundCard
    const handleRoundDone = useCallback((index) => {
        if (!result) return;
        if (index + 1 < result.rounds.length) {
            setTimeout(() => {
                setActiveRound(index + 1);
                setShownRounds(prev => {
                    // Check to prevent duplicate indices
                    if (prev.includes(index + 1)) return prev;
                    return [...prev, index + 1];
                });
                bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 800);
        } else {
            // All rounds done — show verdict
            setTimeout(() => {
                setPhase('verdict');
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 1200);
        }
    }, [result]);

    const submitCase = async () => {
        if (!caseData.caseDescription.trim()) return;
        setPhase('loading');
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
            const { data } = await axios.post(`${apiUrl}/ai/courtroom-battle`, caseData);
            setResult(data);
            setPhase('trial');
            setShownRounds([]);
            setActiveRound(-1);
        } catch (err) {
            console.error("Court Battle Error:", err);
            setPhase('input');
            toast.error("Could not reach the High Court. Please try again.");
        }
    };

    const reset = () => {
        setPhase('input'); setResult(null);
        setActiveRound(-1); setShownRounds([]);
        setCaseData({ caseTitle: '', caseDescription: '', caseType: 'Civil', plaintiffSide: '', defenseSide: '' });
    };

    const CASE_TYPES = ['Civil', 'Criminal', 'Property', 'Family', 'Consumer', 'Corporate'];

    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-blue-500/10 relative overflow-hidden flex flex-col">
            <Navbar />

            <main className="flex-1 relative z-10 pt-32 pb-32">
                <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.1),_transparent_70%)] pointer-events-none" />

                <div className="max-w-4xl mx-auto px-6 relative">
                    <AnimatePresence mode="wait">

                        {/* PHASE: INPUT */}
                        {phase === 'input' && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >
                                <div className="text-center mb-16">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                                    >
                                        <Sparkles size={12} /> Neural Trial Simulation Engine
                                    </motion.div>
                                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6">
                                        Nyay<span className="text-blue-500">Court.</span>
                                    </h1>
                                    <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                                        Witness a full trial simulation where 3 AI legal agents argue your case facts against each other.
                                    </p>
                                </div>

                                <div className="p-10 rounded-[48px] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl space-y-8">
                                    <div>
                                        <label className="block text-white font-black text-[10px] uppercase tracking-[0.4em] mb-4">Case Category</label>
                                        <div className="flex flex-wrap gap-2">
                                            {CASE_TYPES.map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setCaseData(p => ({ ...p, caseType: t }))}
                                                    className={`px-6 py-3 rounded-2xl border font-bold text-xs transition-all tracking-widest uppercase
                                ${caseData.caseType === t
                                                            ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20'
                                                            : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                                                        }`}
                                                >{t}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-white font-black text-[10px] uppercase tracking-[0.4em]">Case Facts & Context</label>
                                            <button onClick={() => startVoiceInput('caseDescription')} className="text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                                                <Mic2 size={12} /> Voice Entry
                                            </button>
                                        </div>
                                        <textarea
                                            value={caseData.caseDescription}
                                            onChange={e => setCaseData(p => ({ ...p, caseDescription: e.target.value }))}
                                            rows={6}
                                            placeholder="Describe the legal situation in detail..."
                                            className="w-full bg-white/5 border border-white/5 rounded-[32px] px-8 py-6 text-white placeholder-slate-700 outline-none focus:border-blue-500/30 transition text-lg font-medium leading-relaxed"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-amber-500/50 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Prosecution Position</label>
                                            <textarea
                                                rows={3}
                                                value={caseData.plaintiffSide}
                                                onChange={e => setCaseData(p => ({ ...p, plaintiffSide: e.target.value }))}
                                                placeholder="What is the demand?"
                                                className="w-full bg-white/5 border border-amber-500/10 rounded-2xl px-6 py-4 text-white placeholder-slate-800 outline-none focus:border-amber-500/30 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-blue-500/50 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Defense Position</label>
                                            <textarea
                                                rows={3}
                                                value={caseData.defenseSide}
                                                onChange={e => setCaseData(p => ({ ...p, defenseSide: e.target.value }))}
                                                placeholder="What is the opposition?"
                                                className="w-full bg-white/5 border border-blue-500/10 rounded-2xl px-6 py-4 text-white placeholder-slate-800 outline-none focus:border-blue-500/30 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={submitCase}
                                        disabled={!caseData.caseDescription.trim()}
                                        className="w-full py-6 rounded-[32px] bg-white text-slate-950 font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-blue-600 hover:text-white transition-all disabled:opacity-20 flex items-center justify-center gap-4"
                                    >
                                        <Gavel size={20} /> Initialize AI Trial <ChevronRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* PHASE: LOADING */}
                        {phase === 'loading' && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-40 text-center"
                            >
                                <div className="w-20 h-20 rounded-full border-t-2 border-blue-500 animate-spin mb-10" />
                                <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Convening the High Court</h2>
                                <p className="text-slate-500 font-medium">Three AI legal agents are examining your context...</p>
                            </motion.div>
                        )}

                        {/* PHASE: TRIAL / VERDICT */}
                        {(phase === 'trial' || phase === 'verdict') && result && (
                            <motion.div
                                key="trial"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-10"
                            >
                                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-[32px] px-8 py-6 backdrop-blur-3xl">
                                    <div>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Live Simulation</p>
                                        <h2 className="text-white font-bold text-xl tracking-tight">{result.case_title}</h2>
                                    </div>
                                    <button onClick={reset} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all">
                                        <RotateCcw size={20} />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {shownRounds.map((idx) => (
                                        <RoundCard
                                            key={idx}
                                            round={result.rounds[idx]}
                                            index={idx}
                                            isActive={activeRound === idx}
                                            onDone={() => handleRoundDone(idx)}
                                        />
                                    ))}
                                </div>

                                {phase === 'verdict' && result.verdict && (
                                    <VerdictReveal verdict={result.verdict} />
                                )}

                                <div ref={bottomRef} className="h-20" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
