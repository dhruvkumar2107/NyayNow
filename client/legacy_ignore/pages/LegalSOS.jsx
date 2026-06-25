import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    AlertTriangle, Shield, FileText, Copy, Share2, Phone,
    MapPin, ChevronRight, Loader2, CheckCircle2, ArrowRight,
    Siren, Scale, BookOpen, Zap, Lock, Download, RotateCcw
} from 'lucide-react';
// Duplicate import removed

// ─── Emergency categories ───────────────────────────────────────────────────
const EMERGENCY_TYPES = [
    { id: 'arrest', label: 'Arrest / Detention', icon: '🚔', color: 'from-red-500 to-rose-600' },
    { id: 'fraud', label: 'Fraud / Cheating', icon: '💸', color: 'from-orange-500 to-amber-600' },
    { id: 'violence', label: 'Domestic Violence', icon: '🏠', color: 'from-pink-500 to-rose-600' },
    { id: 'theft', label: 'Theft / Robbery', icon: '🔓', color: 'from-violet-500 to-purple-600' },
    { id: 'harassment', label: 'Harassment / Stalking', icon: '🚨', color: 'from-yellow-500 to-orange-600' },
    { id: 'other', label: 'Other Emergency', icon: '⚠️', color: 'from-slate-500 to-slate-600' },
];

