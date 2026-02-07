import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import PaywallModal from "../components/PaywallModal"; // NEW

export default function JudgeAI() {
    const [formData, setFormData] = useState({
        caseTitle: "",
        caseType: "Civil Dispute",
        caseDescription: "",
        oppositionDetails: ""
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [showPaywall, setShowPaywall] = useState(false); // NEW

    const handleSubmit = async () => {
        if (!formData.caseDescription) return alert("Please describe the case facts.");

        // 🔒 GUEST LIMIT CHECK
        // We assume 'user' comes from useAuth, but this file doesn't use useAuth yet. 
        // I need to import useAuth or just check token. 
        // Actually, let's use localStorage check primarily.
        const token = localStorage.getItem("token");
        if (!token) {
            const usage = parseInt(localStorage.getItem("ai_usage_judge") || "0");
            if (usage >= 1) {
                setShowPaywall(true); // Reuse Paywall Modal for "Login Required" or similar
                return;
            }
        }

        setLoading(true);
        try {
            const res = await axios.post("/api/ai/predict-outcome", formData);
            setResult(res.data);

            // Increment Usage for Guest
            if (!token) {
                localStorage.setItem("ai_usage_judge", "1");
            }
        } catch (err) {
            if (err.response?.status === 403) {
                setShowPaywall(true);
            } else {
                alert("AI Analysis Failed. " + (err.response?.data?.error || ""));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} /> {/* NEW */}
            <Navbar />

            <div className="py-8 px-4 max-w-6xl mx-auto">
                <header className="mb-10 text-center">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                        BETA • JURIS PRUDENCE AI
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#0B1120] mb-4 font-display">
                        Judge AI: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Predict Your Outcome</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Upload your case facts. Our AI analyzes 10,000+ High Court judgments to predict
                        your win probability, timeline, and opposition strategy.
                    </p>
                </header>

                <div className="grid lg:grid-cols-2 gap-8 items-start">

                    {/* LEFT: INPUT FORM */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-[#0B1120] mb-4 flex items-center gap-2">
                            📝 Case Details
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Case Title / Subject</label>
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 transition"
                                    placeholder="e.g. Property Dispute in Koramangala"
                                    value={formData.caseTitle}
                                    onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Case Category</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500"
                                    value={formData.caseType}
                                    onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
                                >
                                    <option>Civil Dispute</option>
                                    <option>Criminal Defense</option>
                                    <option>Divorce / Family</option>
                                    <option>Corporate / Contract</option>
                                    <option>Traffic / Challan</option>
                                    <option>Employment / Labor</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Fact Description (Be Detailed)</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 h-32 resize-none"
                                    placeholder="Describe what happened, dates, and evidence you have..."
                                    value={formData.caseDescription}
                                    onChange={(e) => setFormData({ ...formData, caseDescription: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Opposition Context (Optional)</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 h-20 resize-none"
                                    placeholder="What is the other party claiming?"
                                    value={formData.oppositionDetails}
                                    onChange={(e) => setFormData({ ...formData, oppositionDetails: e.target.value })}
                                />
                            </div>

                            <button
                                type="button" // Prevent form submission
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-[#0B1120] hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/10 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {loading ? "⚖️ Deliberating..." : "🔮 Predict Outcome"}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: ANALYSIS RESULT */}
                    {result ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-[#0B1120] flex items-center gap-2">
                                        📜 The Verdict
                                    </h2>
                                    <p className="text-xs text-slate-500">Based on IPC/Civil Code interpretation</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                        {result.win_probability}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Success Rate</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* STRATEGY */}
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                        ♟️ Recommended Strategy
                                    </h4>
                                    <ul className="space-y-2">
                                        {result.strategy.map((s, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-600 bg-green-50 p-3 rounded-lg border border-green-100">
                                                <span className="text-green-600 font-bold">{i + 1}.</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* RISKS */}
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                        ⚠️ Critical Risks
                                    </h4>
                                    <ul className="space-y-2">
                                        {result.risk_analysis.map((r, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                                <span className="text-red-500 font-bold">!</span> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Est. Duration</p>
                                        <p className="font-bold text-slate-800 text-lg">{result.estimated_duration}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Precedent</p>
                                        <p className="font-bold text-blue-600 text-sm truncate" title={result.relevant_precedent}>
                                            {result.relevant_precedent}
                                        </p>
                                    </div>
                                </div>

                                <button className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg opacity-90 hover:opacity-100 transition">
                                    📥 Download Full Legal Report
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-4 text-slate-300">
                                ⚖️
                            </div>
                            <h3 className="font-bold text-slate-400 text-lg">AI Judge is Waiting</h3>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">
                                Fill in the details to simulate a court outcome based on 50 years of case law.
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
