'use client'
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import { useRouter } from "next/navigation";
import Link from "next/link";
import PaywallModal from "../../src/components/PaywallModal";
import { useAuth } from "../../src/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Shield, AlertTriangle, Zap, Upload,
  Database, Lock, Key, RefreshCw, Eye, Download, X, Loader2
} from "lucide-react";

export default function Agreements() {
  // Navigation & tabs
  const [activeTab, setActiveTab] = useState("scan"); // "scan" | "vault"
  const [inputType, setInputType] = useState("text"); // "text" | "file"
  
  // Scans & Analysis
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Database Vault Items
  const [vaultItems, setVaultItems] = useState([]);
  const [vaultLoading, setVaultLoading] = useState(false);
  
  // Modal states
  const [showPaywall, setShowPaywall] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [selectedItemToView, setSelectedItemToView] = useState(null);
  const [selectedItemToSign, setSelectedItemToSign] = useState(null);
  
  // Form fields
  const [docType, setDocType] = useState("Evidence Scan");
  const [partyA, setPartyA] = useState("");
  const [partyB, setPartyB] = useState("");
  const [signerName, setSignerName] = useState("");
  const [aadhaarNo, setAadhaarNo] = useState("");
  const [isSigning, setIsSigning] = useState(false);

  const router = useRouter();
  const { user } = useAuth();

  // Load vault items when user changes or switches to vault tab
  useEffect(() => {
    if (user) {
      fetchVaultItems();
    }
  }, [user, activeTab]);

  const fetchVaultItems = async () => {
    setVaultLoading(true);
    try {
      const res = await axios.get("/api/agreements");
      setVaultItems(res.data || []);
    } catch (err) {
      console.error("Failed to fetch vault items", err);
      // Don't toast on initial load if user isn't logged in
      if (user) {
        toast.error("Failed to load vault items.");
      }
    } finally {
      setVaultLoading(false);
    }
  };

  const analyzeAgreement = async () => {
    if (inputType === "text" && !text.trim()) {
      toast.error("Please enter some text to analyze.");
      return;
    }
    if (inputType === "file" && !file) {
      toast.error("Please upload a PDF file first.");
      return;
    }

    if (!user) {
      const usage = parseInt(localStorage.getItem("guest_ai_usage") || "0");
      if (usage >= 1) {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="font-bold">Login to continue using AI 🔒</span>
            <span className="text-xs">Guest limit reached (1 free chat)</span>
            <Link href="/login" onClick={() => toast.dismiss(t.id)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold text-center mt-1">Login Now</Link>
          </div>
        ), { duration: 5000, icon: '🛑' });
        return;
      }
      localStorage.setItem("guest_ai_usage", (usage + 1).toString());
    }

    setLoading(true);
    setResult(null);

    try {
      if (inputType === "text") {
        const res = await axios.post("/api/ai/agreement", { text });
        setResult(res.data);
      } else {
        const formData = new FormData();
        formData.append("file", file);
        const res = await axios.post("/api/ai/analyze-agreement-pdf", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        setResult(res.data);
      }
      toast.success("Forensic scan diagnostics complete!");
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setShowPaywall(true);
      } else {
        toast.error(err.response?.data?.error || "Analysis failed. Please try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Only PDF files are supported for evidence parsing.");
        return;
      }
      setFile(selectedFile);
      toast.success(`PDF selected: ${selectedFile.name}`);
    }
  };

  const saveToVault = async () => {
    if (!result) return;
    try {
      const payload = {
        type: docType,
        content: result.analysisText,
        parties: {
          partyA: partyA || "Not Specified",
          partyB: partyB || "Not Specified"
        }
      };
      const res = await axios.post("/api/agreements", payload);
      toast.success("Document secured in Quantum Vault! 🔒");
      setIsSaveModalOpen(false);
      // Clear fields
      setPartyA("");
      setPartyB("");
      // Fetch latest items and switch to vault view
      fetchVaultItems();
      setActiveTab("vault");
    } catch (err) {
      console.error("Failed to save to vault", err);
      toast.error(err.response?.data?.error || "Failed to secure document in vault.");
    }
  };

  const handleSign = async () => {
    if (!selectedItemToSign) return;
    if (!signerName.trim()) {
      toast.error("Please enter signer name.");
      return;
    }
    if (!aadhaarNo.trim() || aadhaarNo.length !== 12) {
      toast.error("Please enter a valid 12-digit Aadhaar number.");
      return;
    }

    setIsSigning(true);
    try {
      const res = await axios.post(`/api/agreements/sign/${selectedItemToSign._id}`, {
        signerName
      });
      toast.success("Aadhaar eSign verification completed successfully!");
      setIsSignModalOpen(false);
      setSignerName("");
      setAadhaarNo("");
      setSelectedItemToSign(null);
      fetchVaultItems();
    } catch (err) {
      console.error("eSign failed", err);
      toast.error(err.response?.data?.error || "Aadhaar eSign failed.");
    } finally {
      setIsSigning(false);
    }
  };

  const downloadCertificate = (item) => {
    const hash = `PQC-SHA256-${item._id.toUpperCase()}`;
    const certContent = `
=========================================================
      NYAYNOW SECURE QUANTUM VAULT INTEGRITY CERTIFICATE
=========================================================
Document ID: ${item._id}
Secured Date: ${new Date(item.createdAt).toLocaleString()}
Document Type: ${item.type}
Quantum Safe Signature Hash: ${hash}

PARTIES INVOLVED:
Party A: ${item.parties?.partyA || "N/A"}
Party B: ${item.parties?.partyB || "N/A"}

STATUS: ${item.isSigned ? "VERIFIED & SIGNED" : "UNSIGNED"}
eSign Signer Name: ${item.signerName || "N/A"}
Aadhaar Tx ID: ${item.aadhaarTxId || "N/A"}
Signature Date: ${item.signatureDate ? new Date(item.signatureDate).toLocaleString() : "N/A"}

---------------------------------------------------------
This document is secured using Post-Quantum Cryptographic
Escrow and is stored in the NyayNow Cryptographic Ledger.
=========================================================
`;
    const element = document.createElement("a");
    const certFile = new Blob([certContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(certFile);
    element.download = `NyayNow-Vault-Cert-${item._id.slice(-6)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Security Certificate downloaded!");
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
    <div className="min-h-screen bg-[#0c1220] font-sans text-slate-400 selection:bg-indigo-500/30">
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      <div className="pt-24 md:pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center max-w-4xl mx-auto mb-12 relative z-10">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Shield size={14} className="fill-emerald-400" /> Post-Quantum Encryption (PQC) Active
          </motion.div>

          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-white mb-6 leading-tight">
            Evidence & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-cyan-400">Quantum Vault</span>
          </motion.h1>

          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Securely store and analyze litigation evidence using military-grade PQC encryption algorithms and deep-learning forensic scans.
          </motion.p>

          {/* Tab Switcher */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 flex justify-center">
            <div className="inline-flex bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab("scan")}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "scan" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25" : "text-slate-400 hover:text-white"}`}
              >
                <Zap size={14} /> Scan & Analyze
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    toast.error("Please login to access your Quantum Vault.");
                    router.push("/login");
                    return;
                  }
                  setActiveTab("vault");
                }}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "vault" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25" : "text-slate-400 hover:text-white"}`}
              >
                <Database size={14} /> Quantum Vault {vaultItems.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-indigo-900 text-indigo-200 text-[9px] rounded-full">{vaultItems.length}</span>}
              </button>
            </div>
          </motion.div>
        </div>

        {/* WORKSPACE */}
        <div id="analyzer" className="relative z-10 min-h-[600px]">
          {/* Background Glows */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

          <AnimatePresence mode="wait">
            {activeTab === "scan" ? (
              <motion.div
                key="scan-tab"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-8"
              >
                {/* INPUT SECTION */}
                <div className="flex flex-col h-full">
                  <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl flex-1 flex flex-col overflow-hidden relative group hover:border-indigo-500/30 transition-all duration-500">
                    <div className="bg-white/5 border-b border-white/5 px-6 py-4 flex justify-between items-center">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setInputType("text")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${inputType === "text" ? "bg-white/10 text-white border border-white/10" : "text-slate-500 hover:text-slate-300"}`}
                        >
                          Raw Text
                        </button>
                        <button
                          onClick={() => setInputType("file")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${inputType === "file" ? "bg-white/10 text-white border border-white/10" : "text-slate-500 hover:text-slate-300"}`}
                        >
                          Upload PDF
                        </button>
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={14} /> Source
                      </span>
                    </div>

                    {inputType === "text" ? (
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste your agreement clause, affidavit, or general legal evidence text here for instant forensic analysis..."
                        className="flex-1 w-full min-h-[350px] resize-none p-8 outline-none bg-transparent text-slate-300 leading-relaxed font-mono text-sm placeholder:text-slate-600 custom-scrollbar"
                      />
                    ) : (
                      <div className="flex-1 min-h-[350px] flex flex-col items-center justify-center p-8 text-center">
                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 hover:border-indigo-500/50 hover:bg-white/[0.02] transition cursor-pointer relative group w-full max-w-md">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <Upload className="mx-auto text-slate-500 group-hover:text-indigo-400 mb-4 transition" size={40} />
                          <p className="text-sm font-bold text-white mb-2">Drag & Drop your PDF here</p>
                          <p className="text-xs text-slate-500 mb-4">or click to browse from system</p>
                          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] text-slate-400 font-bold uppercase">PDF ONLY</span>
                        </div>
                        {file && (
                          <div className="mt-6 flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2.5 rounded-xl text-xs text-indigo-300">
                            <FileText size={16} />
                            <span className="font-bold truncate max-w-xs">{file.name}</span>
                            <button onClick={() => setFile(null)} className="text-rose-400 hover:text-rose-300 ml-1">
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-6 bg-white/5 border-t border-white/5 flex justify-between items-center">
                      <div className="text-xs text-slate-500 font-mono">
                        {inputType === "text" ? `${text.length} characters` : file ? "File ready" : "No file chosen"}
                      </div>
                      <button
                        onClick={analyzeAgreement}
                        disabled={loading || (inputType === "text" ? !text : !file)}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-105 transition disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Scanning...</span>
                          </>
                        ) : (
                          <>
                            <Zap size={18} /> 
                            <span>Run Diagnostics</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* OUTPUT SECTION */}
                <div>
                  <AnimatePresence mode="wait">
                    {!result ? (
                      <div className="h-full min-h-[480px] bg-white/5 backdrop-blur-sm rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 p-10 text-center hover:bg-white/[0.07] transition duration-500">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl shadow-inner mb-6">
                          <Shield size={28} className="opacity-40 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Ready to Scan</h3>
                        <p className="max-w-xs text-sm mb-6">Provide text or upload a PDF document on the left to generate an instant forensic analysis report.</p>
                        <div className="flex gap-4 text-xs font-bold uppercase tracking-widest opacity-50">
                          <span className="flex items-center gap-1.5"><Shield size={12} /> Secure Storage</span>
                          <span className="flex items-center gap-1.5"><Zap size={12} /> Real-Time Analysis</span>
                        </div>
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="bg-[#0f172a]/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col min-h-[480px]"
                      >
                        {/* Result Header */}
                        <div className="bg-white/5 border-b border-white/5 px-6 py-4 flex justify-between items-center">
                          <span className="font-bold text-white flex items-center gap-2">
                             <Shield size={16} className="text-emerald-400" /> Forensic Scan Results
                          </span>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${getRiskColor(result.riskLevel)}`}>
                            {result.riskLevel} Risk
                          </span>
                        </div>

                        <div className="p-8 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                          {/* Score */}
                          <div className="flex items-center gap-6 p-5 bg-white/5 rounded-2xl border border-white/5">
                            <div className="relative w-20 h-20 flex items-center justify-center">
                              <svg className="transform -rotate-90 w-20 h-20">
                                <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-slate-800" />
                                <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="5" fill="transparent" strokeDasharray={213.6} strokeDashoffset={213.6 * (1 - (result.accuracyScore / 100))} className="text-emerald-500" />
                              </svg>
                              <span className="absolute text-lg font-bold text-white">{result.accuracyScore}%</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm">Integrity & Robustness Score</h4>
                              <p className="text-xs text-slate-500 mt-0.5">Higher score indicates lower loopholes and stronger legal security.</p>
                            </div>
                          </div>

                          {/* Paywall Overlay */}
                          {result.isLocked && (
                            <div className="p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-center">
                              <Lock className="mx-auto text-indigo-400 mb-3" size={24} />
                              <h4 className="font-bold text-white text-sm mb-1">Upgrade Plan to Unlock Details</h4>
                              <p className="text-xs text-slate-400 mb-4">Detailed risk report, omissions checklist, and legal advice require Gold or Premium subscription.</p>
                              <button onClick={() => setShowPaywall(true)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-indigo-600/20">
                                Upgrade Plan
                              </button>
                            </div>
                          )}

                          {/* Missing Clauses */}
                          {!result.isLocked && result.missingClauses?.length > 0 && (
                            <div className="bg-rose-500/10 rounded-2xl p-5 border border-rose-500/20">
                              <h4 className="font-bold text-rose-300 text-sm mb-3 flex items-center gap-2"><AlertTriangle size={16} /> Critical Omissions</h4>
                              <ul className="space-y-2.5">
                                {result.missingClauses.map((c, i) => (
                                  <li key={i} className="flex gap-2 text-xs text-rose-200 items-start">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5"></span>
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Markdown Content */}
                          {!result.isLocked && (
                            <div className="prose prose-invert prose-sm max-w-none text-slate-300 border-t border-white/5 pt-6">
                              <ReactMarkdown>{result.analysisText}</ReactMarkdown>
                            </div>
                          )}
                        </div>

                        {/* Save to Vault Action */}
                        <div className="p-6 bg-white/5 border-t border-white/5 flex gap-3">
                          <button
                            onClick={() => {
                              if (!user) {
                                toast.error("Please login to save to Vault.");
                                router.push("/login");
                                return;
                              }
                              setIsSaveModalOpen(true);
                            }}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 hover:scale-[1.02] transition flex items-center justify-center gap-2"
                          >
                            <Shield size={14} /> Save to Quantum Vault
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              // VAULT RECORDS TAB
              <motion.div
                key="vault-tab"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl text-white flex items-center gap-2">
                    <Database size={20} className="text-indigo-400" /> Cryptographic Ledger Logs
                  </h3>
                  <button 
                    onClick={fetchVaultItems}
                    disabled={vaultLoading}
                    className="p-2 hover:bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={vaultLoading ? "animate-spin" : ""} />
                  </button>
                </div>

                {vaultLoading && vaultItems.length === 0 ? (
                  <div className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-400 mb-4" size={32} />
                    <p className="text-sm text-slate-500">Decrypting vault keys...</p>
                  </div>
                ) : vaultItems.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                    <Database className="mx-auto text-slate-600 mb-4" size={40} />
                    <h4 className="text-white font-bold text-base mb-1">Your Vault is Empty</h4>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">Secure your evidence analysis and agreements by running scans and saving them here.</p>
                    <button onClick={() => setActiveTab("scan")} className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition hover:bg-indigo-500">
                      Scan Document Now
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {vaultItems.map((item) => {
                      const secureHash = `PQC-SHA256-0x${item._id.slice(0, 8).toUpperCase()}`;
                      return (
                        <motion.div
                          layout
                          key={item._id}
                          className="bg-[#0f172a]/70 rounded-2xl border border-white/10 p-6 flex flex-col hover:border-indigo-500/40 transition duration-300"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                                {item.type}
                              </span>
                              <p className="text-[10px] text-slate-500 font-mono mt-2">{secureHash}</p>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>

                          {/* Parties */}
                          <div className="bg-white/5 border border-white/5 rounded-xl p-4 my-4 flex items-center justify-between">
                            <div className="text-left">
                              <p className="text-[9px] uppercase tracking-widest text-slate-500">Party A</p>
                              <p className="text-xs font-bold text-white truncate max-w-[120px]">{item.parties?.partyA || "N/A"}</p>
                            </div>
                            <div className="text-slate-600 font-bold text-[10px] uppercase">VS</div>
                            <div className="text-right">
                              <p className="text-[9px] uppercase tracking-widest text-slate-500">Party B</p>
                              <p className="text-xs font-bold text-white truncate max-w-[120px]">{item.parties?.partyB || "N/A"}</p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="mb-6">
                            {item.isSigned ? (
                              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400 flex flex-col gap-1">
                                <span className="font-bold flex items-center gap-1.5"><Shield size={13} className="fill-emerald-400/20" /> SECURE eSIGN COMPLETED</span>
                                <span className="text-[10px] text-slate-500 font-mono">Signer: {item.signerName}</span>
                                <span className="text-[10px] text-slate-500 font-mono">Tx ID: {item.aadhaarTxId}</span>
                              </div>
                            ) : (
                              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400 flex items-center gap-1.5">
                                <AlertTriangle size={14} />
                                <span>UNSIGNED • eSign verification required</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="mt-auto pt-4 border-t border-white/5 flex gap-2 flex-wrap">
                            <button
                              onClick={() => setSelectedItemToView(item)}
                              className="px-3.5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white transition flex items-center gap-1.5"
                              title="View Forensic scan"
                            >
                              <Eye size={14} /> Report
                            </button>
                            <button
                              onClick={() => downloadCertificate(item)}
                              className="px-3.5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white transition flex items-center gap-1.5"
                              title="Download Hash Certificate"
                            >
                              <Download size={14} /> Security Cert
                            </button>
                            {!item.isSigned && (
                              <button
                                onClick={() => {
                                  setSelectedItemToSign(item);
                                  setIsSignModalOpen(true);
                                }}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                              >
                                <Key size={14} /> Aadhaar eSign
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SAVE TO VAULT MODAL */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setIsSaveModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X size={18} />
              </button>
              <h4 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                <Shield size={18} className="text-emerald-400" /> Secure in Quantum Vault
              </h4>
              <p className="text-xs text-slate-400 mb-6">Enter document details to generate a cryptographic vault block.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Document Type / Category</label>
                  <select 
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="Evidence Scan">Evidence Scan</option>
                    <option value="Rent Agreement">Rent Agreement</option>
                    <option value="Affidavit">Affidavit</option>
                    <option value="Non-Disclosure Agreement">NDA</option>
                    <option value="Sales Contract">Sales Contract</option>
                    <option value="Consulting Agreement">Consulting Agreement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Party A (e.g. Landlord / Lessor)</label>
                  <input
                    type="text"
                    value={partyA}
                    onChange={(e) => setPartyA(e.target.value)}
                    placeholder="Enter name"
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Party B (e.g. Tenant / Lessee)</label>
                  <input
                    type="text"
                    value={partyB}
                    onChange={(e) => setPartyB(e.target.value)}
                    placeholder="Enter name"
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setIsSaveModalOpen(false)}
                    className="flex-1 border border-white/10 hover:bg-white/5 text-white py-3 rounded-xl font-bold text-xs uppercase transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveToVault}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs uppercase transition shadow-lg shadow-emerald-600/20"
                  >
                    Lock & Secure
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AADHAAR ESIGN MODAL */}
      <AnimatePresence>
        {isSignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setIsSignModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X size={18} />
              </button>
              <h4 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                <Key size={18} className="text-indigo-400" /> Aadhaar eSign Gateway
              </h4>
              <p className="text-xs text-slate-400 mb-6">Authenticate using your 12-digit Aadhaar UIDAI identifier.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Signer Legal Name</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Enter name exactly as on Aadhaar"
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Aadhaar Number (12-Digit)</label>
                  <input
                    type="text"
                    maxLength={12}
                    value={aadhaarNo}
                    onChange={(e) => setAadhaarNo(e.target.value.replace(/\D/g, ''))}
                    placeholder="0000 0000 0000"
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white tracking-widest font-mono focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="text-[10px] text-slate-500 bg-white/5 border border-white/5 rounded-xl p-3 leading-relaxed flex gap-2">
                  <Shield size={14} className="shrink-0 text-emerald-400 mt-0.5" />
                  <span>Your identifier is validated through the e-KYC gateway and discarded immediately. No Aadhaar data is stored locally.</span>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setIsSignModalOpen(false)}
                    className="flex-1 border border-white/10 hover:bg-white/5 text-white py-3 rounded-xl font-bold text-xs uppercase transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSign}
                    disabled={isSigning}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-xs uppercase transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                  >
                    {isSigning ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Key size={14} />
                        <span>Sign Document</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW DETAILS MODAL */}
      <AnimatePresence>
        {selectedItemToView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedItemToView(null)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                    {selectedItemToView.type}
                  </span>
                  <h4 className="text-white font-serif font-bold text-2xl mt-3">Forensic Security Scan Report</h4>
                  <p className="text-xs text-slate-500 font-mono mt-1">Secured Block: {selectedItemToView._id}</p>
                </div>
              </div>

              {/* Document details */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mb-8 flex justify-between text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Party A</p>
                  <p className="font-bold text-white mt-1">{selectedItemToView.parties?.partyA || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Party B</p>
                  <p className="font-bold text-white mt-1">{selectedItemToView.parties?.partyB || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Secured At</p>
                  <p className="font-bold text-white mt-1">{new Date(selectedItemToView.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Report markdown */}
              <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                <ReactMarkdown>{selectedItemToView.content}</ReactMarkdown>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-2">
                <button
                  onClick={() => downloadCertificate(selectedItemToView)}
                  className="px-5 py-2.5 border border-white/10 hover:bg-white/5 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5"
                >
                  <Download size={14} /> Download Certificate
                </button>
                <button
                  onClick={() => setSelectedItemToView(null)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
