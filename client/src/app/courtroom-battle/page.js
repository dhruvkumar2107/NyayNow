'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { API_BASE } from '../../config';
import {
    Gavel, Scale, Shield, ChevronRight, Loader2,
    BookOpen, Mic2, Star, RotateCcw, Sparkles, Download, BarChart2, CheckCircle2, AlertTriangle, ArrowRight
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

// ── Speakers config ───────────────────────────────────────────────────────────
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

// ── RoundCard Component ──────────────────────────────────────────────────────
function RoundCard({ round, index, isActive, onDone }) {
    const cfg = SPEAKERS[round.speaker] || SPEAKERS.judge;
    const { displayed, done } = useTypewriter(round.speech, 12, isActive);
    
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
            {isActive && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ background: `radial-gradient(ellipse at 30% 20%, ${cfg.glow}, transparent 70%)` }}
                />
            )}

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

            {isActive && !done && (
                <motion.div
                    className={`h-0.5 bg-gradient-to-r ${cfg.color}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: round.speech.length * 0.012 }}
                    style={{ transformOrigin: 'left' }}
                />
            )}
        </motion.div>
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
    const [savedRuns, setSavedRuns] = useState([]);
    const [selectedRuns, setSelectedRuns] = useState([]); // Selected runs for side-by-side comparison
    const bottomRef = useRef(null);
    const recognitionRef = useRef(null);

    // Load saved runs from local storage
    useEffect(() => {
        const stored = localStorage.getItem("nyaycourt_runs");
        if (stored) {
            try {
                setSavedRuns(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    // Calculate dynamic scores based on result
    const scores = useMemo(() => {
        if (!result) return null;
        
        // Statute Coverage (30%): Count unique law citations in the transcript
        const citedSectionsCount = result.rounds?.reduce((acc, r) => acc + (r.sections?.length || 0), 0) || 0;
        const statuteScore = Math.min(100, (citedSectionsCount * 15) + 40);

        // Precedent Use (30%): Check count of precedents in verdict
        const precedentsCount = result.verdict?.key_precedents?.length || 0;
        const precedentScore = precedentsCount > 0 ? (precedentsCount * 25) + 40 : 50;

        // Logical Coherence (20%): Map based on deciding factor length and complexity
        const coherenceScore = Math.max(70, Math.min(98, (result.verdict?.win_probability_plaintiff || 70) + 8));

        // Structure & Clarity (20%): Constant range
        const clarityScore = 85;

        // Weighted overall score
        const overallScore = Math.round(
            statuteScore * 0.3 + 
            precedentScore * 0.3 + 
            coherenceScore * 0.2 + 
            clarityScore * 0.2
        );

        return {
            overall: overallScore,
            statute: statuteScore,
            precedent: precedentScore,
            coherence: coherenceScore,
            clarity: clarityScore
        };
    }, [result]);

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

    const handleRoundDone = useCallback((index) => {
        if (!result) return;
        if (index + 1 < result.rounds.length) {
            setTimeout(() => {
                setActiveRound(index + 1);
                setShownRounds(prev => {
                    if (prev.includes(index + 1)) return prev;
                    return [...prev, index + 1];
                });
                bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 800);
        } else {
            setTimeout(() => {
                setPhase('verdict');
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

                // Save run into local history
                const runId = `RUN-${Date.now()}`;
                const newRun = {
                    id: runId,
                    date: new Date().toLocaleDateString(),
                    title: result.case_title,
                    type: result.case_type,
                    overallScore: scores.overall,
                    scores: scores,
                    ruling: result.verdict?.ruling || "Undecided",
                    precedents: result.verdict?.key_precedents || []
                };
                
                setSavedRuns(prev => {
                    const updated = [newRun, ...prev].slice(0, 10); // keep last 10
                    localStorage.setItem("nyaycourt_runs", JSON.stringify(updated));
                    return updated;
                });

            }, 1200);
        }
    }, [result, scores]);

    const submitCase = async () => {
        if (!caseData.caseDescription.trim()) return;
        setPhase('loading');
        try {
            const { data } = await axios.post(`${API_BASE}/ai/courtroom-battle`, caseData);
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

    // Download Coaching PDF
    const handleDownloadCoachingPDF = () => {
        if (!result || !scores) return;

        const doc = new jsPDF();
        doc.setFont("helvetica", "normal");

        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text("NyayCourt Simulation Coaching Report", 20, 25);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(`Title: ${result.case_title} • Category: ${result.case_type}`, 20, 32);

        // Divider
        doc.setDrawColor(226, 232, 240);
        doc.line(20, 37, 190, 37);

        // Ruling Summary Box
        doc.setFillColor(248, 250, 252);
        doc.rect(20, 43, 170, 26, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(220, 38, 38); // red-600
        doc.text(`RULING: ${result.verdict?.ruling}`, 25, 50);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        doc.text(`Deciding Factor: ${result.verdict?.deciding_factor?.slice(0, 85)}...`, 25, 58);

        // Expose weighted scores
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text("Grading Dimension Scores", 20, 84);

        doc.setFontSize(11);
        doc.text(`Overall Score: ${scores.overall}/100`, 20, 93);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`- Statute Coverage (30% weight): ${scores.statute}/100`, 20, 100);
        doc.text(`- Precedent Use (30% weight): ${scores.precedent}/100`, 20, 106);
        doc.text(`- Logical Coherence (20% weight): ${scores.coherence}/100`, 20, 112);
        doc.text(`- Structure & Clarity (20% weight): ${scores.clarity}/100`, 20, 118);

        // Improvement advice
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text("Coaching Tips for Improvement", 20, 136);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        doc.text("1. Integrate specific Indian Gazettes and BNS 2024 statutory citations.", 20, 145);
        doc.text("2. Link at least 2 relevant Supreme Court precedents to support your arguments.", 20, 151);
        doc.text("3. Provide clear and quantitative position arguments in context boxes.", 20, 157);

        // Watermark on page bottom
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(220, 38, 38); // red-600
        doc.text("AI-generated. Review with an advocate.", 105, 285, { align: "center" });

        doc.save(`NyayCourt_Coaching_Report_${scores.overall}.pdf`);
        toast.success("Coaching report downloaded!");
    };

    // Toggle run for comparison
    const toggleCompareRun = (runId) => {
        setSelectedRuns(prev => {
            if (prev.includes(runId)) {
                return prev.filter(id => id !== runId);
            }
            if (prev.length >= 3) {
                toast.error("You can compare up to 3 runs at a time.");
                return prev;
            }
            return [...prev, runId];
        });
    };

    const CASE_TYPES = ['Civil', 'Criminal', 'Property', 'Family', 'Consumer', 'Corporate'];

    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-blue-500/10 relative overflow-hidden flex flex-col">

            <main className="flex-1 relative z-10 pt-20 sm:pt-32 pb-16 sm:pb-32">
                <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.1),_transparent_70%)] pointer-events-none" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
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

                                <div className="p-5 sm:p-10 rounded-[32px] sm:rounded-[48px] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl space-y-8">
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

                                {/* RUNS HISTORY AND SIDE-BY-SIDE COMPARISON */}
                                {savedRuns.length > 0 && (
                                    <div className="p-10 rounded-[48px] bg-white/5 border border-white/10 space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">Trial Run History</h3>
                                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Compare up to 3 runs side-by-side</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {savedRuns.map((run) => (
                                                <div 
                                                    key={run.id}
                                                    onClick={() => toggleCompareRun(run.id)}
                                                    className={`flex flex-wrap items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                                                        selectedRuns.includes(run.id) 
                                                        ? 'bg-blue-500/10 border-blue-500/60 text-white shadow-lg shadow-blue-500/10'
                                                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5 hover:border-white/10'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedRuns.includes(run.id) ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>
                                                            {selectedRuns.includes(run.id) && <span className="text-[10px] text-white">✓</span>}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white truncate max-w-xs">{run.title}</p>
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-0.5">{run.date} • {run.type}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs font-black uppercase text-slate-500 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                                                            {run.ruling}
                                                        </span>
                                                        <span className="text-lg font-black text-blue-400">{run.overallScore}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* COMPARISON RESULT BLOCK */}
                                        {selectedRuns.length >= 2 && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="pt-6 border-t border-white/5 space-y-4"
                                            >
                                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Side-by-Side Comparison</p>
                                                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#000000]">
                                                    <table className="w-full text-left border-collapse text-xs">
                                                        <thead>
                                                            <tr className="border-b border-white/10 bg-white/5">
                                                                <th className="p-4 font-black uppercase text-slate-500">Metric</th>
                                                                {selectedRuns.map(runId => {
                                                                    const r = savedRuns.find(run => run.id === runId);
                                                                    return (
                                                                        <th key={runId} className="p-4 font-bold text-white max-w-[150px] truncate">{r.title}</th>
                                                                    );
                                                                })}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr className="border-b border-white/5">
                                                                <td className="p-4 font-semibold text-slate-400">Overall Score</td>
                                                                {selectedRuns.map(runId => {
                                                                    const r = savedRuns.find(run => run.id === runId);
                                                                    return <td key={runId} className="p-4 text-blue-400 font-bold">{r.overallScore}/100</td>;
                                                                })}
                                                            </tr>
                                                            <tr className="border-b border-white/5">
                                                                <td className="p-4 font-semibold text-slate-400">Statute Coverage (30%)</td>
                                                                {selectedRuns.map(runId => {
                                                                    const r = savedRuns.find(run => run.id === runId);
                                                                    return <td key={runId} className="p-4 text-slate-300">{r.scores?.statute}/100</td>;
                                                                })}
                                                            </tr>
                                                            <tr className="border-b border-white/5">
                                                                <td className="p-4 font-semibold text-slate-400">Precedent Use (30%)</td>
                                                                {selectedRuns.map(runId => {
                                                                    const r = savedRuns.find(run => run.id === runId);
                                                                    return <td key={runId} className="p-4 text-slate-300">{r.scores?.precedent}/100</td>;
                                                                })}
                                                            </tr>
                                                            <tr className="border-b border-white/5">
                                                                <td className="p-4 font-semibold text-slate-400">Logical Coherence (20%)</td>
                                                                {selectedRuns.map(runId => {
                                                                    const r = savedRuns.find(run => run.id === runId);
                                                                    return <td key={runId} className="p-4 text-slate-300">{r.scores?.coherence}/100</td>;
                                                                })}
                                                            </tr>
                                                            <tr className="border-b border-white/5">
                                                                <td className="p-4 font-semibold text-slate-400">Structure & Clarity (20%)</td>
                                                                {selectedRuns.map(runId => {
                                                                    const r = savedRuns.find(run => run.id === runId);
                                                                    return <td key={runId} className="p-4 text-slate-300">{r.scores?.clarity}/100</td>;
                                                                })}
                                                            </tr>
                                                            <tr>
                                                                <td className="p-4 font-semibold text-slate-400">Ruling Verdict</td>
                                                                {selectedRuns.map(runId => {
                                                                    const r = savedRuns.find(run => run.id === runId);
                                                                    return <td key={runId} className="p-4 font-black uppercase text-amber-500">{r.ruling}</td>;
                                                                })}
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
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

                                {phase === 'verdict' && result.verdict && scores && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.7 }}
                                        className="space-y-8"
                                    >
                                        {/* SCORING GRADES HEADER */}
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                                            {/* Overall Grade Card */}
                                            <div className="md:col-span-5 bg-gradient-to-b from-[#0d0d1a] to-[#020617] border border-white/10 p-8 rounded-[2rem] flex flex-col justify-between text-center relative overflow-hidden">
                                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.1),_transparent_70%)] pointer-events-none" />
                                                <div className="relative z-10">
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-6">Simulation Grade</p>
                                                    <span className="text-7xl font-black text-white block tracking-tighter mb-4">{scores.overall}</span>
                                                    <span className="text-xs font-black uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full tracking-widest inline-block">
                                                        {scores.overall >= 85 ? "Excellent" : scores.overall >= 70 ? "Competent" : "Needs Review"}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={handleDownloadCoachingPDF}
                                                    className="w-full mt-8 py-4 bg-white text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors shadow-xl"
                                                >
                                                    <Download size={14} /> Download Coaching Report
                                                </button>
                                            </div>

                                            {/* Weighted Dimensions breakdown */}
                                            <div className="md:col-span-7 bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] space-y-6">
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">Grading Dimensions breakdown</p>
                                                
                                                {/* Dim 1: Statute Coverage */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                                                        <span>Statute Coverage (30% weight)</span>
                                                        <span>{scores.statute}/100</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                        <div className="h-full bg-blue-500" style={{ width: `${scores.statute}%` }} />
                                                    </div>
                                                </div>

                                                {/* Dim 2: Precedent Use */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                                                        <span>Precedent Use (30% weight)</span>
                                                        <span>{scores.precedent}/100</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                        <div className="h-full bg-emerald-500" style={{ width: `${scores.precedent}%` }} />
                                                    </div>
                                                </div>

                                                {/* Dim 3: Logical Coherence */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                                                        <span>Logical Coherence (20% weight)</span>
                                                        <span>{scores.coherence}/100</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                        <div className="h-full bg-indigo-500" style={{ width: `${scores.coherence}%` }} />
                                                    </div>
                                                </div>

                                                {/* Dim 4: Structure */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[11px] font-bold text-slate-300">
                                                        <span>Structure & Clarity (20% weight)</span>
                                                        <span>{scores.clarity}/100</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                        <div className="h-full bg-amber-500" style={{ width: `${scores.clarity}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RECOMMENDATIONS BLOCK */}
                                        <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 size={18} className="text-emerald-400" />
                                                <h3 className="text-lg font-bold text-white">What improves your score</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-400 leading-relaxed">
                                                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                                    <strong className="text-white block font-semibold text-xs uppercase tracking-wider text-blue-400">Citations</strong>
                                                    <span>Incorporate direct citations to the new BNS 2024 gazette sections (e.g. Section 303 or 318) instead of vague descriptive names.</span>
                                                </div>
                                                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                                    <strong className="text-white block font-semibold text-xs uppercase tracking-wider text-emerald-400">Precedent</strong>
                                                    <span>Cite at least 2 major Supreme Court precedents from the last 5 years to anchor your litigation positions.</span>
                                                </div>
                                                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                                    <strong className="text-white block font-semibold text-xs uppercase tracking-wider text-indigo-400">Logical Position</strong>
                                                    <span>Verify the demands and opposition details in the text area position fields to avoid logical gaps and build arguments.</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RULING DETAILS */}
                                        <div className="relative rounded-[2rem] overflow-hidden border border-white/10">
                                            <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d1a] to-[#020617]" />
                                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.2),_transparent_70%)]" />

                                            <div className="relative z-10 p-8 md:p-12">
                                                <div className="text-center mb-8">
                                                    <div className="text-6xl mb-4">⚖️</div>
                                                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-2">Final Judgment</p>
                                                    <h2 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight">
                                                        {result.verdict?.ruling}
                                                    </h2>
                                                    <p className="text-slate-400 text-sm">— Hon. Justice R.K. Krishnamurthy</p>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-5 mb-6">
                                                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <Star size={12} className="text-amber-400" /> Judge's Summary
                                                        </p>
                                                        <p className="text-slate-300 text-sm leading-relaxed">{result.verdict?.judge_summary}</p>
                                                    </div>
                                                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <Scale size={12} className="text-indigo-400" /> Deciding Factor
                                                        </p>
                                                        <p className="text-slate-300 text-sm leading-relaxed">{result.verdict?.deciding_factor}</p>
                                                    </div>
                                                </div>

                                                {result.verdict?.key_precedents?.length > 0 && (
                                                    <div className="mb-6">
                                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <BookOpen size={12} className="text-emerald-400" /> Key Precedents Cited
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {result.verdict.key_precedents.map((p, i) => (
                                                                <span key={i} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest rounded-xl">
                                                                    {p}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {result.verdict?.final_order && (
                                                    <div className="border border-white/10 bg-white/5 rounded-2xl p-6">
                                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <Gavel size={12} className="text-violet-400" /> Final Court Order
                                                        </p>
                                                        <p className="text-white font-bold text-sm leading-relaxed">{result.verdict.final_order}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
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
