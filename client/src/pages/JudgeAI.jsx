import React, { useState } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Scale } from "lucide-react";
import Navbar from '../components/Navbar';

const JudgeAI = () => {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handleAnalyze = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setResult({
                winProbability: 78,
                riskLevel: "Medium",
                keyPrecedents: 12,
                sentiment: "Positive",
                analysis: "The petition has strong grounds on procedural misconduct (Section 34). However, lack of direct evidence for the secondary claim weakens the overall stance."
            });
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-400 font-sans selection:bg-indigo-500/30">
            <Navbar />

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-6 inline-block shadow-sm backdrop-blur-md">
                            Predictive Justice Engine
                        </span>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight text-white">
                            Judge <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                            Upload your case files. Our transformer models analyze 10M+ High Court & Supreme Court judgments to predict your case outcome with 94% accuracy.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* MAIN INTERFACE */}
            <section className="container mx-auto px-6 pb-24 max-w-5xl">

                {/* UPLOAD AREA */}
                <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-10 backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500 shadow-2xl">
                    {!result && !analyzing && (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400 group-hover:scale-110 transition duration-500 border border-indigo-500/20">
                                <UploadCloud size={40} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2 text-white">Drop Case Brief or Petition</h3>
                                <p className="text-slate-400">Supported formats: PDF, DOCX (Max 25MB)</p>
                            </div>
                            <button
                                onClick={handleAnalyze}
                                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50"
                            >
                                Analyze Outcomes
                            </button>
                        </div>
                    )}

                    {analyzing && (
                        <div className="text-center py-10">
                            <div className="relative w-32 h-32 mx-auto mb-8">
                                <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                                <Scale className="absolute inset-0 m-auto text-indigo-400" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 animate-pulse text-white">Running Neural Simulation...</h3>
                            <p className="text-slate-400">Cross-referencing with 12,400 similar precedents</p>
                        </div>
                    )}

                    {result && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-8 text-left">

                            {/* STATS COL */}
                            <div className="md:col-span-1 space-y-6">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Win Probability</p>
                                    <div className="text-5xl font-bold text-emerald-400 mb-2">
                                        <CountUp end={result.winProbability} duration={2} suffix="%" />
                                    </div>
                                    <p className="text-xs text-emerald-500/80 font-bold uppercase">High Confidence</p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Risk Factor</p>
                                    <div className="text-3xl font-bold text-amber-400 mb-2">{result.riskLevel}</div>
                                </div>
                            </div>

                            {/* ANALYSIS COL */}
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2 text-white">
                                        <FileText className="text-indigo-400" size={20} />
                                        Verdict Analysis
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed text-lg bg-black/40 p-6 rounded-2xl border border-white/10">
                                        {result.analysis}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/20 flex items-center gap-3">
                                        <CheckCircle className="text-emerald-400 shrink-0" size={20} />
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase">Strongest Point</p>
                                            <p className="text-sm font-semibold text-slate-200">Procedural Adherence</p>
                                        </div>
                                    </div>
                                    <div className="bg-amber-900/10 p-4 rounded-xl border border-amber-500/20 flex items-center gap-3">
                                        <AlertTriangle className="text-amber-400 shrink-0" size={20} />
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase">Weakest Link</p>
                                            <p className="text-sm font-semibold text-slate-200">Evidence Gap (Sec 4)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>

        </div>
    );
};

export default JudgeAI;
