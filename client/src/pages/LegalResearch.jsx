import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Search, BookOpen, Scale, FileText, ArrowRight, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';

const LegalResearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            // Mocking API for UI demo if backend not fully ready or for speed
            // const { data } = await axios.post('/api/ai/research', { query });

            setTimeout(() => {
                setResults([
                    {
                        title: "Kesavananda Bharati v. State of Kerala (1973)",
                        citation: "AIR 1973 SC 1461",
                        summary: "The Supreme Court held that the Parliament cannot alter the basic structure of the Constitution. This case established the 'Basic Structure Doctrine'.",
                        relevance: "98%",
                        tags: ["Constitutional Law", "Basic Structure"]
                    },
                    {
                        title: "Maneka Gandhi v. Union of India (1978)",
                        citation: "1978 AIR 597",
                        summary: "Expanded the meaning of 'Personal Liberty' under Article 21. Any procedure establishing deprivation of life or liberty must be fair, just, and reasonable.",
                        relevance: "92%",
                        tags: ["Article 21", "Fundamental Rights"]
                    },
                    {
                        title: "Vishaka v. State of Rajasthan (1997)",
                        citation: "AIR 1997 SC 3011",
                        summary: "Laid down guidelines to prevent sexual harassment at workplace, which later paved the way for the POSH Act, 2013.",
                        relevance: "88%",
                        tags: ["Workplace Safety", "Gender Justice"]
                    }
                ]);
                setLoading(false);
            }, 1000);

        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-cyan-500/30">
            <Navbar />

            {/* HERO / SEARCH SECTION */}
            <div className={`transition-all duration-700 ease-in-out ${searched ? 'pt-32 pb-12' : 'min-h-screen flex flex-col justify-center items-center -mt-20'}`}>

                <div className={`w-full max-w-4xl px-6 relative z-10 ${searched ? '' : 'text-center'}`}>

                    {!searched && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                            <div className="w-20 h-20 bg-cyan-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-cyan-100 shadow-sm">
                                <Scale size={40} className="text-cyan-600" />
                            </div>
                            <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 mb-6 tracking-tight">
                                Deep Legal Research
                            </h1>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                                Search across 50+ years of High Court & Supreme Court judgments using natural language.
                            </p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSearch} className="relative group">
                        <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500 ${searched ? 'opacity-10' : ''}`}></div>
                        <div className="relative flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <Search className="ml-6 text-slate-400" size={24} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g., 'Recent precedents on defamation details in digital media'..."
                                className="flex-1 bg-transparent border-none outline-none text-white p-6 text-lg placeholder:text-slate-500"
                                autoFocus
                            />
                            <button className="px-8 py-6 bg-white/5 hover:bg-white/10 border-l border-white/5 transition text-white font-bold">
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight size={24} />}
                            </button>
                        </div>
                    </form>

                    {!searched && (
                        <div className="mt-8 flex justify-center gap-4 text-sm text-slate-500">
                            <span className="px-4 py-2 bg-white/5 rounded-full border border-white/5 hover:border-white/20 cursor-pointer transition">Sec 138 NI Act</span>
                            <span className="px-4 py-2 bg-white/5 rounded-full border border-white/5 hover:border-white/20 cursor-pointer transition">RERA Guidelines</span>
                            <span className="px-4 py-2 bg-white/5 rounded-full border border-white/5 hover:border-white/20 cursor-pointer transition">Divorce Alimony</span>
                        </div>
                    )}
                </div>
            </div>

            {/* RESULTS SECTION */}
            {searched && (
                <div className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-12 gap-8">

                    {/* FILTERS SIDEBAR */}
                    <div className="col-span-3 hidden lg:block space-y-8">
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Filter size={14} /> Source
                            </h3>
                            <div className="space-y-2">
                                {['Supreme Court', 'High Courts', 'Tribunals', 'Acts & Statutes'].map(f => (
                                    <label key={f} className="flex items-center gap-3 text-slate-400 hover:text-white cursor-pointer group">
                                        <div className="w-4 h-4 rounded border border-slate-600 group-hover:border-cyan-400 transition flex items-center justify-center"></div>
                                        {f}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Date Range</h3>
                            <div className="space-y-2">
                                {['Past Year', 'Past 5 Years', 'Past 10 Years', 'Legacy (< 2000)'].map(f => (
                                    <label key={f} className="flex items-center gap-3 text-slate-400 hover:text-white cursor-pointer group">
                                        <div className="w-4 h-4 rounded border border-slate-600 group-hover:border-cyan-400 transition flex items-center justify-center"></div>
                                        {f}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RESULTS FEED */}
                    <div className="col-span-12 lg:col-span-6 space-y-6">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse border border-white/5"></div>
                            ))
                        ) : (
                            <AnimatePresence>
                                {results.map((res, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-[#0f172a] rounded-2xl p-6 border border-white/5 hover:border-cyan-500/30 hover:shadow-lg transition group cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">{res.citation}</span>
                                            <span className="text-xs font-bold text-slate-500">{res.relevance} Match</span>
                                        </div>
                                        <h3 className="text-xl font-serif font-bold text-slate-200 mb-2 group-hover:text-white transition">{res.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
                                            {res.summary}
                                        </p>
                                        <div className="flex gap-2">
                                            {res.tags.map(t => (
                                                <span key={t} className="text-[10px] font-bold text-slate-500 uppercase tracking-wide bg-white/5 px-2 py-1 rounded">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                        {!loading && results.length > 0 && (
                            <div className="text-center py-8">
                                <p className="text-slate-500 text-sm mb-4">You've viewed all top matches.</p>
                                <button className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold transition">Load More from High Courts</button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDEBAR - AI SUMMARY */}
                    <div className="col-span-3 hidden lg:block">
                        <div className="bg-gradient-to-b from-indigo-900/20 to-transparent border border-indigo-500/20 rounded-2xl p-6 sticky top-28">
                            <h3 className="text-sm font-bold text-indigo-300 mb-4 flex items-center gap-2">
                                <BookOpen size={16} /> AI Research Summary
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                Based on your query, the consensus indicates that digital defamation follows the same liability principles as traditional media, but with added scrutiny under the IT Act, 2000.
                            </p>
                            <div className="w-full h-px bg-white/10 mb-4"></div>
                            <h4 className="text-xs font-bold text-white mb-2">Key Statutes</h4>
                            <ul className="space-y-1 text-xs text-slate-400">
                                <li>• Section 499 IPC</li>
                                <li>• Section 66A IT Act (Scrapped)</li>
                                <li>• Shreya Singhal Case</li>
                            </ul>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default LegalResearch;
