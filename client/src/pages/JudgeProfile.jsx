import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Scale, BookOpen, User, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const JudgeProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    // 🔒 GATING CHECK (Diamond Plan)
    if (user && user.plan !== 'diamond') {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden font-sans selection:bg-amber-500/30">
                <Navbar />
                {/* Background FX */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 hidden"></div>
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 text-center p-12 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] max-w-xl shadow-2xl"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl mx-auto mb-8 flex items-center justify-center text-5xl shadow-lg shadow-amber-500/20">💎</div>
                    <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Restricted Intelligence</h1>
                    <p className="text-slate-300 mb-10 leading-relaxed text-lg font-light">
                        Judicial Analytics & Psychology Profiling is an elite feature available only to <span className="text-amber-400 font-bold">Diamond Partners</span>.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-10 text-left">
                        <div className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-amber-500/30 transition">
                            <div className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-1">🧠 Bias Detection</div>
                            <div className="text-slate-400 text-xs">Analyze judge's past rulings & leanings</div>
                        </div>
                        <div className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-amber-500/30 transition">
                            <div className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-1">📊 Win/Loss Rates</div>
                            <div className="text-slate-400 text-xs">Predict specific case outcomes</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button onClick={() => navigate("/pricing")} className="w-full py-5 bg-gradient-to-r from-amber-400 to-orange-600 text-midnight-950 font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition shadow-lg shadow-amber-500/20 text-sm">
                            Upgrade to Unlock
                        </button>
                        <button onClick={() => navigate("/")} className="text-sm text-slate-500 hover:text-white transition font-bold uppercase tracking-wider">No thanks</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setData(null);

        // Mock Data for Demo
        setTimeout(() => {
            setData({
                name: query || "Justice A.K. Menon",
                court: "High Court of Bombay",
                adjective: "Strict Constructionist",
                appointed: "2013",
                total_judgments: 842,
                biases: [
                    { topic: "Commercial Disputes", tendency: "Pro-Creditor", color: "green" },
                    { topic: "Criminal Bail", tendency: "Conservative", color: "red" },
                    { topic: "Family Law", tendency: "Pro-Settlement", color: "green" }
                ],
                favorite_citations: ["Kesavananda Bharati v. State of Kerala", "Maneka Gandhi v. Union of India"],
                keywords: ["Maintainability", "Prima Facie", "Jurisdiction", "Equity", "Limitation"],
                image: "https://via.placeholder.com/150" // Placeholder, in real app would be fetched
            });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400">
            <Navbar />

            {/* HEADER */}
            <div className="relative pt-40 pb-32 px-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                            Diamond Intelligence Access
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter text-white">
                            Judicial <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Intelligence.</span>
                        </h1>
                        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                            Leverage AI to analyze judicial psychology, past rulings, and behavioral patterns. <br className="hidden md:block" />Know your judge before you enter the courtroom.
                        </p>

                        {/* SEARCH BAR */}
                        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
                                <Search className="text-slate-500 ml-4" size={24} />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search Judge by Name (e.g., Justice Chandrachud)..."
                                    className="w-full bg-transparent border-none text-white text-lg placeholder-slate-500 focus:ring-0 px-4 py-3"
                                />
                                <button
                                    disabled={loading || !query}
                                    className="bg-zinc-100 hover:bg-white text-black px-8 py-3 rounded-xl font-bold transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? <span className="animate-spin text-lg">🌀</span> : "Analyze"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* RESULTS */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 pb-24 relative z-20">
                <AnimatePresence>
                    {data && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                        >

                            {/* LEFT: PROFILE CARD */}
                            <div className="lg:col-span-4">
                                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/10 sticky top-24 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-20"></div>

                                    <div className="w-32 h-32 bg-gradient-to-br from-slate-800 to-black rounded-[2rem] flex items-center justify-center text-6xl mb-8 mx-auto shadow-inner border border-white/5">
                                        ⚖️
                                    </div>

                                    <h2 className="text-3xl font-bold text-center text-white mb-2 font-serif">{data.name}</h2>
                                    <p className="text-amber-400 text-center font-bold text-sm tracking-widest uppercase mb-8">{data.court}</p>

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Judgments</span>
                                            <span className="font-mono text-xl text-white font-bold">{data.total_judgments}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Appointed</span>
                                            <span className="font-mono text-xl text-white font-bold">{data.appointed}</span>
                                        </div>

                                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 rounded-2xl border border-amber-500/20 text-center relative overflow-hidden">
                                            <div className="relative z-10">
                                                <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">ARCHETYPE</div>
                                                <div className="text-xl font-serif font-bold text-amber-200 italic">"{data.adjective}"</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: ANALYTICS */}
                            <div className="lg:col-span-8 space-y-6">

                                {/* BIAS METERS */}
                                <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-10 shadow-xl border border-white/10">
                                    <h3 className="font-bold text-xl text-white mb-8 flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg shadow-inner"><TrendingUp size={20} /></span>
                                        Behavioral Tendencies
                                    </h3>
                                    <div className="space-y-8">
                                        {data.biases.map((b, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between mb-3">
                                                    <span className="font-bold text-slate-300 text-sm">{b.topic}</span>
                                                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider border ${b.color === 'red' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                                        {b.tendency}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: b.color === 'red' ? '30%' : '85%' }}
                                                        transition={{ duration: 1, delay: 0.5 + (i * 0.2) }}
                                                        className={`h-full ${b.color === 'red' ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* KEYWORDS */}
                                    <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/10 group hover:border-indigo-500/30 transition">
                                        <h3 className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <BookOpen size={14} className="text-indigo-400" /> Frequent Keywords
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {data.keywords.map((k, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 text-indigo-200 font-medium text-xs rounded-lg hover:bg-indigo-500/20 hover:border-indigo-500/30 transition cursor-default">
                                                    {k}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CITATIONS */}
                                    <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/10 group hover:border-amber-500/30 transition">
                                        <h3 className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <Scale size={14} className="text-amber-400" /> Top Citations
                                        </h3>
                                        <ul className="space-y-4">
                                            {data.favorite_citations.map((c, i) => (
                                                <li key={i} className="flex gap-3 items-start">
                                                    <span className="text-amber-500/50 font-serif text-2xl leading-none">"</span>
                                                    <span className="text-xs text-slate-300 italic font-medium leading-relaxed">{c}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!data && !loading && (
                    <div className="text-center py-20 opacity-30 mt-10">
                        <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl grayscale animate-pulse-slow">⚖️</div>
                        <p className="font-bold text-slate-500 uppercase tracking-widest text-sm">Awaiting Judicial Input</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JudgeProfile;
