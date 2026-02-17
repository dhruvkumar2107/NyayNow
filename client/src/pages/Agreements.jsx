import { useState } from "react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import { useNavigate, Link } from "react-router-dom";
import PaywallModal from "../components/PaywallModal";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Shield, AlertTriangle, CheckCircle, Zap, Search, Upload } from "lucide-react";

export default function Agreements() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const analyzeAgreement = async () => {
    if (!text.trim()) return;

    if (!user) {
      const usage = parseInt(localStorage.getItem("guest_ai_usage") || "0");
      if (usage >= 1) {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="font-bold">Login to continue using AI 🔒</span>
            <span className="text-xs">Guest limit reached (1 free chat)</span>
            <Link to="/login" onClick={() => toast.dismiss(t.id)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold text-center mt-1">Login Now</Link>
          </div>
        ), { duration: 5000, icon: '🛑' });
        return;
      }
      localStorage.setItem("guest_ai_usage", (usage + 1).toString());
    }

    setLoading(true);
    setResult(null);

    try {
      // Real API Call
      const res = await axios.post("/api/ai/agreement", { text });
      setResult(res.data);
      setLoading(false);

    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) setShowPaywall(true);
      else toast.error("Analysis failed. Please try again.");
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
      case 'medium': return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
      case 'high': return 'text-rose-400 border-rose-500/50 bg-rose-500/10';
      default: return 'text-slate-400 border-slate-500/50 bg-slate-500/10';
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-400 font-sans selection:bg-indigo-500/30">
      <Navbar />
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center max-w-4xl mx-auto mb-16 relative z-10">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 text-gold-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/10 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
            <Zap size={14} className="fill-gold-400" /> AI Document Intelligence
          </motion.div>

          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl font-serif font-bold tracking-tight text-white mb-6 leading-tight">
            Analyze Contracts with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Military-Grade Precision</span>
          </motion.h1>

          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Detect hidden risks, missing clauses, and loopholes in seconds using our specialized Legal LLM trained on Indian Contract Law.
          </motion.p>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to="/rent-agreement" className="px-8 py-4 rounded-xl font-bold text-midnight-900 bg-white hover:bg-slate-200 transition shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2">
              <FileText size={20} /> Draft New Contract
            </Link>
            <button onClick={() => document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 rounded-xl font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition backdrop-blur-md flex items-center gap-2">
              <Search size={20} /> Quick Analysis
            </button>
          </motion.div>
        </div>

        {/* WORKSPACE */}
        <div id="analyzer" className="grid lg:grid-cols-2 gap-8 min-h-[700px] relative z-10">
          {/* Background Glows */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

          {/* INPUT */}
          <motion.div initial={{ x: -50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} className="flex flex-col h-full">
            <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl flex-1 flex flex-col overflow-hidden relative group hover:border-indigo-500/30 transition-all duration-500">
              <div className="bg-white/5 border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} /> Source Text
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your agreement clause or full text here for instant analysis..."
                className="flex-1 w-full resize-none p-8 outline-none bg-transparent text-slate-300 leading-relaxed font-mono text-sm placeholder:text-slate-600 custom-scrollbar"
              />
              <div className="p-6 bg-white/5 border-t border-white/5 flex justify-between items-center">
                <div className="text-xs text-slate-500 font-mono">
                  {text.length} characters
                </div>
                <button
                  onClick={analyzeAgreement}
                  disabled={loading || !text}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-105 transition disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center gap-2"
                >
                  {loading ? <span className="animate-spin">⏳ Analyzing...</span> : <><Zap size={18} /> Run Diagnostics</>}
                </button>
              </div>
            </div>
          </motion.div>

          {/* OUTPUT */}
          <motion.div initial={{ x: 50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} className="h-full">
            <AnimatePresence mode="wait">
              {!result ? (
                <div className="h-full bg-white/5 backdrop-blur-sm rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 p-10 text-center hover:bg-white/[0.07] transition duration-500">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl shadow-inner mb-6 animate-pulse-slow">
                    <Upload size={32} className="opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready to Analyze</h3>
                  <p className="max-w-xs text-sm mb-8">Paste a legal document on the left to generate a comprehensive risk report.</p>
                  <div className="flex gap-4 text-xs font-bold uppercase tracking-widest opacity-50">
                    <span className="flex items-center gap-1"><Shield size={12} /> Secure</span>
                    <span className="flex items-center gap-1"><Zap size={12} /> Fast</span>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0f172a]/90 backdrop-blur-xl h-full rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                  {/* Result Header */}
                  <div className="bg-white/5 border-b border-white/5 px-6 py-4 flex justify-between items-center">
                    <span className="font-bold text-white flex items-center gap-2"><Shield size={16} className="text-indigo-400" /> Analysis Report</span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${getRiskColor(result.riskLevel)}`}>
                      {result.riskLevel} Risk
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                    {/* Score */}
                    <div className="flex items-center gap-8 p-6 bg-white/5 rounded-2xl border border-white/5">
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="transform -rotate-90 w-24 h-24">
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-700" />
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - (result.accuracyScore / 100))} className="text-emerald-500" />
                        </svg>
                        <span className="absolute text-xl font-bold text-white">{result.accuracyScore}%</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">Agreement Score</h4>
                        <p className="text-sm text-slate-400">Higher score indicates a balanced, thorough contract with fewer risks.</p>
                      </div>
                    </div>

                    {/* Missing Clauses */}
                    {result.missingClauses?.length > 0 && (
                      <div className="bg-rose-500/10 rounded-2xl p-6 border border-rose-500/20">
                        <h4 className="font-bold text-rose-300 mb-4 flex items-center gap-2"><AlertTriangle size={18} /> Critical Omissions</h4>
                        <ul className="space-y-3">
                          {result.missingClauses.map((c, i) => (
                            <li key={i} className="flex gap-3 text-sm text-rose-200 font-medium items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Markdown Content */}
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:tracking-wide prose-p:text-slate-300 prose-li:text-slate-300">
                      <ReactMarkdown>{result.analysisText}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
