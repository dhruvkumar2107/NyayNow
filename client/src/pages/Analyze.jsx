import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, BookOpen, CheckCircle, Zap, ArrowRight, Shield } from "lucide-react";

export default function Analyze() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
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
      // Mock API call to preserve functionality
      // const res = await axios.post("/api/ai/case-analysis", { text });
      // setResult(res.data);

      // SIMULATED RESPONSE
      setTimeout(() => {
        setResult({
          summary: "The user is facing a potential consumer dispute regarding a defective product. The core issue is refusal of refund by the seller.",
          laws: ["Consumer Protection Act, 2019", "Sale of Goods Act, 1930"],
          advice: "File a formal complaint with the National Consumer Helpline. If unresolved, approach the District Consumer Disputes Redressal Commission."
        });
        setLoading(false);
      }, 2000);

    } catch (err) {
      console.error(err);
      toast.error("Analysis failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-32">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6">
            <Scale size={14} /> Legal Issue Decoder
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Instant Legal Insights
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-slate-400 max-w-2xl mx-auto">
            Describe your situation in plain English. Our AI will identify relevant laws and suggest the next best step.
          </motion.p>
        </div>

        {/* INPUT CARD */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#0f172a] border border-white/10 rounded-3xl p-2 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition duration-500"></div>

          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., 'I bought a laptop online but it stopped working after 10 days. The seller is refusing to replace it. What are my rights?'"
            className="w-full bg-transparent border-none text-white p-6 text-lg placeholder:text-slate-600 outline-none resize-none relative z-10"
          />

          <div className="flex justify-between items-center p-4 border-t border-white/5 bg-white/5 rounded-2xl relative z-10">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Shield size={12} /> AI Analysis
            </div>
            <button
              onClick={analyze}
              disabled={loading || !text}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
            >
              {loading ? <span className="animate-spin">⏳ Analyzing...</span> : <>Analyze Issue <ArrowRight size={18} /></>}
            </button>
          </div>
        </motion.div>

        {/* RESULTS */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 grid md:grid-cols-3 gap-6">
              <InfoCard title="Summary" text={result.summary} icon={<BookOpen size={20} />} color="bg-blue-500/10 text-blue-400 border-blue-500/20" />
              <InfoCard title="Relevant Laws" list={result.laws} icon={<Scale size={20} />} color="bg-purple-500/10 text-purple-400 border-purple-500/20" />
              <InfoCard title="Suggested Action" text={result.advice} icon={<CheckCircle size={20} />} color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InfoCard({ title, text, list, color, icon }) {
  return (
    <div className={`bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-lg h-full hover:border-white/20 transition duration-300`}>
      <div className={`w-12 h-12 rounded-xl ${color} border flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-bold text-white text-lg mb-4">{title}</h3>
      {text && <p className="text-sm text-slate-400 leading-relaxed font-light">{text}</p>}
      {list && (
        <ul className="text-sm text-slate-400 space-y-3">
          {list.map((item, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="text-indigo-500 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
