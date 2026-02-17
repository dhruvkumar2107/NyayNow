import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const DevilsAdvocate = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [argument, setArgument] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChallenge = async () => {
        if (!argument) return;
        setLoading(true);
        setAnalysis(null);

        try {
            const res = await axios.post('/api/ai/devils-advocate', { argument });
            // Artificial delay for dramatic effect
            setTimeout(() => {
                setAnalysis(res.data);
                toast.error("Objection Overruled!", { icon: "🔨", style: { background: '#fff', color: '#B91C1C', border: '1px solid #FECACA' } });
                setLoading(false);
            }, 2000);
        } catch (err) {
            console.error(err);
            toast.error("Simulation Failed");
            setLoading(false);
        }
    };

    if (user && !['gold', 'diamond'].includes(user.plan)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,0,0,0.05)_0px,rgba(255,0,0,0.05)_10px,transparent_10px,transparent_20px)]"></div>
                <div className="relative z-10 text-center p-12 max-w-lg bg-black/90 border border-red-900/50 rounded-3xl shadow-[0_0_100px_rgba(220,38,38,0.2)]">
                    <span className="text-6xl mb-6 block">🔒</span>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">RESTRICTED ACCESS</h1>
                    <p className="text-red-500 font-mono text-sm mb-8 tracking-widest uppercase">Clearance Level: GOLD+</p>
                    <p className="text-slate-400 mb-8">
                        The Devil's Advocate engine employs military-grade adversarial AI to dismantle weak arguments.
                        Upgrade your clearance to proceed.
                    </p>
                    <button onClick={() => navigate("/pricing")} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl uppercase tracking-widest transition shadow-[0_0_20px_red]">
                        Request Clearance
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] font-sans text-white selection:bg-red-900/50 pb-20">
            <Navbar />
            <Toaster />

            <div className="pt-28 pb-12 px-6 max-w-[1600px] mx-auto">
                <header className="mb-16 text-center relative">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-4 py-1 border border-red-500/30 bg-red-900/10 rounded-full text-red-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        Adversarial Simulation v9.0
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-800 tracking-tighter mb-4">
                        DEVIL'S <span className="text-red-600">ADVOCATE</span>
                    </motion.h1>
                    <p className="text-slate-500 max-w-xl mx-auto text-lg font-light">
                        Test your case against the ruthless logic of our AI Prosecutor.
                        It will find every weakness, every loophole, and every contradiction.
                    </p>
                </header>

                <div className="grid lg:grid-cols-2 gap-8 min-h-[600px]">

                    {/* DEFENSE COLUMN */}
                    <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col h-full">
                        <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-1 flex-1 flex flex-col relative overflow-hidden group hover:border-blue-500/30 transition-colors shadow-2xl backdrop-blur-xl">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-50"></div>

                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                                <h3 className="font-bold text-lg text-blue-400 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span> DEFENSE STRATEGY
                                </h3>
                                <span className="text-xs font-mono text-slate-500">INPUT // DEFENSE_STATEMENT</span>
                            </div>

                            <textarea
                                value={argument}
                                onChange={(e) => setArgument(e.target.value)}
                                placeholder="State your case logic here... (e.g. 'My client acted in self-defense because...')"
                                className="flex-1 w-full bg-transparent p-8 text-xl text-slate-300 outline-none resize-none placeholder-slate-700 leading-relaxed font-serif"
                            />

                            <div className="p-6 bg-black/50 border-t border-white/5">
                                <button
                                    onClick={handleChallenge}
                                    disabled={loading || !argument}
                                    className="w-full py-5 bg-white text-black font-black text-lg rounded-xl uppercase tracking-widest hover:bg-slate-200 transition shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {loading ? <span className="animate-pulse">Analyzing Weaknesses...</span> : <span>Initiate Simulation ⚡</span>}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* PROSECUTION COLUMN */}
                    <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col h-full">
                        <div className={`flex-1 rounded-3xl border relative overflow-hidden transition-all duration-500 flex flex-col shadow-2xl backdrop-blur-xl ${analysis ? 'bg-[#0f172a] border-red-500/30' : 'bg-[#0f172a] border-white/10 border-dashed'}`}>

                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                                <h3 className="font-bold text-lg text-red-500 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> OPPOSING COUNSEL
                                </h3>
                                <span className="text-xs font-mono text-slate-500">AI // ADVERSARIAL_MODE</span>
                            </div>

                            <div className="flex-1 p-8 relative overflow-y-auto custom-scrollbar">
                                {!analysis && !loading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
                                        <span className="text-8xl mb-4">⚖️</span>
                                        <p className="text-center font-mono uppercase tracking-widest">Awaiting Defense Statement</p>
                                    </div>
                                )}

                                {loading && (
                                    <div className="h-full flex flex-col items-center justify-center text-red-500 space-y-4">
                                        <div className="font-mono text-xs uppercase tracking-[0.5em] animate-pulse">Scanning Loopholes</div>
                                        <div className="w-64 h-1 bg-red-900/30 rounded-full overflow-hidden">
                                            <div className="w-full h-full bg-red-600 animate-progress-indeterminate"></div>
                                        </div>
                                    </div>
                                )}

                                {analysis && !loading && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                                        {/* Sarcastic Rebuttal */}
                                        <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 relative">
                                            <span className="absolute -top-3 left-4 bg-red-950 text-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border border-red-500/30">Opening Statement</span>
                                            <p className="text-xl font-serif italic text-red-200 leading-relaxed">
                                                "{analysis.sarcastic_rebuttal}"
                                            </p>
                                        </div>

                                        {/* Weaknesses */}
                                        <div>
                                            <h4 className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <span>⚠️</span> Critical Vulnerabilities Detected
                                            </h4>
                                            <div className="space-y-3">
                                                {analysis.weaknesses.map((w, i) => (
                                                    <motion.div
                                                        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                                                        key={i}
                                                        className="flex gap-4 p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl"
                                                    >
                                                        <span className="text-orange-500 font-bold mt-1">✕</span>
                                                        <span className="text-slate-300 text-sm">{w}</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Counter Arguments */}
                                        <div>
                                            <h4 className="text-blue-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <span>⚔️</span> Recommended Prosecution Strategy
                                            </h4>
                                            <div className="space-y-3">
                                                {analysis.counter_arguments.map((c, i) => (
                                                    <motion.div
                                                        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + (i * 0.1) }}
                                                        key={i}
                                                        className="flex gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl"
                                                    >
                                                        <span className="text-blue-500 font-bold mt-1">➞</span>
                                                        <span className="text-slate-300 text-sm">{c}</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>

                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default DevilsAdvocate;
