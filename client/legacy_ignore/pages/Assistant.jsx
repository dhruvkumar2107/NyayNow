'use client'

import { useState, useRef, useEffect, useMemo } from "react";
import { Copy, ThumbsUp, ThumbsDown, Send, Paperclip, Mic, Plus, Trash2, ShieldAlert, ArrowRight, Download, ExternalLink, Clock, UserCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../../src/components/Navbar";
import { useLanguage } from "../../src/context/LanguageContext";
import { useAuth } from "../../src/context/AuthContext";
import { jsPDF } from "jspdf";

export default function Assistant() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const router = useRouterWrapper();

  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Greetings. I am your specialized Legal AI Assistant. I can help you research case laws, draft clauses, or analyze legal documents. How may I accept your brief today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: ["BNS 2024", "Indian Constitution"]
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const messagesEndRef = useRef(null);

  // Guest Gating state
  const [guestQueries, setGuestQueries] = useState(0);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Initialize guest query counter from local storage
  useEffect(() => {
    if (!user) {
      const stored = parseInt(localStorage.getItem("nyaynow_guest_queries") || "0");
      setGuestQueries(stored);
    }
  }, [user]);

  // Safe router lookup for Next.js app router client
  function useRouterWrapper() {
    try {
      return useRouter();
    } catch (e) {
      return { push: (url) => { if (typeof window !== "undefined") window.location.href = url; } };
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchChatSessions();
  }, []);

  const fetchChatSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const { data } = await axios.get("/api/chats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatSessions(data);
    } catch (err) {
      console.error("Failed to fetch chat sessions:", err);
    }
  };

  const handleSelectChat = (chat) => {
    setActiveChatId(chat._id);
    setMessages(chat.messages.map(m => ({
      role: m.role,
      text: m.text,
      timestamp: m.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: m.citations || ["BNS 2024"]
    })));
  };

  const handleDeleteChat = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.delete(`/api/chats/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Chat deleted");
      if (activeChatId === id) {
        handleNewChat();
      }
      fetchChatSessions();
    } catch (err) {
      console.error("Delete chat error:", err);
      toast.error("Failed to delete chat session");
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([
      {
        role: "model",
        text: "New session started. How can I assist you with your legal research or drafting today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ["BNS 2024"]
      },
    ]);
    setInput("");
  };

  const handleRecentInquiry = (label) => {
    setMessages([
      { role: "user", text: `I want to discuss: ${label}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      { 
        role: "model", 
        text: `Understood. Loading historical context for **${label}**. How would you like to proceed with the analysis?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: ["BNS 2024"]
      }
    ]);
  };

  // Click Suggestion Chip helper
  const handleSuggestionClick = (promptText) => {
    setInput(promptText);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check Guest Gating limit
    if (!user) {
      const stored = parseInt(localStorage.getItem("nyaynow_guest_queries") || "0");
      if (stored >= 2) {
        setShowSignupModal(true);
        toast.error("Guest limit reached. Please register to continue.", { id: "guest-gate-err" });
        return;
      }
      const updated = stored + 1;
      localStorage.setItem("nyaynow_guest_queries", updated.toString());
      setGuestQueries(updated);
    }

    const currentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { 
      role: "user", 
      text: input,
      timestamp: currentTimestamp
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    const currentHistory = messages;
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.post("/api/ai/assistant", {
        question: currentInput,
        language: language,
        history: currentHistory.map(m => ({
          role: m.role === "model" ? "assistant" : "user",
          content: m.text
        }))
      }, { headers });

      // Extract citation tags from AI response
      const extractedCitations = [];
      if (data.answer.includes("303")) extractedCitations.push("BNS Sec 303");
      if (data.answer.includes("318")) extractedCitations.push("BNS Sec 318");
      if (data.answer.includes("117")) extractedCitations.push("BNS Sec 117");
      if (extractedCitations.length === 0) extractedCitations.push("BNS 2024");

      const assistantMessage = { 
        role: "model", 
        text: data.answer || data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: extractedCitations
      };
      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      if (token) {
        if (!activeChatId) {
          const title = currentInput.slice(0, 30) + (currentInput.length > 30 ? "..." : "");
          const createRes = await axios.post("/api/chats", {
            title,
            messages: finalMessages
          }, { headers });
          setActiveChatId(createRes.data._id);
          fetchChatSessions();
        } else {
          await axios.put(`/api/chats/${activeChatId}`, {
            messages: finalMessages
          }, { headers });
          fetchChatSessions();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Assistant is busy. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Document PDF Export with Watermark
  const handleExportPDF = () => {
    if (messages.length <= 1) {
      return toast.error("No conversation history to export.");
    }
    
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    
    // Add title
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("NyayNow AI Consultation Brief", 20, 25);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 32);
    
    // Add divider
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(20, 38, 190, 38);
    
    let y = 48;
    messages.forEach((msg) => {
      const roleText = msg.role === "user" ? "USER" : "NYAYNOW AI ASSISTANT";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(msg.role === "user" ? 79 : 37, msg.role === "user" ? 70 : 99, msg.role === "user" ? 229 : 235);
      doc.text(roleText, 20, y);
      y += 6;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85); // slate-700
      
      const cleanText = msg.text.replace(/[\*\#\_]/g, ""); // strip markdown styling
      const splitText = doc.splitTextToSize(cleanText, 170);
      
      splitText.forEach((line) => {
        if (y > 270) {
          // Add watermark at the bottom of the page before adding a new one
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(220, 38, 38); // red-600
          doc.text("AI-generated. Review with an advocate.", 105, 285, { align: "center" });
          
          doc.addPage();
          y = 25;
          
          // Reprint header boundary lines
          doc.setDrawColor(226, 232, 240);
          doc.line(20, 15, 190, 15);
          y = 25;
        }
        doc.text(line, 20, y);
        y += 5;
      });
      y += 8;
    });
    
    // Add watermark on last page
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(220, 38, 38); // red-600
    doc.text("AI-generated. Review with an advocate.", 105, 285, { align: "center" });
    
    doc.save("NyayNow_Consultation_Brief.pdf");
    toast.success("Consultation exported with secure watermarking!");
  };

  // Consult Lawyer Handoff Router
  const handleConsultLawyer = (aiOutputText) => {
    localStorage.setItem("nyaynow_pending_enquiry", JSON.stringify({
      brief: aiOutputText.slice(0, 1000)
    }));
    toast.success("Redirecting to Marketplace. Query pre-populated!");
    router.push("/marketplace");
  };

  return (
    <div className="flex flex-col h-screen bg-[#0c1220] text-slate-200 font-sans overflow-hidden pt-20 md:pt-24 relative">
      <Navbar />

      {/* STICKY ALWAYS-ON DISCLAIMER BAR */}
      <div className="bg-[#dc2626]/10 border-b border-[#dc2626]/20 py-2.5 px-6 text-center text-xs text-red-400 font-bold flex items-center justify-center gap-2 relative z-10">
        ⚖️ <span>AI-generated legal information grounded in India's codes. Not legal advice.</span>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR HISTORY */}
        <aside className="w-80 border-r border-white/5 bg-[#0a0f1d] hidden md:flex flex-col">
          <div className="p-6">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-lg shadow-indigo-600/20 group font-bold text-sm tracking-wide"
            >
              <Plus size={18} /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Recent Inquiries</p>
            {chatSessions.length > 0 ? (
              chatSessions.map((chat) => (
                <div
                  key={chat._id}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition truncate group ${activeChatId === chat._id ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                >
                  <span className="truncate flex-1" onClick={() => handleSelectChat(chat)}>{chat.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 transition"
                    title="Delete Conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <>
                <HistoryItem label="Property Dispute Delhi" onClick={() => handleRecentInquiry("Property Dispute Delhi")} />
                <HistoryItem label="Draft Lease Agreement" onClick={() => handleRecentInquiry("Draft Lease Agreement")} />
                <HistoryItem label="IPC 420 Analysis" onClick={() => handleRecentInquiry("IPC 420 Analysis")} />
                <HistoryItem label="Divorce Proceedings" onClick={() => handleRecentInquiry("Divorce Proceedings")} />
              </>
            )}
          </div>
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center text-midnight-900 font-bold text-xs">P</div>
              <div>
                <p className="text-sm font-bold text-white">Pro Plan</p>
                <p className="text-[10px] text-gold-500">Unlimited Queries</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CHAT AREA */}
        <main className="flex-1 flex flex-col relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">

          {/* HEADER */}
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-midnight-900/80 backdrop-blur-md z-10 sticky top-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h2 className="font-serif text-lg font-bold text-white leading-none">AI Legal Assistant</h2>
                <p className="text-[10px] text-slate-400">Powered by NyayLM-70B</p>
              </div>
            </div>
            <div className="flex gap-4 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer">
              <button onClick={handleExportPDF} className="flex items-center gap-1 hover:text-white">
                <Download size={14} /> Export PDF
              </button>
            </div>
          </header>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 scroll-smooth">
            {messages.map((msg, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i}
                className={`flex gap-4 max-w-4xl mx-auto ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === "model" ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white" : "bg-slate-700 text-slate-300"}`}>
                  {msg.role === "model" ? "⚖️" : "👤"}
                </div>

                <div className={`flex-1 space-y-2.5 ${msg.role === "user" ? "text-right" : ""}`}>
                  <div className={`inline-block p-5 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-sm"
                    }`}>
                    {msg.role === "model" ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>

                  {msg.role === "model" && (
                    <div className="flex flex-wrap items-center justify-between gap-3 text-slate-500 px-2">
                      <div className="flex items-center gap-3">
                        <button className="hover:text-white transition" onClick={() => { navigator.clipboard.writeText(msg.text); toast.success("Copied to clipboard!"); }}><Copy size={14} /></button>
                        <button className="hover:text-white transition"><ThumbsUp size={14} /></button>
                        <button className="hover:text-white transition"><ThumbsDown size={14} /></button>
                      </div>

                      {/* CITATION METADATA & HANDOFF */}
                      <div className="flex items-center gap-3">
                        {msg.citations?.map((cit) => (
                          <span key={cit} className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                            <Clock size={10} /> {cit} (June 2026)
                          </span>
                        ))}
                        <button
                          onClick={() => handleConsultLawyer(msg.text)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider transition-all"
                        >
                          <UserCheck size={11} /> Consult Lawyer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex gap-4 max-w-4xl mx-auto">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center shrink-0 animate-pulse">⚖️</div>
                <div className="flex items-center gap-1 h-10">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA WITH SUGGESTION CHIPS */}
          <div className="p-6 pb-8 max-w-4xl mx-auto w-full">
            {/* SUGGESTION CHIPS */}
            {messages.length <= 1 && (
              <div className="mb-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Common Inquiries</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "FIR rights under BNSS 2024",
                    "Eviction rules for tenant",
                    "Cheating under BNS Section 318",
                    "Employment termination notice"
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleSuggestionClick(chip)}
                      className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/5 hover:border-indigo-500/30 text-xs text-slate-400 hover:text-white transition-all duration-300"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden group focus-within:border-indigo-500/50 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Ask a legal question..."
                className="w-full bg-transparent border-none text-white placeholder-slate-500 p-4 pr-32 focus:ring-0 resize-none h-20 scrollbar-hide appearance-none outline-none"
                style={{ color: 'white' }}
              />

              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-white/5">
                  <Paperclip size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-white/5">
                  <Mic size={18} />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50 disabled:hover:bg-indigo-600"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            
            {/* Watermark notice */}
            <p className="text-center text-[10px] text-slate-600 mt-3 flex items-center justify-center gap-1.5 uppercase tracking-wider font-bold">
              <span>NyayNow AI can make mistakes. Always review generated documents with an advocate.</span>
            </p>
          </div>

        </main>
      </div>

      {/* GUEST SIGNUP MODAL INTERCEPT */}
      <AnimatePresence>
        {showSignupModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#020617] border border-white/10 p-8 rounded-3xl max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6">
                <ShieldAlert size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Guest Limit Reached</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                You have reached your 2-query free trial limit. Create a free account to continue asking legal queries, generating notices, and consulting verified advocates.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setShowSignupModal(false); router.push("/register"); }}
                  className="w-full py-4 bg-white text-slate-950 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                >
                  Create Free Account
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => { setShowSignupModal(false); router.push("/login"); }}
                  className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl text-sm transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => setShowSignupModal(false)}
                  className="text-xs text-slate-500 hover:text-slate-300 font-bold uppercase tracking-wider text-center mt-4"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HistoryItem({ label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition mb-1 truncate ${active ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
    >
      {label}
    </div>
  )
}
