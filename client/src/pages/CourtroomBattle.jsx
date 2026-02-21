import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    Gavel, Scale, Shield, ChevronRight, Loader2,
    BookOpen, Mic2, Star, RotateCcw, ChevronDown, Sparkles
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
    }, [text, active]);
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
    useEffect(() => { if (done && onDone) onDone(); }, [done]);
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
                <p className="text-slate-300 leading-relaxed text-[15px] font-medium whitespace-pre-wrap">
                    {isActive ? displayed : round.speech}
                    {isActive && !done && (
                        <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                            className="inline-block ml-0.5 w-0.5 h-4 bg-white align-middle"
                        />
                    )}
                </p>

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
                    animate={{ scaleX: [0, 1] }}
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
    const rulingFor = verdict.ruling?.toLowerCase().includes('plaintiff') ? 'plaintiff' : 'defense';
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, type: 'spring' }}
                    className="relative rounded-[2rem] overflow-hidden border border-white/10"
                >
                    {/* Gavel animation */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d1a] to-[#020617]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.2),_transparent_70%)]" />

                    <div className="relative z-10 p-8 md:p-12">
                        {/* VERDICT header */}
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
                            <h2 className="text-5xl md:text-6xl font-serif font-black text-white mb-2">
                                {verdict.ruling}
                            </h2>
                            <p className="text-slate-400 text-sm">— Hon. Justice R.K. Krishnamurthy</p>
                        </motion.div>

                        {/* Probability bars */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mb-8"
                        >
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
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

                        {/* Grid */}
                        <div className="grid md:grid-cols-2 gap-5 mb-6">
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                <p className="text-slate-500 text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Star size={12} className="text-amber-400" /> Judge's Summary
                                </p>
                                <p className="text-slate-300 text-sm leading-relaxed">{verdict.judge_summary}</p>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                <p className="text-slate-500 text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Scale size={12} className="text-indigo-400" /> Deciding Factor
                                </p>
                                <p className="text-slate-300 text-sm leading-relaxed">{verdict.deciding_factor}</p>
                            </div>
                        </div>

                        {/* Precedents */}
                        {verdict.key_precedents?.length > 0 && (
                            <div className="mb-6">
                                <p className="text-slate-500 text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <BookOpen size={12} className="text-emerald-400" /> Key Precedents Cited
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {verdict.key_precedents.map((p, i) => (
                                        <span key={i} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold rounded-xl">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Final Order */}
                        {verdict.final_order && (
                            <div className="border border-white/10 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-2xl p-5">
                                <p className="text-slate-500 text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-2">
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

    // Progressive round reveal
    useEffect(() => {
        if (phase !== 'trial' || !result) return;
        // Show rounds one by one
        if (shownRounds.length === 0) {
            setActiveRound(0);
            setShownRounds([0]);
        }
    }, [phase, result]);

    const handleRoundDone = (index) => {
        if (!result) return;
        if (index + 1 < result.rounds.length) {
            setTimeout(() => {
                setActiveRound(index + 1);
                setShownRounds(prev => [...prev, index + 1]);
                bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 800);
        } else {
            // All rounds done — show verdict
            setTimeout(() => {
                setPhase('verdict');
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 1200);
        }
    };

    const submitCase = async () => {
        if (!caseData.caseDescription.trim()) return;
        setPhase('loading');
        try {
            const { data } = await axios.post('/api/ai/courtroom-battle', caseData);
            setResult(data);
            setPhase('trial');
            setShownRounds([]);
            setActiveRound(-1);
        } catch (err) {
            toast.error('Court session failed. Please try again.');
            setPhase('input');
        }
    };

    const reset = () => {
        setPhase('input'); setResult(null);
        setActiveRound(-1); setShownRounds([]);
        setCaseData({ caseTitle: '', caseDescription: '', caseType: 'Civil', plaintiffSide: '', defenseSide: '' });
    };

    const CASE_TYPES = ['Civil', 'Criminal', 'Property / Real Estate', 'Family / Matrimonial', 'Consumer', 'Constitutional', 'Corporate / Commercial', 'Cyber / IT'];

    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">
            <Navbar />

            {/* ── HERO ─────────────────────────────────────────────────────────── */}
            <div className="relative pt-28 pb-12 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,_rgba(109,40,217,0.25),_transparent_60%)]" />
                <div className="absolute top-10 left-10 w-[600px] h-[400px] bg-violet-900/10 rounded-full blur-[120px]" />
                <div className="absolute top-10 right-0 w-[400px] h-[400px] bg-amber-900/10 rounded-full blur-[120px]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

                {/* Wood-panel top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-800/20 via-amber-600/50 to-amber-800/20" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-violet-500/10 border border-violet-500/25 mb-6"
                    >
                        <Sparkles size={14} className="text-violet-400" />
                        <span className="text-violet-400 font-black text-xs tracking-[0.2em] uppercase">World's First AI Multi-Agent Courtroom</span>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-serif font-black text-white mb-4 leading-[1.05]"
                    >
                        NyayCourt{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
                            Battle
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Three real AI legal minds — Plaintiff Lawyer, Defense Lawyer, and Judge — argue YOUR case against each other.
                        <br />
                        <span className="text-white font-bold">Watch a full AI trial. Get a real verdict. In 60 seconds.</span>
                    </motion.p>

                    {/* 3 persona cards */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center mt-8 mb-2"
                    >
                        {[
                            { avatar: '👨‍⚖️', name: 'Adv. Vikram Anand', role: 'Plaintiff's Counsel', color: 'border - amber - 500 / 30 bg- amber - 500 / 5' },
              { avatar: '⚖️', name: 'Justice R.K. Krishnamurthy', role: 'Presiding Judge', color: 'border-red-500/30 bg-red-500/5' },
                            { avatar: '👩‍⚖️', name: 'Adv. Priya Rathore', role: 'Defense Counsel', color: 'border-indigo-500/30 bg-indigo-500/5' },
                        ].map((p) => (
                            <div key={p.name} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${p.color} text-left`}>
                                <span className="text-3xl">{p.avatar}</span>
                                <div>
                                    <p className="text-white font-bold text-sm">{p.name}</p>
                                    <p className="text-slate-500 text-xs">{p.role}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* ── CONTENT ──────────────────────────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-6 pb-32">
                <AnimatePresence mode="wait">

                    {/* ─── PHASE: INPUT ──────────────────────────────────────────── */}
                    {phase === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Case type */}
                            <div>
                                <label className="block text-white font-bold text-base mb-3 flex items-center gap-2">
                                    <Scale size={18} className="text-violet-400" /> Case Type
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CASE_TYPES.map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setCaseData(p => ({ ...p, caseType: t }))}
                                            className={`px-4 py-2 rounded-xl border font-bold text-sm transition-all active:scale-95
                        ${caseData.caseType === t
                                                    ? 'bg-violet-500/20 border-violet-500/50 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                                                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20'
                                                }`}
                                        >{t}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Case title */}
                            <div>
                                <label className="block text-white font-bold text-base mb-2">Case Title <span className="text-slate-600 font-normal text-sm">(optional)</span></label>
                                <input
                                    type="text"
                                    value={caseData.caseTitle}
                                    onChange={e => setCaseData(p => ({ ...p, caseTitle: e.target.value }))}
                                    placeholder="e.g. Sharma vs. Kumar Builders Pvt. Ltd."
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-700 outline-none focus:border-violet-500/40 transition text-base"
                                />
                            </div>

                            {/* Facts */}
                            <div>
                                <label className="block text-white font-bold text-base mb-2 flex items-center gap-2">
                                    <BookOpen size={18} className="text-amber-400" /> Facts of the Case <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={caseData.caseDescription}
                                    onChange={e => setCaseData(p => ({ ...p, caseDescription: e.target.value }))}
                                    rows={6}
                                    placeholder="Describe everything. Who did what, when, and why you believe you have a legal case. The more details, the better the AI trial will be..."
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-700 resize-none outline-none focus:border-violet-500/40 transition text-base leading-relaxed"
                                />
                            </div>

                            {/* Sides */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-amber-400 font-bold text-sm mb-2">👨‍⚖️ Plaintiff / Your Position</label>
                                    <textarea
                                        rows={3}
                                        value={caseData.plaintiffSide}
                                        onChange={e => setCaseData(p => ({ ...p, plaintiffSide: e.target.value }))}
                                        placeholder="What do you want? What's your legal claim?"
                                        className="w-full bg-white/[0.03] border border-amber-500/20 rounded-xl px-4 py-3 text-white placeholder-slate-700 resize-none outline-none focus:border-amber-500/40 transition text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-indigo-400 font-bold text-sm mb-2">👩‍⚖️ Defense / Opposition's Position</label>
                                    <textarea
                                        rows={3}
                                        value={caseData.defenseSide}
                                        onChange={e => setCaseData(p => ({ ...p, defenseSide: e.target.value }))}
                                        placeholder="What argument might the other side make?"
                                        className="w-full bg-white/[0.03] border border-indigo-500/20 rounded-xl px-4 py-3 text-white placeholder-slate-700 resize-none outline-none focus:border-indigo-500/40 transition text-sm"
                                    />
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
                                <span className="text-amber-400 text-lg mt-0.5">⚡</span>
                                <p className="text-slate-400 text-sm">
                                    This runs <strong className="text-white">5 sequential AI calls</strong> — Plaintiff opens, Defense rebuts, Judge observes, Plaintiff responds, Defense closes, then the AI delivers a verdict. It takes <strong className="text-white">~30–60 seconds</strong>. Please wait.
                                </p>
                            </div>

                            <motion.button
                                onClick={submitCase}
                                disabled={!caseData.caseDescription.trim()}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-black text-xl tracking-wide shadow-[0_0_60px_rgba(139,92,246,0.4)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <Gavel size={26} className="relative z-10" />
                                <span className="relative z-10">⚖️ Begin AI Trial</span>
                                <ChevronRight size={22} className="relative z-10" />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ─── PHASE: LOADING ─────────────────────────────────────────── */}
                    {phase === 'loading' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-32 gap-8"
                        >
                            {/* Animated courtroom icon */}
                            <div className="relative w-32 h-32">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                                    className="absolute inset-0 rounded-full border-2 border-dashed border-violet-500/30"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
                                    className="absolute inset-4 rounded-full border border-amber-500/20"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-5xl">⚖️</span>
                                </div>
                            </div>

                            <div className="text-center">
                                <h2 className="text-2xl font-serif font-bold text-white mb-2">Court is in Session</h2>
                                <p className="text-slate-500">AI advocates are studying your case...</p>
                            </div>

                            {/* Sequential agent activation */}
                            <div className="space-y-3 w-full max-w-sm">
                                {[
                                    { avatar: '👨‍⚖️', name: 'Adv. Vikram Anand', delay: 0 },
                                    { avatar: '👩‍⚖️', name: 'Adv. Priya Rathore', delay: 8 },
                                    { avatar: '⚖️', name: 'Justice Krishnamurthy', delay: 16 },
                                ].map(({ avatar, name, delay }) => (
                                    <motion.div
                                        key={name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: delay * 0.1 }}
                                        className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3"
                                    >
                                        <span className="text-2xl">{avatar}</span>
                                        <div className="flex-1">
                                            <p className="text-slate-300 text-sm font-bold">{name}</p>
                                            <p className="text-slate-600 text-xs">Preparing arguments...</p>
                                        </div>
                                        <Loader2 size={16} className="text-violet-400 animate-spin" />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ─── PHASE: TRIAL ───────────────────────────────────────────── */}
                    {(phase === 'trial' || phase === 'verdict') && result && (
                        <motion.div
                            key="trial"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            {/* Trial header */}
                            <div className="flex items-center justify-between gap-4 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4">
                                <div>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-0.5">Case Before the Court</p>
                                    <h2 className="text-white font-black text-lg">{result.case_title}</h2>
                                    <span className="text-violet-400 text-xs font-bold uppercase tracking-wider">{result.case_type}</span>
                                </div>
                                <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/[0.07] transition">
                                    <RotateCcw size={14} /> New Case
                                </button>
                            </div>

                            {/* VS Bar */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gradient-to-r from-amber-500/30 to-transparent" />
                                <div className="flex items-center gap-4">
                                    <span className="text-amber-400 font-black text-sm">PROSECUTION</span>
                                    <span className="text-slate-600 font-serif text-xl">vs.</span>
                                    <span className="text-indigo-400 font-black text-sm">DEFENSE</span>
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-l from-indigo-500/30 to-transparent" />
                            </div>

                            {/* Rounds */}
                            {shownRounds.map((idx) => (
                                <RoundCard
                                    key={idx}
                                    round={result.rounds[idx]}
                                    index={idx}
                                    isActive={activeRound === idx}
                                    onDone={() => handleRoundDone(idx)}
                                />
                            ))}

                            {/* Loading next round indicator */}
                            {phase === 'trial' && activeRound < result.rounds.length && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-3 text-slate-600 text-sm"
                                >
                                    <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                        ●
                                    </motion.span>
                                    Proceedings continue...
                                </motion.div>
                            )}

                            {/* Verdict */}
                            {phase === 'verdict' && result.verdict && (
                                <VerdictReveal verdict={result.verdict} />
                            )}

                            <div ref={bottomRef} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
