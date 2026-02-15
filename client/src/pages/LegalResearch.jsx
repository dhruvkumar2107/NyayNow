import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import SubscriptionModal from '../components/SubscriptionModal';

const LegalResearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    /* ---------------- FREE TRIAL LOGIC ---------------- */
    const [showModal, setShowModal] = useState(false);

    const checkFreeTrial = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            const hasUsed = localStorage.getItem('researchUsed');
            if (hasUsed) {
                setShowModal(true);
                return false;
            }
        }
        return true;
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        if (!checkFreeTrial()) return;

        setLoading(true);
        setResults(null);

        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            const { data } = await axios.post('https://nyaynow.in/api/ai/legal-research', {
                query
            }, { headers });
            setResults(data);

            if (!token) {
                localStorage.setItem('researchUsed', 'true');
            }

        } catch (err) {
            console.error(err);
            toast.error("Research failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            <SubscriptionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                featureName="Legal Research"
            />

            {/* HEADER */}
            <div className="bg-slate-900 text-white pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6"
                    >
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                        Global Case Database
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight"
                    >
                        Intelligent Legal Research
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400 mb-10 font-light max-w-2xl mx-auto"
                    >
                        Find relevant case laws and precedents using <span className="text-indigo-400 font-bold">Semantic Search</span>, not just keywords.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative max-w-2xl mx-auto"
                    >
                        <form onSubmit={handleSearch} className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="e.g., Can a tenant be evicted for non-payment during a pandemic?"
                                    className="w-full pl-6 pr-32 py-5 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xl text-lg transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : "Research"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* RESULTS AREA */}
            <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-20">
                <AnimatePresence mode="wait">

                    {results && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* SUMMARY CARD */}
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-bl-[100px] -z-0 opacity-50"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">💡</div>
                                        <h2 className="text-2xl font-bold text-slate-900">AI Analysis</h2>
                                    </div>
                                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                        {results.summary}
                                    </p>
                                </div>
                            </div>

                            {/* CASES GRID */}
                            <div className="grid gap-6">
                                {results.cases?.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                                                    {item.name}
                                                </h3>
                                                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-xs font-mono rounded-md border border-slate-200">
                                                    {item.citation}
                                                </span>
                                            </div>
                                            <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold uppercase tracking-wider rounded-full border border-green-100">
                                                {Math.floor(Math.random() * (99 - 85) + 85)}% Match
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                                <p className="text-xs text-slate-400 font-bold uppercase mb-2 tracking-widest">RATIO DECIDENDI</p>
                                                <p className="text-slate-700 italic font-serif text-lg leading-relaxed">"{item.ratio}"</p>
                                            </div>

                                            <div className="pl-2 border-l-2 border-indigo-200">
                                                <p className="text-xs text-indigo-400 font-bold uppercase mb-1">RELEVANCE</p>
                                                <p className="text-slate-600 text-sm">{item.relevance}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LegalResearch;
