import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Calendar, AlertTriangle, Shield, CheckCircle, Search, Scale } from 'lucide-react';

const CaseFileAnalyzer = () => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return toast.error("Please upload a PDF file first.");

        if (user?.plan === 'free' && user?.aiUsage?.count >= 3) {
            return toast.error("Free Limit Reached! Upgrade to Silver.");
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await axios.post('/api/ai/analyze-case-file', formData, {
                headers: {
                    ...headers,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setAnalysis(res.data);
            toast.success("Forensic Analysis Complete");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Analysis Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">
            <Navbar />

            <div className="max-w-[1400px] mx-auto px-6 pt-32 pb-20">
                <header className="text-center mb-16">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        Legal Forensics v2.0
                    </motion.div>
                    <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">
                        Case File <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Intelligence</span>
                    </motion.h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-xl font-light">
                        Upload FIRs, Chargesheets, or Contracts. Our AI extracts timelines, risks, and win probabilities with forensic precision.
                    </p>
                </header>

                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT PANEL: UPLOAD */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                            className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>

                            <div
                                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5'
                                    }`}
                            >
                                <div className="w-16 h-16 bg-white/5 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg group-hover:scale-110 transition duration-300">
                                    <UploadCloud size={32} />
                                </div>
                                <h3 className="font-bold text-white mb-2 text-lg">Upload Case File</h3>
                                <p className="text-xs text-slate-500 mb-8 font-mono">PDF Format Only • Max 10MB</p>

                                <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="file-upload" />
                                <label htmlFor="file-upload" className="block w-full py-4 px-4 bg-white/5 border border-white/10 rounded-xl font-bold text-sm text-white shadow-lg cursor-pointer hover:bg-white/10 transition mb-3 truncate">
                                    {file ? file.name : "Select Document"}
                                </label>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={loading || !file}
                                className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Processing...</>
                                ) : <><Search size={18} /> Run Analysis</>}
                            </button>
                        </motion.div>

                        {/* Tips Card */}
                        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-3xl p-8 shadow-lg relative overflow-hidden border border-white/10">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <h4 className="font-bold mb-4 relative z-10 flex items-center gap-2"><CheckCircle size={18} /> Pro Tip</h4>
                            <p className="text-sm text-indigo-200 relative z-10 font-light leading-relaxed">
                                This tool works best with scanned PDFs that have clear text. If the file is blurred, accuracy may drop. Ensure the document contains relevant sections like FIR details or Contract clauses.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT PANEL: RESULTS */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {!analysis && !loading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                        <Scale size={40} className="opacity-50" />
                                    </div>
                                    <p className="font-medium text-slate-400">Analysis results will appear here</p>
                                    <p className="text-xs text-slate-600 mt-2">Waiting for input...</p>
                                </motion.div>
                            )}

                            {loading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-[500px] flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 relative">
                                        <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                                    </div>
                                    <p className="mt-8 font-bold text-white animate-pulse">Running Neural Forensics...</p>
                                    <p className="text-xs text-slate-500 mt-2">Scanning document structure...</p>
                                </motion.div>
                            )}

                            {analysis && !loading && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                                    {/* Top Metrics */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-[#0f172a] p-8 rounded-3xl shadow-lg border border-white/10 relative overflow-hidden group">
                                            <div className="absolute right-0 top-0 p-6 opacity-5 text-8xl group-hover:opacity-10 transition">🏆</div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Win Probability</p>
                                            <p className={`text-6xl font-black ${analysis.winProbability > 60 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                                {analysis.winProbability}%
                                            </p>
                                        </div>
                                        <div className="bg-[#0f172a] p-8 rounded-3xl shadow-lg border border-white/10 md:col-span-2 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">AI Executive Summary</p>
                                            <p className="text-slate-300 leading-relaxed font-light text-lg">{analysis.summary}</p>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="bg-[#0f172a] p-8 rounded-3xl shadow-lg border border-white/10">
                                        <h3 className="font-bold text-white text-lg mb-8 flex items-center gap-3">
                                            <span className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400"><Calendar size={20} /></span> Extracted Timeline
                                        </h3>
                                        <div className="relative border-l border-white/10 ml-3 space-y-10 pl-8">
                                            {analysis.timeline?.map((item, i) => (
                                                <div key={i} className="relative">
                                                    <span className="absolute -left-[37px] top-1.5 w-4 h-4 bg-[#0f172a] border-2 border-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                                                    <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-3 inline-block">{item.date}</span>
                                                    <p className="text-white font-medium text-lg">{item.event}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SWOT Grid */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-rose-500/5 p-8 rounded-3xl border border-rose-500/10">
                                            <h3 className="font-bold text-rose-300 mb-6 flex items-center gap-2"><div className="p-1 bg-rose-500/20 rounded"><AlertTriangle size={16} /></div> Identified Risks</h3>
                                            <ul className="space-y-4">
                                                {analysis.risks?.map((r, i) => (
                                                    <li key={i} className="flex gap-3 text-sm text-rose-200">
                                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span> {r}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-amber-500/5 p-8 rounded-3xl border border-amber-500/10">
                                            <h3 className="font-bold text-amber-300 mb-6 flex items-center gap-2"><div className="p-1 bg-amber-500/20 rounded"><Shield size={16} /></div> Contradictions</h3>
                                            <ul className="space-y-4">
                                                {analysis.contradictions?.map((c, i) => (
                                                    <li key={i} className="flex gap-3 text-sm text-amber-200">
                                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span> {c}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Citations */}
                                    <div className="bg-[#020617] text-white p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                                        <h3 className="font-bold text-white mb-6 flex items-center gap-3 relative z-10"><span className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><FileText size={18} /></span> Relevant Precedents</h3>
                                        <div className="flex flex-wrap gap-3 relative z-10">
                                            {analysis.citations?.map((c, i) => (
                                                <span key={i} className="px-4 py-2 bg-white/5 rounded-xl text-sm font-mono text-indigo-200 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 transition cursor-default">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CaseFileAnalyzer;
