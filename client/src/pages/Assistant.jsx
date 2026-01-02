// // import { useState } from "react";

// // export default function Assistant() {
// //   const [messages, setMessages] = useState([
// //     {
// //       role: "assistant",
// //       content: "Hello 👋 I’m your AI Legal Assistant. Ask me any legal question.",
// //     },
// //   ]);
// //   const [input, setInput] = useState("");
// //   const [loading, setLoading] = useState(false);

// //   const sendMessage = async () => {
// //     if (!input.trim()) return;

// //     const userMsg = { role: "user", content: input };
// //     setMessages((prev) => [...prev, userMsg]);
// //     setInput("");
// //     setLoading(true);

// //     // TEMP response (API will be wired later)
// //     setTimeout(() => {
// //       setMessages((prev) => [
// //         ...prev,
// //         {
// //           role: "assistant",
// //           content:
// //             "Thanks for your question. I will analyze it based on Indian law and respond accurately.",
// //         },
// //       ]);
// //       setLoading(false);
// //     }, 1000);
// //   };

// //   return (
// //     <main className="min-h-screen bg-gradient-to-b from-slate-950 to-black text-white">
// //       <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-80px)]">
// //         <h1 className="text-3xl font-bold mb-4 text-indigo-400">
// //           AI Legal Assistant
// //         </h1>

// //         {/* CHAT AREA */}
// //         <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
// //           {messages.map((msg, i) => (
// //             <div
// //               key={i}
// //               className={`max-w-[75%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
// //                 msg.role === "user"
// //                   ? "ml-auto bg-indigo-600 text-white"
// //                   : "bg-slate-800 text-slate-200"
// //               }`}
// //             >
// //               {msg.content}
// //             </div>
// //           ))}

// //           {loading && (
// //             <div className="bg-slate-800 text-slate-400 px-4 py-3 rounded-xl w-fit">
// //               Typing…
// //             </div>
// //           )}
// //         </div>

// //         {/* INPUT */}
// //         <div className="mt-4 flex gap-2">
// //           <input
// //             value={input}
// //             onChange={(e) => setInput(e.target.value)}
// //             placeholder="Ask your legal question..."
// //             className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500"
// //           />
// //           <button
// //             onClick={sendMessage}
// //             className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold"
// //           >
// //             Send
// //           </button>
// //         </div>
// //       </div>
// //     </main>
// //   );
// // }
// import { useState } from "react";
// import axios from "axios";

// export default function Assistant() {
//   const [messages, setMessages] = useState([
//     { role: "assistant", content: "Hello 👋 I’m your AI Legal Assistant." },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userText = input;
//     setMessages((m) => [...m, { role: "user", content: userText }]);
//     setInput("");
//     setLoading(true);

//     try {
//       const res = await axios.post("/api/assistant", {
//         question: userText,
//         language: "English",
//         location: "India",
//       });

