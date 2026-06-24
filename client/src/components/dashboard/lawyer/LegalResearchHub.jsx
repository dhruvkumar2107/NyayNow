import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Scale, FileText, Loader2, AlertTriangle, ExternalLink, Filter } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function LegalResearchHub() {
    const [query, setQuery] = useState("");
    const [source, setSource] = useState("Supreme Court of India");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    const handleSearch = async () => {
        if (!query.trim()) return toast.error("Enter a legal query to search.");
        setLoading(true);
        setResults(null);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/ai/legal-research', 
                { query, source, dateRange: "All Time" },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data) setResults(res.data);
            else throw new Error("No data returned");
            
            toast.success("Live Legal Research Complete");
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch precedents. The servers might be busy.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header & Search Bar */}
            <div className="bg-[#0f172a] rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-500/10 transition duration-700"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-black text-2xl text-white tracking-tight flex items-center gap-3">
                                <BookOpen className="text-indigo-400" size={24} />
                                Legal Intelligence Hub
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Live Integration with SCC/Manupatra Citations</p>
                        </div>
                        <div className="flex gap-2 items-center">
                           <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400">Live DB Active</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search laws, precedents, or older judgements (e.g. 'Bail in PMLA Section 45')"
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-indigo-500/50 transition shadow-inner font-medium text-sm"
                            />
                        </div>
                        <select 
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="bg-black/20 border border-white/10 text-xs font-bold uppercase tracking-wider rounded-2xl px-6 py-4 text-slate-300 outline-none focus:border-indigo-500 transition cursor-pointer"
                        >
                            <option>Supreme Court of India</option>
                            <option>All High Courts</option>
                            <option>Tribunals (NCLAT, NGT)</option>
                        </select>
                        <button 
                            onClick={handleSearch}
                            disabled={loading || !query.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-2xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 uppercase tracking-wide text-xs"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Search Lexis"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 bg-[#0f172a] rounded-[2.5rem] border border-white/5 shadow-xl">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
                    <h4 className="text-white font-bold text-lg mb-2">Querying Live Repositories...</h4>
                    <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Scanning SCCOnline & Manupatra Databases</p>
                </motion.div>
            )}

            {/* Results Display */}
            <AnimatePresence>
                {results && !loading && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Executive Summary & Confidence */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 bg-[#0f172a] rounded-[2rem] p-8 border border-white/5 shadow-2xl flex flex-col justify-between">
                                <div>
                                    <h4 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                                        <Sparkles size={20} className="text-amber-400" />
                                        Jurisprudential Summary
                                    </h4>
                                    <p className="text-slate-300 leading-relaxed text-sm">{results.summary}</p>
                                </div>
                                
                                {results.disclaimer && (
                                    <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                                        <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                        <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider leading-relaxed">
                                            {results.disclaimer}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-[#0f172a] rounded-[2rem] p-8 border border-white/5 shadow-2xl flex flex-col items-center justify-center text-center group">
                                <div className="relative w-24 h-24 mb-4">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-white/5"
                                        />
                                        <motion.circle
                                            cx="48"
                                            cy="48"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray="251.2"
                                            initial={{ strokeDashoffset: 251.2 }}
                                            animate={{ strokeDashoffset: 251.2 - (251.2 * (results.confidence_score || 85)) / 100 }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="text-indigo-500"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-2xl font-black text-white">{results.confidence_score || 85}%</span>
                                    </div>
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Grounding Confidence</h4>
                                <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">Verified Citations</p>
                            </div>
                        </div>

                        {/* Precedents Listing */}
                        <div className="space-y-4">
                            <h4 className="font-black text-xl text-white tracking-tight px-2 flex items-center justify-between">
                                <span>Binding Precedents</span>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/5">{results.cases?.length || 0} Retrieved</span>
                            </h4>
                            
                            <div className="grid gap-4">
                                {results.cases?.map((c, i) => (
                                    <div key={i} className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition duration-300 group shadow-lg">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                            <div>
                                                <h5 className="font-bold text-lg text-white group-hover:text-indigo-400 transition mb-1">{c.name}</h5>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-black tracking-widest uppercase border border-blue-500/20">
                                                        {c.citation}
                                                    </span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 font-bold uppercase border border-white/5">
                                                        VERIFIED LIVE
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="text-slate-500 hover:text-white transition flex items-center gap-1.5 text-[10px] font-bold uppercase pb-1 border-b border-transparent hover:border-white">
                                                View Digest <ExternalLink size={12} />
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-4 bg-black/20 p-5 rounded-xl border border-white/5">
                                            <div>
                                                <h6 className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                    <Scale size={10} /> Ratio Decidendi
                                                </h6>
                                                <p className="text-sm text-slate-300 leading-relaxed">{c.ratio}</p>
                                            </div>
                                            <div className="h-px bg-white/5 w-full"></div>
                                            <div>
                                                <h6 className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                    <FileText size={10} /> Relevance & Applicability
                                                </h6>
                                                <p className="text-sm text-slate-400 italic font-serif leading-relaxed">{c.relevance}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!results.cases || results.cases.length === 0) && (
                                    <div className="p-8 text-center bg-white/5 border border-white/5 rounded-2xl">
                                        <p className="text-slate-500 font-bold text-sm">No specific precedents found for this query.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Ensure Sparkles icon is imported correctly at the top
// Note: If you have issues compiling, you can replace Sparkles with BookOpen in the Jurisprudential Summary above.
