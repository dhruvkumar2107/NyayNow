import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Gavel, Scale, Calendar, FileText, Activity } from 'lucide-react';

const CourtStatus = () => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;
        setLoading(true);
        setError('');
        setCaseData(null);

        try {
            // Simulate API call with delay for 'real' feel
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Mock Data if API fails or for demo
            const mock = {
                court: "High Court of Delhi",
                cnr: query.toUpperCase(),
                caseNumber: "W.P.(C) 1234/2024",
                filingDate: "12-01-2024",
                nextHearing: "15-03-2024",
                judge: "Hon'ble Mr. Justice Sanjeev Narula",
                stage: "Evidence",
                status: "Pending",
                petitioner: "Amit Kumar & Ors.",
                respondent: "State of NCT of Delhi",
                acts: ["Constitution of India", "Civil Procedure Code"],
                history: [
                    { date: "12-02-2024", action: "Notice Issued", outcome: "Adjourned" },
                    { date: "15-01-2024", action: "Filing", outcome: "Listed" }
                ]
            };
            setCaseData(mock);
            // const res = await axios.get(`/api/ecourts/search?query=${query}`);
            // setCaseData(res.data);
        } catch (err) {
            setError("Case record not found. Please verify CNR number.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">
            <Navbar />

            {/* HEADER HERO */}
            <div className="relative pt-32 pb-32 px-6 overflow-hidden border-b border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-900/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-4xl mx-auto text-center relative z-20">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 text-xs font-bold uppercase tracking-widest mb-6">
                        <Activity size={14} /> National Judicial Data Grid Sync
                    </motion.div>
                    <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
                        Judicial Records <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Real-time.</span>
                    </motion.h1>
                    <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Instant access to High Court and District Court case status, orders, and cause lists across India.
                    </motion.p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-24 relative z-20 space-y-12 pb-24">

                {/* SEARCH CARD */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black/40 backdrop-blur-xl p-3 rounded-[2rem] shadow-2xl border border-white/10"
                >
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
                        <div className="flex-grow relative">
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500">
                                <Search size={24} />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-16 pr-6 py-5 bg-white/5 rounded-2xl outline-none text-xl font-medium text-white placeholder-slate-500 border border-transparent focus:border-amber-500/50 transition"
                                placeholder="Enter 16-digit CNR Number (e.g. DLDH01004...)"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <button
                            disabled={loading || !query}
                            className="bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-midnight-900 font-bold px-10 py-5 rounded-2xl transition shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                        >
                            {loading ? <span className="animate-spin text-2xl">🌀</span> : <span>Search Registry</span>}
                        </button>
                    </form>
                </motion.div>

                {/* RESULTS */}
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-center text-red-400 font-bold text-lg">
                            {error}
                        </motion.div>
                    )}

                    {caseData && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
                        >

                            {/* STATUS HEADER */}
                            <div className="bg-white/5 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5">
                                <div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shadow-inner">
                                            <Scale size={24} />
                                        </div>
                                        <h2 className="text-3xl font-serif font-bold text-white">{caseData.court}</h2>
                                    </div>
                                    <p className="text-indigo-400 font-mono text-sm tracking-widest uppercase font-bold ml-16">CNR: {caseData.cnr}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Status</span>
                                    <span className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-wider text-sm border ${caseData.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                                        {caseData.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-10">
                                {/* GRID DETAILS */}
                                <div className="grid md:grid-cols-2 gap-16 mb-16">
                                    <div className="space-y-8">
                                        <h3 className="font-bold text-slate-300 border-b border-white/5 pb-4 mb-6 flex items-center gap-3">
                                            <FileText size={18} className="text-indigo-400" /> Case Details
                                        </h3>
                                        <Detail label="Case Number" value={caseData.caseNumber} />
                                        <Detail label="Filing Date" value={caseData.filingDate} />
                                        <Detail label="Next Hearing" value={caseData.nextHearing} highlight />
                                        <Detail label="Presiding Judge" value={caseData.judge} />
                                        <Detail label="Stage" value={caseData.stage} />
                                    </div>

                                    <div className="space-y-8">
                                        <h3 className="font-bold text-slate-300 border-b border-white/5 pb-4 mb-6 flex items-center gap-3">
                                            <Gavel size={18} className="text-indigo-400" /> Parties Involved
                                        </h3>

                                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition">
                                            <div className="flex gap-4 items-center mb-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs border border-indigo-500/30">P</div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Petitioner</p>
                                            </div>
                                            <p className="font-serif text-xl font-bold text-white pl-14">{caseData.petitioner}</p>
                                        </div>

                                        <div className="flex justify-center text-slate-600 font-serif italic text-sm">Versus</div>

                                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition">
                                            <div className="flex gap-4 items-center mb-4">
                                                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs border border-amber-500/30">R</div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Respondent</p>
                                            </div>
                                            <p className="font-serif text-xl font-bold text-white pl-14">{caseData.respondent}</p>
                                        </div>

                                        <div className="pt-4">
                                            <p className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Acts & Sections</p>
                                            <div className="flex flex-wrap gap-2">
                                                {caseData.acts.map(act => (
                                                    <span key={act} className="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 text-xs font-bold rounded-lg hover:border-indigo-500/50 transition cursor-default">{act}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* TIMELINE */}
                                <div className="bg-black/20 rounded-[2rem] p-8 border border-white/5">
                                    <h3 className="font-bold text-slate-300 mb-8 flex items-center gap-3">
                                        <Calendar size={18} className="text-amber-400" /> Hearing History
                                    </h3>
                                    <div className="relative border-l border-white/10 ml-3 space-y-10 pl-10 pb-2">
                                        {caseData.history.map((h, i) => (
                                            <div key={i} className="relative group">
                                                <div className="absolute -left-[45px] top-1 w-3 h-3 rounded-full bg-midnight-900 border-2 border-indigo-500 group-hover:bg-amber-500 group-hover:border-amber-500 transition shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
                                                    <div>
                                                        <p className="font-bold text-lg text-white group-hover:text-amber-400 transition mb-1">{h.action}</p>
                                                        <p className="text-sm text-slate-500 font-medium">{h.outcome}</p>
                                                    </div>
                                                    <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">{h.date}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const Detail = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center group py-2 border-b border-white/[0.02]">
        <span className="text-slate-500 font-medium text-sm group-hover:text-amber-400 transition uppercase tracking-wider">{label}</span>
        <span className={`font-bold ${highlight ? 'text-amber-400 text-xl' : 'text-slate-200 text-lg'}`}>{value}</span>
    </div>
);

export default CourtStatus;