//       setMessages((m) => [
//         ...m,
//         { role: "assistant", content: res.data.answer },
//       ]);
//     } catch {
//       setMessages((m) => [
//         ...m,
//         {
//           role: "assistant",
//           content: "⚠️ Unable to reach AI service.",
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-black text-white p-6">
//       <div className="max-w-3xl mx-auto space-y-4">
//         {messages.map((m, i) => (
//           <div key={i} className={m.role === "user" ? "text-right" : ""}>
//             <span className="inline-block bg-slate-800 p-3 rounded-xl">
//               {m.content}
//             </span>
//           </div>
//         ))}
//         {loading && <p>Typing…</p>}
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           className="w-full p-3 bg-slate-900 rounded"
//           placeholder="Ask a legal question…"
//         />
//         <button onClick={sendMessage} className="bg-indigo-600 px-4 py-2 rounded">
//           Send
//         </button>
//       </div>
//     </main>
//   );
// }
import { useState } from "react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello 👋 I’m your AI Legal Assistant. Ask me any legal question.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Phase 1 Features
  const [language, setLanguage] = useState("English");
  const [showFirModal, setShowFirModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [modalInput, setModalInput] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const languages = ["English", "Hindi", "Marathi", "Kannada", "Tamil", "Telugu", "Bengali", "Gujarati", "Malayalam", "Punjabi"];

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/api/ai/assistant", {
        question: userText,
        language: language,
        location: "India",
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err.response?.data?.answer || `Error: ${err.message}` || "⚠️ Unable to reach AI service.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateDocument = async (type) => {
    if (!modalInput.trim()) return;
    setModalLoading(true);
    // Close modal immediately to show loading in chat
    if (type === 'fir') setShowFirModal(false);
    if (type === 'notice') setShowNoticeModal(false);

    setMessages((prev) => [...prev, { role: "user", content: `Drafting ${type === 'fir' ? 'FIR' : 'Legal Notice'}...` }]);
    setLoading(true); // Show main chat loading

    try {
      let endpoint = type === 'fir' ? '/api/ai/draft-fir' : '/api/ai/draft-notice';
      let payload = type === 'fir'
        ? { incident_details: modalInput, language, location: "India" }
        : { notice_details: modalInput, language, type: "Legal Notice" };

      const res = await axios.post(endpoint, payload);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.draft },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Failed to generate document." },
      ]);
    } finally {
      setModalLoading(false);
      setLoading(false);
      setModalInput("");
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 pb-32 pt-24">
      <div className="max-w-[1128px] mx-auto px-6 space-y-6">

        {/* TOP TOOLBAR */}
        <div className="flex flex-wrap gap-3 justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm sticky top-24 z-10">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-50 text-gray-700 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 outline-none"
          >
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFirModal(true)}
              className="text-xs md:text-sm px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-lg transition-colors flex items-center gap-1 font-medium bg-gradient-to-r from-blue-50 to-indigo-50"
            >
              🚓 Draft FIR
            </button>
            <button
              onClick={() => setShowNoticeModal(true)}
              className="text-xs md:text-sm px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-lg transition-colors flex items-center gap-1 font-medium bg-gradient-to-r from-blue-50 to-indigo-50"
            >
              ⚖️ Legal Notice
            </button>
          </div>
        </div>

        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-5 rounded-2xl max-w-[85%] shadow-sm ${m.role === "user"
              ? "ml-auto bg-blue-600 text-white"
              : "bg-white border border-gray-200 text-gray-800"
              }`}
          >
            {m.role === 'assistant' && <div className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">AI Assistant</div>}
            <div className={`prose max-w-none text-sm md:text-base leading-relaxed ${m.role === "user" ? "prose-invert" : "prose-slate"}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {m.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="bg-white border border-gray-200 p-4 rounded-2xl w-fit shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-200 p-4">
        <div className="max-w-[1128px] mx-auto flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={`Ask a legal question in ${language}...`}
            className="flex-1 p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-gray-900 placeholder:text-gray-400 shadow-inner"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all shadow-md shadow-blue-200"
          >
            Send
          </button>
        </div>
      </div>

      {/* MODALS */}
      {showFirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">Draft Police FIR</h3>
            <p className="text-sm text-gray-500">Describe the incident chronologically. Include dates, times, and locations.</p>
            <textarea
              rows={6}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900"
              placeholder="E.g. I was walking near Koramangala park at 8 PM when..."
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowFirModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition font-medium">Cancel</button>
              <button
                onClick={() => generateDocument('fir')}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-200"
                disabled={modalLoading}
              >
                {modalLoading ? "Generating..." : "Generate FIR"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">Draft Legal Notice</h3>
            <p className="text-sm text-gray-500">Who is this for? What are your grievances and demands?</p>
            <textarea
              rows={6}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900"
              placeholder="E.g. Notice to tenant Mr. Sharma for unpaid rent of 3 months..."
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNoticeModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition font-medium">Cancel</button>
              <button
                onClick={() => generateDocument('notice')}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-200"
                disabled={modalLoading}
              >
                {modalLoading ? "Generating..." : "Generate Notice"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
