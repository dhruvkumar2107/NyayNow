import { useState } from "react";
import axios from "axios";

export default function Analyze() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post("/api/ai/case-analysis", { text });
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
          Legal Issue Analysis
        </h1>
        <p className="text-gray-500 mb-8 max-w-2xl">
          Describe your legal issue and get AI-powered legal insights.
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <textarea
            rows={7}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Explain your legal issue in detail..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900"
          />

          <button
            onClick={analyze}
            className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white transition shadow-md shadow-blue-200"
          >
            Analyze Issue
          </button>
        </div>

        {loading && (
          <div className="mt-8 text-blue-600 font-medium flex items-center gap-2">
            <span className="animate-spin text-xl">⏳</span> Analyzing your issue…
          </div>
        )}

        {result && (
          <div className="mt-10 grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <InfoCard title="📌 Summary" text={result.summary} icon="📌" color="bg-blue-50 border-blue-100 text-blue-900" />
            <InfoCard title="⚖️ Relevant Laws" list={result.laws} icon="⚖️" color="bg-purple-50 border-purple-100 text-purple-900" />
            <InfoCard title="✅ Suggested Action" text={result.advice} icon="✅" color="bg-emerald-50 border-emerald-100 text-emerald-900" />
          </div>
        )}
      </div>
    </main>
  );
}

function InfoCard({ title, text, list, color }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-full`}>
      <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">{title}</h3>
      {text && <p className="text-sm text-gray-600 leading-relaxed">{text}</p>}
      {list && (
        <ul className="text-sm text-gray-600 space-y-3">
          {list.map((item, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
