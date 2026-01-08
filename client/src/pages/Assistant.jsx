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
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import { useNavigate } from "react-router-dom";
import PaywallModal from "../components/PaywallModal";
import { useAuth } from "../context/AuthContext";

export default function Assistant() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello ${user?.name?.split(' ')[0] || ''}! 👋 I’m NyaySathi AI.  \nI can analyze cases, draft legal notices, or explain laws in simple terms.  \n**Try asking:** "Draft a notice for a bounced cheque" or "Is implied consent valid in India?"`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Notice Generation State
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeData, setNoticeData] = useState({
    type: "Cheque Bounce",
    recipientName: "",
    recipientAddress: "",
    amount: "",
    dateOfIncident: "",
    details: ""
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/api/ai/assistant", {
        question: input,
        language: "English", // Could be dynamic
        location: "India",
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer },
      ]);
    } catch (err) {
      if (err.response?.status === 403) {
        setShowPaywall(true);
        // Remove the user message if it failed or add an error message? 
        // Better to just show paywall.
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ Sorry, I encountered an error. Please try again." },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeDraft = async () => {
    setShowNoticeForm(false);
    setLoading(true);
    const userMsg = { role: "user", content: `Draft a Legal Notice for ${noticeData.type}` };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await axios.post("/api/ai/draft-notice", noticeData);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.notice },
      ]);
    } catch (err) {
      if (err.response?.status === 403) {
        setShowPaywall(true);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ Failed to draft notice. Please try again." },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pt-20 font-sans text-slate-900">
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col p-4 md:p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0B1120]">AI Legal Companion</h1>
            <p className="text-slate-500 text-sm font-medium">Powered by Gemini Pro • India Jurisdiction</p>
          </div>
          <button
            onClick={() => setShowNoticeForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold text-sm transition"
          >
            <span>📝</span> Draft Notice
          </button>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] p-5 rounded-2xl text-base leading-relaxed shadow-sm
                  ${msg.role === "user"
                    ? "bg-[#0B1120] text-white rounded-br-none"
                    : "bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none"
                  }`}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl rounded-bl-none flex gap-2 items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-2 shadow-lg shadow-slate-200/50 flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask anything about Indian Law..."
            className="flex-1 bg-transparent border-none focus:ring-0 p-3 max-h-32 resize-none text-slate-800 placeholder-slate-400 font-medium"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-3 bg-[#0B1120] text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
          >
            <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>

      {/* NOTICE DRAFTING MODAL */}
      {showNoticeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0B1120]">Draft Legal Notice</h2>
              <button
                onClick={() => setShowNoticeForm(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
              >✕</button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Notice Type</label>
                <select
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                  value={noticeData.type}
                  onChange={e => setNoticeData({ ...noticeData, type: e.target.value })}
                >
                  <option>Cheque Bounce</option>
                  <option>Divorce Notice</option>
                  <option>Property Dispute</option>
                  <option>Consumer Complaint</option>
                  <option>Employment Dispute</option>
                  <option>Defamation Notice</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Recipient Name</label>
                  <input
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={noticeData.recipientName}
                    onChange={e => setNoticeData({ ...noticeData, recipientName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Date of Incident</label>
                  <input
                    type="date"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={noticeData.dateOfIncident}
                    onChange={e => setNoticeData({ ...noticeData, dateOfIncident: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Key Details</label>
                <textarea
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-none h-24 resize-none"
                  placeholder="Describe what happened..."
                  value={noticeData.details}
                  onChange={e => setNoticeData({ ...noticeData, details: e.target.value })}
                />
              </div>
            </div>

            <button
              onClick={handleNoticeDraft}
              className="w-full mt-8 py-3.5 bg-[#0B1120] text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-900/10"
            >
              Generate Notice
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
