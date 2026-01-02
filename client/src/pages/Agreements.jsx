import { useState } from "react";
import axios from "axios";

export default function Agreements() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------
     REAL AI ANALYSIS
  ------------------------------------------- */
  const analyzeAgreement = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post("/api/ai/agreement", { text });

      // The AI route returns structured data { risks, clauses, redFlags }
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 pb-20 pt-24">
      <div className="max-w-[1128px] mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Agreement Analyzer
        </h1>
        <p className="text-gray-500 mb-8 max-w-2xl">
          Paste your agreement text below and let AI highlight risks, clauses,
          and red flags.
        </p>

        {/* INPUT AREA */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste agreement text here..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900"
          />

          <button
            onClick={analyzeAgreement}
            className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white transition shadow-md shadow-blue-200"
          >
            Analyze Agreement
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="mt-8 text-blue-600 font-medium flex items-center gap-2">
            <span className="animate-spin text-xl">⏳</span> Analyzing agreement…
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div className="mt-10 grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ResultCard
              title="⚠️ Risks"
              items={result.risks}
              titleColor="text-red-600"
              bgColor="bg-red-50"
              borderColor="border-red-100"
            />
            <ResultCard
              title="📄 Important Clauses"
              items={result.clauses}
              titleColor="text-blue-600"
              bgColor="bg-blue-50"
              borderColor="border-blue-100"
            />
            <ResultCard
              title="🚩 Red Flags"
              items={result.redFlags}
              titleColor="text-amber-600"
              bgColor="bg-amber-50"
              borderColor="border-amber-100"
            />
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------------- COMPONENT ---------------- */

function ResultCard({ title, items, titleColor, bgColor, borderColor }) {
  return (
    <div
      className={`bg-white border ${borderColor} rounded-2xl p-6 shadow-sm`}
    >
      <h3 className={`text-lg font-bold mb-4 ${titleColor} flex items-center gap-2`}>{title}</h3>
      <ul className="space-y-3 text-sm text-gray-600">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${titleColor.replace('text', 'bg')}`}></span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
