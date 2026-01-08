import { useState } from "react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import { useNavigate } from "react-router-dom";
import PaywallModal from "../components/PaywallModal";

export default function Agreements() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const navigate = useNavigate();

  const analyzeAgreement = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post("/api/ai/agreement", { text });
      setResult(res.data);
      if (res.data.isLocked) {
        setShowPaywall(true);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setShowPaywall(true);
      } else if (err.response?.status === 401) {
        navigate("/login");
      } else {
        alert("Analysis failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'high': return 'text-rose-700 bg-rose-50 border-rose-200';
      default: return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 pb-20 pt-24 font-sans">
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-[#0B1120] mb-3 tracking-tight">
            AI Agreement Analyzer
          </h1>
          <p className="text-slate-500 text-lg">
            Detect hidden risks and missing clauses in seconds.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* INPUT AREA */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 flex flex-col h-[600px] transition-shadow hover:shadow-md">
            <textarea
              className="flex-1 w-full bg-slate-50 p-6 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 placeholder-slate-400 font-medium leading-relaxed"
              placeholder="Paste your agreement text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="p-4 bg-white border-t border-slate-100 flex justify-end rounded-b-xl">
              <button
                onClick={analyzeAgreement}
                disabled={loading || !text.trim()}
                className={`px-8 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-lg shadow-blue-900/20
                  ${loading || !text.trim() ? "bg-slate-300 cursor-not-allowed" : "bg-[#0B1120] hover:bg-blue-700"}`}
              >
                {loading ? "Analyzing..." : "Analyze Now"}
              </button>
            </div>
          </section>

          {/* OUTPUT AREA */}
          <section className="bg-slate-50 rounded-2xl border border-slate-200 h-[600px] overflow-hidden flex flex-col relative">
            {!result ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl mb-4 flex items-center justify-center shadow-sm border border-slate-100">
                  <span className="text-3xl">📄</span>
                </div>
                <p className="font-medium">Analysis results will appear here</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                {/* METRICS */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Accuracy Score</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-extrabold text-[#0B1120]">{result.accuracyScore || 0}%</span>
                      <div className="h-2 flex-1 bg-slate-100 rounded-full mb-2 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${result.accuracyScore || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className={`p-5 rounded-xl border shadow-sm ${getRiskColor(result.riskLevel)}`}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Risk Level</p>
                    <p className="text-2xl font-extrabold capitalize">{result.riskLevel || 'Unknown'}</p>
                  </div>
                </div>

                {/* MISSING CLAUSES */}
                {result.missingClauses?.length > 0 && (
                  <div className="bg-rose-50 rounded-xl p-5 border border-rose-100">
                    <h3 className="font-bold text-rose-800 mb-3 flex items-center gap-2">
                      <span>⚠️</span> Missing Critical Clauses
                    </h3>
                    <ul className="space-y-2">
                      {result.missingClauses.map((clause, i) => (
                        <li key={i} className="flex items-start gap-2 text-rose-700 text-sm font-medium">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                          {clause}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* DETAILED ANALYSIS */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-[#0B1120] mb-4 text-lg border-b border-slate-100 pb-3">Detailed Analysis</h3>
                  <div className="prose prose-slate prose-sm max-w-none text-slate-600">
                    <ReactMarkdown>{result.analysisText}</ReactMarkdown>
                  </div>
                </div>

              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