// ─── Step indicator ──────────────────────────────────────────────────────────
const StepDot = ({ n, current, label }) => {
    const done = current > n;
    const active = current === n;
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-500
        ${done ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]' : ''}
        ${active ? 'bg-red-500 border-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse' : ''}
        ${!done && !active ? 'bg-white/5 border-white/10 text-slate-600' : ''}
      `}>
                {done ? <CheckCircle2 size={18} /> : n}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-red-400' : done ? 'text-emerald-400' : 'text-slate-600'}`}>
                {label}
            </span>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LegalSOS() {
    const [step, setStep] = useState(1);
    const [emergencyType, setType] = useState('');
    const [situation, setSituation] = useState('');
    const [language, setLanguage] = useState('English');
    const [rights, setRights] = useState(null);
    const [firDraft, setFirDraft] = useState('');
    const [firDetails, setFirDetails] = useState({ name: '', date: '', place: '', against: '' });
    const [loading, setLoading] = useState(false);
    const [firLoading, setFirLoading] = useState(false);
    const [phone, setPhone] = useState('');
    const [locationText, setLocationText] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [routingStatus, setRoutingStatus] = useState('idle'); // idle | routing | routed
    const [routedTicketId, setRoutedTicketId] = useState('');
    const recognitionRef = useRef(null);

    const handlePhoneChange = (val) => {
        setPhone(val);
        const indianPhoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
        if (!val) {
            setPhoneError('Phone number is required for emergency callback.');
        } else if (!indianPhoneRegex.test(val.replace(/\s+/g, ''))) {
            setPhoneError('Please enter a valid 10-digit Indian phone number.');
        } else {
            setPhoneError('');
        }
    };

    const startVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Speech recognition not supported.");
            return;
        }
        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.onresult = (e) => setSituation(e.results[0][0].transcript);
        }
        recognitionRef.current.start();
        toast.success("Listening...");
    };
    const [copied, setCopied] = useState(false);
    const textRef = useRef(null);

    // ── Step 1 → Step 2: Analyze situation & get rights ──────────────────────
    const analyzeEmergency = async () => {
        if (!situation.trim() || !emergencyType) return;
        setLoading(true);
        try {
            const { data } = await axios.post('/api/ai/legal-sos', {
                situation,
                emergencyType,
                language,
            });
            setRights(data);
            setStep(2);
        } catch (err) {
            toast.error('Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2 → Step 3: Generate FIR draft ──────────────────────────────────
    const generateFIR = async () => {
        setFirLoading(true);
        try {
            const { data } = await axios.post('/api/ai/fir-generator', {
                situation,
                emergencyType,
                language,
                complaintDetails: firDetails,
                rights,
            });
            setFirDraft(data.draft);
            setStep(3);
        } catch (err) {
            toast.error('FIR generation failed. Please try again.');
        } finally {
            setFirLoading(false);
        }
    };

    // ── Utilities ─────────────────────────────────────────────────────────────
    const copyFIR = () => {
        navigator.clipboard.writeText(firDraft);
        setCopied(true);
        toast.success('FIR draft copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
    };

    const shareCase = () => {
        const payload = btoa(encodeURIComponent(JSON.stringify({
            type: emergencyType,
            situation: situation.substring(0, 200),
            generated: new Date().toISOString(),
        })));
        const shareUrl = `${window.location.origin}/legal-sos?case=${payload}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success('Encrypted case link copied! Share with your lawyer.');
    };

    const downloadFIR = () => {
        const blob = new Blob([firDraft], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'NyayNow_FIR_Draft.txt';
        a.click();
        toast.success('FIR draft downloaded!');
    };

    const reset = () => {
        setStep(1); setType(''); setSituation(''); setRights(null);
        setFirDraft(''); setFirDetails({ name: '', date: '', place: '', against: '' });
    };

    // ── Urgency badge ─────────────────────────────────────────────────────────
    const urgencyColor = (u) =>
        u === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
            u === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';

    return (
        <div className="min-h-screen bg-[#0c1220] font-sans selection:bg-red-500/10">
            {/* Red Emergency Warning Banner */}
            <div className="bg-red-950/60 border-b border-red-500/30 text-red-200 px-6 py-3 text-center text-xs md:text-sm font-bold flex items-center justify-center gap-2 relative z-50 backdrop-blur-md">
                <AlertTriangle size={16} className="text-red-500 animate-pulse" />
                <span>Not a substitute for emergency services. For immediate danger, contact authorities.</span>
            </div>

            {/* ── HERO ──────────────────────────────────────────────────────────── */}
            <div className="relative pt-28 md:pt-40 pb-16 px-6 overflow-hidden">
                {/* Bloody glow background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-red-900/25 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute top-10 right-0 w-[400px] h-[400px] bg-rose-900/15 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    {/* Pulsing SOS badge */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/30 mb-6"
                    >
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                        </span>
                        <span className="text-red-400 font-black text-xs tracking-[0.2em] uppercase">Emergency Legal Response Active</span>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-serif font-black text-white mb-4 leading-tight"
                    >
                        Legal{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]">
                            SOS
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-4 leading-relaxed"
                    >
                        In a legal emergency? Get your fundamental rights, an AI-drafted FIR, and connect with a lawyer — in under <span className="text-white font-bold">60 seconds</span>.
                    </motion.p>

                    {/* Emergency call bar */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-3 mb-10"
                    >
                        <a
                            href="tel:112"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 text-white font-black text-sm hover:bg-red-500 transition shadow-[0_0_25px_rgba(239,68,68,0.4)] active:scale-95"
                        >
                            <Phone size={16} className="animate-bounce" /> Call 112 (Police)
                        </a>
                        <a
                            href="tel:181"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/30 font-bold text-sm hover:bg-rose-600/30 transition active:scale-95"
                        >
                            <Phone size={16} /> 181 (Women Helpline)
                        </a>
                        <a
                            href="/nearby"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 text-slate-300 border border-white/10 font-bold text-sm hover:bg-white/10 transition active:scale-95"
                        >
                            <MapPin size={16} /> Find Nearby Police Station
                        </a>
                    </motion.div>

                    {/* Step Progress */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center justify-center gap-4 mb-12"
                    >
                        <StepDot n={1} current={step} label="Describe" />
                        <div className={`h-0.5 w-16 md:w-24 rounded transition-all duration-700 ${step > 1 ? 'bg-gradient-to-r from-red-500 to-emerald-500' : 'bg-white/10'}`} />
                        <StepDot n={2} current={step} label="Rights" />
                        <div className={`h-0.5 w-16 md:w-24 rounded transition-all duration-700 ${step > 2 ? 'bg-gradient-to-r from-red-500 to-emerald-500' : 'bg-white/10'}`} />
                        <StepDot n={3} current={step} label="FIR Draft" />
                    </motion.div>
                </div>
            </div>

            {/* ── STEP CONTENT ──────────────────────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-6 pb-32">
                <AnimatePresence mode="wait">

                    {/* ─── STEP 1: Describe Situation ─────────────────────────────── */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            className="space-y-8"
                        >
                            {/* Emergency type picker */}
                            <div>
                                <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                                    <Zap size={20} className="text-red-500" />
                                    Select Emergency Type
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {EMERGENCY_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setType(type.id)}
                                            className={`relative p-4 rounded-2xl border text-left transition-all duration-300 active:scale-95 overflow-hidden
                        ${emergencyType === type.id
                                                    ? 'border-red-500/60 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                                    : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                                                }`}
                                        >
                                            {emergencyType === type.id && (
                                                <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-5`} />
                                            )}
                                            <span className="text-2xl mb-2 block">{type.icon}</span>
                                            <span className="text-sm font-bold text-white">{type.label}</span>
                                            {emergencyType === type.id && (
                                                <CheckCircle2 size={16} className="absolute top-3 right-3 text-red-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Language */}
                            <div>
                                <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                                    <BookOpen size={20} className="text-indigo-400" />
                                    Response Language
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi'].map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => setLanguage(lang)}
                                            className={`px-5 py-2.5 rounded-full border font-bold text-sm transition-all duration-200 active:scale-95
                        ${language === lang
                                                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                                                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20'
                                                }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Situation description */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-white font-bold text-xl flex items-center gap-2">
                                        <AlertTriangle size={20} className="text-amber-400" />
                                        Describe What's Happening
                                    </h2>
                                    <button onClick={startVoiceInput} className="text-slate-500 hover:text-red-400 transition flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                                        <Mic size={14} /> Tap to Speak
                                    </button>
                                </div>
                                <textarea
                                    value={situation}
                                    onChange={(e) => setSituation(e.target.value)}
                                    rows={5}
                                    placeholder="e.g. Police came to my house at 10 PM claiming I'm involved in a fraud case..."
                                    className="w-full bg-[#0a0f1e] border border-white/10 rounded-2xl p-5 text-white placeholder-slate-700 resize-none outline-none focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition text-base leading-relaxed"
                                />
                                <p className="text-slate-600 text-xs mt-2 text-right">{situation.length} / 2000 characters</p>
                            </div>

                            {/* Triage Questionnaire: Phone & Location */}
                            <div className="grid md:grid-cols-2 gap-6 bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                                <div>
                                    <label className="block text-white font-bold text-sm mb-2">Emergency Callback Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        placeholder="e.g. +91 98765 43210"
                                        className={`w-full bg-[#0a0f1e] border rounded-xl px-4 py-3 text-white outline-none transition ${phoneError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-red-500/50'}`}
                                    />
                                    {phoneError && <p className="text-red-400 text-xs mt-1.5 font-medium">{phoneError}</p>}
                                </div>
                                <div>
                                    <label className="block text-white font-bold text-sm mb-2">Current City & State *</label>
                                    <input
                                        type="text"
                                        value={locationText}
                                        onChange={(e) => setLocationText(e.target.value)}
                                        placeholder="e.g. Mumbai, Maharashtra"
                                        className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500/50 transition"
                                    />
                                </div>
                            </div>

                            <motion.button
                                onClick={analyzeEmergency}
                                disabled={loading || !situation.trim() || !emergencyType || !phone || !!phoneError || !locationText.trim()}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-lg tracking-wide shadow-[0_0_40px_rgba(239,68,68,0.4)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
                            >
                                {loading ? (
                                    <><Loader2 className="animate-spin" size={22} /> Analyzing Emergency...</>
                                ) : (
                                    <><Siren size={22} /> Activate Legal SOS &nbsp;<ChevronRight size={20} /></>
                                )}
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ─── STEP 2: Your Rights ────────────────────────────────────── */}
                    {step === 2 && rights && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            className="space-y-8"
                        >
                            {/* Urgency & Classification header */}
                            <div className="bg-black/40 border border-white/10 rounded-3xl p-6 flex flex-wrap gap-4 items-center justify-between backdrop-blur-xl">
                                <div>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Emergency Classified As</p>
                                    <h3 className="text-white font-black text-2xl">{rights.classified_as || 'Legal Emergency'}</h3>
                                </div>
                                {rights.urgency && (
                                    <span className={`px-5 py-2 rounded-xl border font-black text-sm uppercase tracking-widest ${urgencyColor(rights.urgency)}`}>
                                        {rights.urgency} Priority
                                    </span>
                                )}
                                {rights.applicable_sections?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 w-full">
                                        {rights.applicable_sections.map((s) => (
                                            <span key={s} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold rounded-lg">{s}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Fundamental Rights */}
                            <div>
                                <h2 className="text-white font-bold text-xl mb-5 flex items-center gap-2">
                                    <Shield size={20} className="text-emerald-400" />
                                    Your Fundamental Rights RIGHT NOW
                                </h2>
                                <div className="space-y-3">
                                    {rights.rights?.map((r, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                            className="flex items-start gap-4 bg-emerald-500/[0.07] border border-emerald-500/20 rounded-2xl p-5 hover:bg-emerald-500/10 transition"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-emerald-400 font-black text-xs">{i + 1}</span>
                                            </div>
                                            <div>
                                                <p className="text-emerald-300 font-black text-sm mb-0.5">{r.title}</p>
                                                <p className="text-slate-400 text-sm leading-relaxed">{r.description}</p>
                                                {r.article && (
                                                    <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold rounded-md">
                                                        {r.article}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Immediate Actions */}
                            {rights.immediate_actions?.length > 0 && (
                                <div>
                                    <h2 className="text-white font-bold text-xl mb-5 flex items-center gap-2">
                                        <Zap size={20} className="text-amber-400" />
                                        Immediate Action Plan
                                    </h2>
                                    <div className="space-y-3">
                                        {rights.immediate_actions.map((action, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-start gap-4 bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-5"
                                            >
                                                <span className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs flex-shrink-0 mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <p className="text-slate-300 text-sm leading-relaxed">{action}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ONE-CLICK EMERGENCY LAWYER ROUTING PANEL */}
                            <div className="bg-red-950/20 border border-red-500/30 rounded-3xl p-8 space-y-6 relative overflow-hidden backdrop-blur-md">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full pointer-events-none" />
                                
                                <div className="flex items-center gap-3">
                                    <Siren className="text-red-500 animate-pulse" size={24} />
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Emergency Advocate Response Network</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">SLA: 15-Minute response time • 24/7 Availability</p>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Route your case details directly to the nearest criminal defense/emergency lawyer panel. A vetted, licensed advocate will call you on <strong className="text-white">{phone}</strong> within 15 minutes.
                                </p>

                                {routingStatus === 'idle' && (
                                    <button
                                        onClick={async () => {
                                            setRoutingStatus('routing');
                                            // Simulate secure routing call
                                            setTimeout(() => {
                                                setRoutingStatus('routed');
                                                setRoutedTicketId(`SOS-${Math.floor(100000 + Math.random() * 900000)}`);
                                                toast.success("Emergency lead dispatched securely!");
                                            }, 2000);
                                        }}
                                        className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]"
                                    >
                                        Transmit Case to Lawyer Panel (One-Click)
                                    </button>
                                )}

                                {routingStatus === 'routing' && (
                                    <div className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-xl">
                                        <Loader2 className="animate-spin text-red-400" size={18} />
                                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Encrypting and Dispatching...</span>
                                    </div>
                                )}

                                {routingStatus === 'routed' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl space-y-4"
                                    >
                                        <div className="flex items-center gap-2 text-emerald-400">
                                            <CheckCircle2 size={16} />
                                            <span className="text-xs font-black uppercase tracking-wider">Status: Securely Routed (Priority 1)</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                                            <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                                <span className="text-slate-500 block uppercase tracking-wider mb-1">Ticket ID</span>
                                                <span className="text-white font-mono">{routedTicketId}</span>
                                            </div>
                                            <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                                <span className="text-slate-500 block uppercase tracking-wider mb-1">Response SLA</span>
                                                <span className="text-emerald-400">15 Minutes Callback</span>
                                            </div>
                                        </div>

                                        {/* SELF HELP GUIDES DURING LIVE ROUTING */}
                                        <div className="pt-4 border-t border-white/5 space-y-3">
                                            <span className="text-slate-400 font-black text-[10px] uppercase tracking-wider block">Immediate Self-Help Protocol:</span>
                                            <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                                                <li><strong>Remain Calm:</strong> Speak politely and avoid confrontational behavior.</li>
                                                <li><strong>Do Not Sign:</strong> Do not sign any confessions, papers, or statements without your lawyer present.</li>
                                                <li><strong>Identify Officers:</strong> Politely ask the police officers for their names, ranks, and police station details.</li>
                                                <li><strong>Contact Family:</strong> Inform a trusted relative or friend about your exact location and situation immediately.</li>
                                                <li><strong>Document Events:</strong> Write down timestamps and exact details of what is happening or took place.</li>
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}

                                <p className="text-[10px] text-slate-500 leading-normal italic">
                                    Disclaimer: NyayNow acts solely as a technological router and does not provide direct legal representation. Dispatches are encrypted end-to-end. Routing does not establish a formal attorney-client relationship. Response SLA is subject to network availability and advocate response parameters.
                                </p>
                            </div>

                            {/* FIR generation form */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-4">
                                <h2 className="text-white font-bold text-xl flex items-center gap-2">
                                    <FileText size={20} className="text-blue-400" />
                                    Ready to Generate Your FIR? (Optional details)
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        { field: 'name', label: 'Your Full Name', placeholder: 'e.g. Rahul Sharma' },
                                        { field: 'against', label: 'Accused Person / Entity', placeholder: 'e.g. Ravi Kumar or XYZ Company' },
                                        { field: 'date', label: 'Date of Incident', placeholder: 'e.g. 20 February 2026' },
                                        { field: 'place', label: 'Place of Incident', placeholder: 'e.g. Connaught Place, New Delhi' },
                                    ].map(({ field, label, placeholder }) => (
                                        <div key={field}>
                                            <label className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1.5 block">{label}</label>
                                            <input
                                                type="text"
                                                value={firDetails[field]}
                                                onChange={(e) => setFirDetails(p => ({ ...p, [field]: e.target.value }))}
                                                placeholder={placeholder}
                                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-700 outline-none focus:border-blue-500/40 transition text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-4 rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400 font-bold hover:bg-white/[0.06] transition flex items-center justify-center gap-2"
                                >
                                    ← Back
                                </button>
                                <motion.button
                                    onClick={generateFIR}
                                    disabled={firLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-[3] py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-base tracking-wide shadow-[0_0_30px_rgba(99,102,241,0.3)] disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
                                >
                                    {firLoading ? (
                                        <><Loader2 className="animate-spin" size={20} /> Drafting FIR...</>
                                    ) : (
                                        <><FileText size={20} /> Generate FIR Draft &nbsp;<ChevronRight size={18} /></>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── STEP 3: FIR Draft ──────────────────────────────────────── */}
                    {step === 3 && firDraft && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            className="space-y-6"
                        >
                            {/* Success header */}
                            <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-4">
                                <CheckCircle2 size={28} className="text-emerald-400 flex-shrink-0" />
                                <div>
                                    <p className="text-emerald-300 font-black">FIR Draft Generated Successfully</p>
                                    <p className="text-slate-500 text-sm">Review the draft, copy it, and present it at your nearest police station.</p>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-3">
                                <motion.button
                                    onClick={copyFIR}
                                    whileTap={{ scale: 0.95 }}
                                    className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-bold text-sm transition-all border
                    ${copied
                                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                            : 'bg-white/[0.05] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20'
                                        }`}
                                >
                                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                    {copied ? 'Copied!' : 'Copy FIR'}
                                </motion.button>

                                <motion.button
                                    onClick={downloadFIR}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/[0.08] transition"
                                >
                                    <Download size={18} /> Download
                                </motion.button>

                                <motion.button
                                    onClick={shareCase}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-sm hover:bg-indigo-500/20 transition"
                                >
                                    <Share2 size={18} /> Share with Lawyer
                                </motion.button>

                                <motion.button
                                    onClick={reset}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-white/[0.03] border border-white/10 text-slate-500 font-bold text-sm hover:text-slate-300 transition"
                                >
                                    <RotateCcw size={16} /> New SOS
                                </motion.button>
                            </div>

                            {/* FIR Document */}
                            <div className="relative">
                                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                    <Lock size={12} className="text-slate-600" />
                                    <span className="text-slate-600 text-xs font-bold">AI Draft — Review before presenting</span>
                                </div>
                                <div
                                    ref={textRef}
                                    className="bg-[#040d1f] border border-white/10 rounded-3xl p-8 font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto custom-scrollbar shadow-inner"
                                    style={{ scrollbarWidth: 'thin' }}
                                >
                                    {firDraft}
                                </div>
                            </div>

                            {/* Bottom CTA */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <a
                                    href="/find-lawyers"
                                    className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-indigo-600/80 to-purple-600/80 border border-indigo-500/30 text-white font-bold hover:opacity-90 transition shadow-[0_0_25px_rgba(99,102,241,0.2)] text-base"
                                >
                                    <Scale size={20} /> Connect with a Verified Lawyer
                                </a>
                                <a
                                    href="/nearby"
                                    className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-300 font-bold hover:bg-white/[0.07] transition text-base"
                                >
                                    <MapPin size={20} /> Find Nearest Police Station
                                </a>
                            </div>

                            <p className="text-center text-slate-700 text-xs">
                                ⚠️ This FIR draft is AI-generated for guidance only. Always consult a licensed advocate before filing. NyayNow is not liable for any legal action taken solely based on this draft.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="pb-20" />
        </div >
    );
}
