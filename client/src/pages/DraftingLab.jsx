import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import SubscriptionModal from '../components/SubscriptionModal';

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
        <div className="min-h-screen bg-slate-900 text-white font-sans pb-20 pt-24 px-6">
            <SubscriptionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                featureName="Smart Drafting Lab"
            />

            <div className="max-w-7xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        Smart Drafting Lab
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Create rock-solid legal documents or analyze existing ones for risks in seconds.
                    </p>
                </header>

                {/* TABS */}
                <div className="flex justify-center mb-10">
                    <div className="bg-slate-800 p-1 rounded-xl inline-flex">
                        <button
                            onClick={() => setActiveTab('draft')}
                            className={`px-8 py-3 rounded-lg font-bold transition-all ${activeTab === 'draft' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Original Draft
                        </button>
                        <button
                            onClick={() => setActiveTab('analyze')}
                            className={`px-8 py-3 rounded-lg font-bold transition-all ${activeTab === 'analyze' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Risk Analysis
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {/* LEFT COLUMN: INPUT */}
                    <div className="bg-slate-800 rounded-3xl p-8 border border-white/10">
                        {activeTab === 'draft' ? (
                            <form onSubmit={handleDraft} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Document Type</label>
                                    <select
                                        value={contractType}
                                        onChange={(e) => setContractType(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option>Non-Disclosure Agreement (NDA)</option>
                                        <option>Employment Contract</option>
                                        <option>Rental Agreement</option>
                                        <option>Freelance Service Agreement</option>
                                        <option>Legal Notice</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Parties Involved</label>
                                    <input
                                        type="text"
                                        value={parties}
                                        onChange={(e) => setParties(e.target.value)}
                                        placeholder="e.g., Company X and Mr. John Doe"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Key Terms / Instructions</label>
                                    <textarea
                                        value={terms}
                                        onChange={(e) => setTerms(e.target.value)}
                                        placeholder="e.g., 2 year duration, monthly salary 50k, 30 days notice period..."
                                        className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
                                >
                                    {loading ? "Drafting..." : "Generate Document"}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Paste Contract Text</label>
                                    <textarea
                                        value={analysisText}
                                        onChange={(e) => setAnalysisText(e.target.value)}
                                        placeholder="Paste the legal text here to check for loopholes..."
                                        className="w-full h-[500px] bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm leading-relaxed"
                                    ></textarea>
                                </div>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={loading}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
                                >
                                    {loading ? "Analyzing..." : "Check for Risks"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: OUTPUT */}
                    <div className={`bg-white text-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl h-[700px] overflow-y-auto ${!generatedContract && !analysisResult ? 'flex items-center justify-center' : ''}`}>

                        {loading ? (
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-500 animate-pulse">Consulting AI Knowledge Base...</p>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'draft' && generatedContract ? (
                                    <div className="prose prose-slate max-w-none">
                                        <ReactMarkdown>{generatedContract}</ReactMarkdown>
                                    </div>
                                ) : activeTab === 'analyze' && analysisResult ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase">Risk Level</p>
                                                <p className={`text-2xl font-black ${analysisResult.riskLevel === 'High' ? 'text-red-500' : analysisResult.riskLevel === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                                                    {analysisResult.riskLevel}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-slate-400 uppercase">Score</p>
                                                <p className="text-2xl font-black text-blue-600">{analysisResult.accuracyScore}/100</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-red-500 mb-2">⚠ Missing Clauses</h3>
                                            <ul className="list-disc pl-5 space-y-1 text-slate-600">
                                                {analysisResult.missingClauses?.map((c, i) => (
                                                    <li key={i}>{c}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-yellow-500 mb-2">Wait! Ambiguous Terms</h3>
                                            <ul className="list-disc pl-5 space-y-1 text-slate-600">
                                                {analysisResult.ambiguousClauses?.map((c, i) => (
                                                    <li key={i}>{c}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="prose prose-sm mt-6 pt-6 border-t border-slate-100">
                                            <ReactMarkdown>{analysisResult.analysisText}</ReactMarkdown>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-400">
                                        <span className="text-6xl block mb-4">📄</span>
                                        <p>Output will appear here.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                </motion.div>

            </div>
        </div>
    );
};

export default DraftingLab;
