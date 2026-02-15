import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import SubscriptionModal from '../components/SubscriptionModal';
import { FileText, Search, Zap, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import Navbar from '../components/Navbar';

const DraftingLab = () => {
    const [activeTab, setActiveTab] = useState('draft'); // 'draft' or 'analyze'
    const [loading, setLoading] = useState(false);

    // DRAFTING STATE
    const [contractType, setContractType] = useState('Non-Disclosure Agreement (NDA)');
    const [parties, setParties] = useState('');
    const [terms, setTerms] = useState('');
    const [generatedContract, setGeneratedContract] = useState('');

    // ANALYSIS STATE
    const [analysisText, setAnalysisText] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);

    /* ---------------- FREE TRIAL LOGIC ---------------- */
    const [showModal, setShowModal] = useState(false);

    const checkFreeTrial = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            const hasUsed = localStorage.getItem('draftingUsed'); // Shared limit for draft/analyze? Let's say yes.
            if (hasUsed) {
                setShowModal(true);
                return false;
            }
        }
        return true;
    };

    const handleDraft = async (e) => {
        e.preventDefault();

        if (!checkFreeTrial()) return;

        setLoading(true);
        try {
            const { data } = await axios.post('https://nyaynow.in/api/ai/draft-contract', {
                type: contractType,
                parties: parties,
                terms: terms
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // Optional now
            });
            setGeneratedContract(data.contract);
            toast.success("Draft generated successfully!");

            if (!localStorage.getItem('token')) {
                localStorage.setItem('draftingUsed', 'true');
            }

        } catch (err) {
            console.error(err);
            toast.error("Drafting failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!analysisText.trim()) return;

        if (!checkFreeTrial()) return;

        setLoading(true);
        try {
            const { data } = await axios.post('https://nyaynow.in/api/ai/agreement', {
                text: analysisText
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAnalysisResult(data);
            toast.success("Analysis complete!");
        } catch (err) {
            console.error(err);
            toast.error("Analysis failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-20 pt-28 px-6 selection:bg-indigo-500/30">
            <Navbar />
            <SubscriptionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                featureName="Smart Drafting Lab"
            />

            <div className="max-w-[1400px] mx-auto">
                {/* HEADER */}
                <header className="mb-12 text-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/50 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-slate-900 tracking-tight relative z-10">
                        Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">Drafting Lab</span>
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed relative z-10">
                        The ultimate tool for legal precision. Draft ironclad contracts or dissect agreements for hidden risks with military-grade AI.
                    </p>
                </header>

                {/* TABS */}
                <div className="flex justify-center mb-12 relative z-10">
                    <div className="bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 inline-flex shadow-xl">
                        <button
                            onClick={() => setActiveTab('draft')}
                            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'draft' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <FileText size={18} /> Smart Draft
                        </button>
                        <button
                            onClick={() => setActiveTab('analyze')}
                            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'analyze' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Search size={18} /> Risk Analysis
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                    {/* LEFT COLUMN: INPUT */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === 'draft' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {activeTab === 'draft' ? <Zap size={20} /> : <Search size={20} />}
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    {activeTab === 'draft' ? "Configure Parameters" : "Upload Agreement"}
                                </h3>
                            </div>

                            {activeTab === 'draft' ? (
                                <form onSubmit={handleDraft} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Type</label>
                                        <select
                                            value={contractType}
                                            onChange={(e) => setContractType(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 hover:bg-black/40 transition appearance-none"
                                        >
                                            <option>Non-Disclosure Agreement (NDA)</option>
                                            <option>Employment Contract</option>
                                            <option>Rental Agreement</option>
                                            <option>Freelance Service Agreement</option>
                                            <option>Legal Notice</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parties Involved</label>
                                        <input
                                            type="text"
                                            value={parties}
                                            onChange={(e) => setParties(e.target.value)}
                                            placeholder="e.g., Company X and Mr. John Doe"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 hover:bg-black/40 transition placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Terms / Instructions</label>
                                        <textarea
                                            value={terms}
                                            onChange={(e) => setTerms(e.target.value)}
                                            placeholder="e.g., 2 year duration, monthly salary 50k, 30 days notice period..."
                                            className="w-full h-40 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 hover:bg-black/40 transition placeholder:text-slate-600 resize-none custom-scrollbar"
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Drafting...
                                            </>
                                        ) : (
                                            <>Generate Document <Zap size={18} className="group-hover:fill-current" /></>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paste Contract Text</label>
                                        <textarea
                                            value={analysisText}
                                            onChange={(e) => setAnalysisText(e.target.value)}
                                            placeholder="Paste the legal text here to check for loopholes..."
                                            className="w-full h-[500px] bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-emerald-500 hover:bg-black/40 transition placeholder:text-slate-600 font-mono text-sm leading-relaxed custom-scrollbar"
                                        ></textarea>
                                    </div>
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={loading}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>Check for Risks <Search size={18} /></>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: OUTPUT */}
                    <div className="lg:col-span-7">
                        <div className={`bg-white text-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl h-[800px] relative overflow-hidden flex flex-col ${!generatedContract && !analysisResult ? 'items-center justify-center' : ''}`}>

                            {!generatedContract && !analysisResult && !loading && (
                                <div className="text-center opacity-40">
                                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FileText size={40} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-300 mb-2">Ready to Process</h3>
                                    <p className="text-slate-400">AI output will appear here in real-time.</p>
                                </div>
                            )}

                            {loading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                                    <div className="w-20 h-20 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                                    <p className="text-indigo-600 font-bold animate-pulse">Consulting NyayLM-70B...</p>
                                </div>
                            )}

                            {(generatedContract || analysisResult) && (
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                    {activeTab === 'draft' && generatedContract ? (
                                        <>
                                            <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">Draft Generated</span>
                                                <button className="text-slate-400 hover:text-indigo-600 transition"><Download size={20} /></button>
                                            </div>
                                            <div className="prose prose-slate max-w-none font-serif">
                                                <ReactMarkdown>{generatedContract}</ReactMarkdown>
                                            </div>
                                        </>
                                    ) : activeTab === 'analyze' && analysisResult ? (
                                        <div className="space-y-8">
                                            {/* SCORECARD */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className={`p-6 rounded-2xl border ${analysisResult.riskLevel === 'High' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                                                    <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Risk Assessment</p>
                                                    <div className="text-3xl font-black flex items-center gap-2">
                                                        {analysisResult.riskLevel}
                                                        <AlertTriangle size={24} />
                                                    </div>
                                                </div>
                                                <div className="p-6 rounded-2xl border bg-blue-50 border-blue-100 text-blue-700">
                                                    <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Clarity Score</p>
                                                    <div className="text-3xl font-black flex items-center gap-2">
                                                        {analysisResult.accuracyScore}/100
                                                        <CheckCircle size={24} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-red-500 mb-4 flex items-center gap-2 text-lg">
                                                    <AlertTriangle size={20} /> Critical Loopholes
                                                </h3>
                                                <ul className="space-y-3">
                                                    {analysisResult.missingClauses?.map((c, i) => (
                                                        <li key={i} className="flex gap-3 text-sm text-slate-700 bg-red-50/50 p-3 rounded-xl border border-red-100">
                                                            <span className="text-red-500 font-bold">•</span> {c}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-amber-500 mb-4 flex items-center gap-2 text-lg">
                                                    <AlertTriangle size={20} /> Ambiguous Terms
                                                </h3>
                                                <ul className="space-y-3">
                                                    {analysisResult.ambiguousClauses?.map((c, i) => (
                                                        <li key={i} className="flex gap-3 text-sm text-slate-700 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                                                            <span className="text-amber-500 font-bold">•</span> {c}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="prose prose-sm font-sans text-slate-600 mt-8 pt-8 border-t border-slate-100">
                                                <h4 className="text-slate-900 font-bold uppercase text-xs tracking-wider mb-4">Detailed Analysis</h4>
                                                <ReactMarkdown>{analysisResult.analysisText}</ReactMarkdown>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default DraftingLab;
