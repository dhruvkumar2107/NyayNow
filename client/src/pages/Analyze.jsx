import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, BookOpen, CheckCircle, Zap, ArrowRight, Shield, Brain, Sparkles, MessageSquare, ChevronRight } from "lucide-react";

const EXAMPLES = [
  "My employer deducted salary without notice — is this legal?",
  "My landlord is refusing to return the security deposit. What can I do?",
  "Can a bank charge penalties without informing me?",
  "My neighbor is playing loud music late at night. What are my legal options?",
];

export default function Analyze() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!text.trim()) return toast.error("Please describe your situation first.");

    if (!user) {
      const usage = parseInt(localStorage.getItem("guest_ai_usage") || "0");
      if (usage >= 1) {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="font-bold">Login to continue using AI 🔒</span>
            <span className="text-xs">Guest limit reached (1 free analysis)</span>
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
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post("/api/ai/case-analysis", { text }, { headers });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-16 overflow-hidden text-center">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Brain size={12} /> AI Legal Issue Decoder
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-serif font-bold text-white mb-5 tracking-tight leading-tight"
          >
            Decode Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Legal Situation</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Describe your situation in plain English. Our AI will identify relevant laws,
            assess your position, and suggest the most effective next steps.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-6 mt-6 text-xs font-bold text-slate-600"
          >
            {['IPC Analysis', 'Consumer Rights', 'Property Law', 'Labour Code'].map((tag, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" />{tag}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-4xl mx-auto px-6 pb-20">

        {/* INPUT CARD */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl group hover:border-indigo-500/20 transition-all duration-500">

            {/* Card Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Scale size={16} />
              </div>
              <span className="text-sm font-bold text-slate-300">Describe Your Situation</span>
              <span className="ml-auto text-xs text-slate-600">{!user ? "1 free analysis — no login" : "Unlimited analyses"}</span>
            </div>

            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., 'I bought a laptop online but it stopped working after 10 days. The seller is refusing to replace it. What are my rights under consumer protection law?'"
              className="w-full bg-transparent border-none text-white p-6 text-base placeholder:text-slate-600 outline-none resize-none leading-relaxed"
            />

            {/* Suggested questions */}
            {!text && (
              <div className="px-6 pb-4">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Common queries</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setText(ex)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-indigo-300 bg-white/3 hover:bg-indigo-500/10 border border-white/8 hover:border-indigo-500/30 rounded-lg transition flex items-center gap-1.5"
                    >
                      <ChevronRight size={11} className="text-indigo-500" />
                      {ex.length > 45 ? ex.slice(0, 45) + '...' : ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer bar */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                <Shield size={12} className="text-emerald-500" />
                <span>End-to-end encrypted • Not stored</span>
              </div>
              <button
                onClick={analyze}
                disabled={loading || !text.trim()}
                className="px-7 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 disabled:opacity-40 disabled:shadow-none flex items-center gap-2 group/btn text-sm"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                ) : (
                  <>Analyze <Zap size={15} className="group-hover/btn:fill-current transition" /></>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* LOADING STATE */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 text-center py-16"
            >
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                <Brain className="absolute inset-0 m-auto text-indigo-400" size={28} />
              </div>
              <p className="text-indigo-400 font-bold animate-pulse mb-1">Consulting Indian Law Database...</p>
              <p className="text-slate-600 text-sm">Matching IPC, CrPC, consumer laws & recent judgements</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULTS */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">

              {/* Success header */}
              <div className="flex items-center gap-3 px-5 py-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Sparkles size={16} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-400 font-bold text-sm">Analysis Complete</p>
                  <p className="text-xs text-slate-500">Powered by NyayLM-70B • Based on Indian Law</p>
                </div>
                <button
                  onClick={() => { setResult(null); setText(""); }}
                  className="ml-auto text-xs text-slate-500 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
                >
                  New Analysis
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <ResultCard
                  title="Summary"
                  text={result.summary}
                  icon={<BookOpen size={18} />}
                  color="blue"
                  delay={0}
                />
                <ResultCard
                  title="Relevant Laws"
                  list={result.laws}
                  icon={<Scale size={18} />}
                  color="purple"
                  delay={0.1}
                />
                <ResultCard
                  title="Suggested Action"
                  text={result.advice}
                  icon={<CheckCircle size={18} />}
                  color="emerald"
                  delay={0.2}
                />
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/marketplace"
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition text-center flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <MessageSquare size={16} /> Consult a Real Lawyer <ArrowRight size={15} />
                </Link>
                <Link
                  to="/assistant"
                  className="flex-1 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-2xl transition text-center flex items-center justify-center gap-2"
                >
                  Ask AI Follow-up Questions
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Not logged in note */}
        {!user && !result && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-center text-xs text-slate-600 mt-8"
          >
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold">Create a free account</Link> to unlock unlimited AI analyses and save your results.
          </motion.p>
        )}
      </section>

      <Footer />
    </div>
  );
}

function ResultCard({ title, text, list, color, icon, delay }) {
  const colors = {
    blue: "bg-blue-500/8 border-blue-500/20 text-blue-400",
    purple: "bg-purple-500/8 border-purple-500/20 text-purple-400",
    emerald: "bg-emerald-500/8 border-emerald-500/20 text-emerald-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-lg hover:border-white/20 transition duration-300 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />

      <div className={`w-10 h-10 rounded-xl ${colors[color]} border flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-bold text-white text-base mb-3">{title}</h3>
      {text && <p className="text-sm text-slate-400 leading-relaxed">{text}</p>}
      {list && (
        <ul className="text-sm text-slate-400 space-y-2">
          {list.map((item, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="text-indigo-500 mt-0.5 flex-shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
