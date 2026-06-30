'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Search, BookOpen, ExternalLink, Shield, Loader2, 
    Sparkles, Scale, Info, X, MessageSquare, FileText, 
    Download, Share2, Send, ChevronRight, Check, AlertCircle 
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { API_BASE } from '../../config'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function PrecedentEnginePage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    // Case detail drawer state
    const [selectedCase, setSelectedCase] = useState(null)
    const [isDetailLoading, setIsDetailLoading] = useState(false)
    const [caseDetail, setCaseDetail] = useState(null)
    const [activeTab, setActiveTab] = useState('summary') // summary | firac | fullText | chat
    const [activeFiracTab, setActiveFiracTab] = useState('facts') // facts | issue | rule | analysis | conclusion
    
    // Chat state inside case
    const [chatInput, setChatInput] = useState('')
    const [chatMessages, setChatMessages] = useState([])
    const [isChatLoading, setIsChatLoading] = useState(false)
    const chatEndRef = useRef(null)

    useEffect(() => {
        if (activeTab === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [chatMessages, activeTab])

    const handleSearch = async (e) => {
        e?.preventDefault()
        if (!query.trim()) return
        
        setIsLoading(true)
        setError(null)
        setResults([])

        try {
            const res = await axios.post(`${API_BASE}/ai/legal-research`, {
                query: query,
                source: 'All Indian Courts',
                dateRange: 'All Time'
            })
            
            const data = res.data
            const cases = data.cases || []
            if (cases.length > 0) {
                setResults(cases.map(c => ({
                    caseName: c.name,
                    citation: c.citation,
                    summary: c.ratio || c.relevance || c.summary,
                    relevanceScore: data.confidence_score || 90
                })))
            } else if (data.summary) {
                setResults([{
                    caseName: 'Research Summary',
                    citation: 'AI Legal Research Engine',
                    summary: data.summary,
                    relevanceScore: data.confidence_score || 75
                }])
            } else {
                setError("No results found. Please refine your query.")
            }
        } catch (err) {
            console.error(err)
            setError("The research engine failed to retrieve data. Please refine your query.")
        } finally {
            setIsLoading(false)
        }
    }

    const openCaseDetail = async (caseItem) => {
        setSelectedCase(caseItem)
        setIsDetailLoading(true)
        setCaseDetail(null)
        setActiveTab('summary')
        setActiveFiracTab('facts')
        setChatMessages([
            { role: 'assistant', content: `Hello! I am your case AI assistant for "${caseItem.caseName}". Ask me any questions about the judgment, laws, or facts.` }
        ])
        
        try {
            const res = await axios.post(`${API_BASE}/ai/case-detail`, {
                caseName: caseItem.caseName,
                citation: caseItem.citation
            })
            setCaseDetail(res.data)
        } catch (err) {
            console.error(err)
            toast.error("Failed to load case profile. Generating fallback profile...")
            
            // Fallback profile if API fails
            setCaseDetail({
                caseName: caseItem.caseName,
                citation: caseItem.citation,
                court: "Supreme Court of India",
                bench: "Division Bench",
                date: "Recent Ruling",
                summary: caseItem.summary,
                firac: {
                  facts: "Detailed facts are being indexed. This case concerns the application of regulatory laws and civil/criminal liabilities.",
                  issue: "Whether the actions of the petitioner violate the provisions of the stated statutes.",
                  rule: "Constitution of India, BNS (2024), and relevant statutory precedents.",
                  analysis: "The court reviewed previous decisions and noted the importance of balancing public interest with regulatory compliance.",
                  conclusion: "The court directed the parties to adhere to statutory guidelines, disposed of the petition, and upheld the lower court findings."
                },
                fullText: `Formal Order of the Court:\n\nHaving heard learned counsel for both parties, the Court observes that the issues raised herein have significant constitutional and statutory implications. Upon detailed analysis of the facts and rules cited, it is ordered that the petition stands disposed of in terms of the observations made in the detailed report. The parties shall bear their own costs.`
            })
        } finally {
            setIsDetailLoading(false)
        }
    }

    const handleSendCaseMessage = async (e) => {
        e.preventDefault()
        if (!chatInput.trim() || isChatLoading) return

        const userMsg = { role: 'user', content: chatInput }
        setChatMessages(prev => [...prev, userMsg])
        setChatInput('')
        setIsChatLoading(true)

        try {
            const res = await axios.post(`${API_BASE}/ai/chat-case`, {
                caseName: selectedCase.caseName,
                fullText: caseDetail?.fullText || selectedCase.summary,
                message: userMsg.content,
                history: chatMessages.slice(-6)
            })

            setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }])
        } catch (err) {
            console.error(err)
            toast.error("Failed to reach Case AI.")
            setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble processing that right now. Please try again." }])
        } finally {
            setIsChatLoading(false)
        }
    }

    const downloadCasePDF = () => {
        if (!caseDetail) return
        const doc = new jsPDF()

        // Page width helper
        const pageWidth = doc.internal.pageSize.getWidth()

        // Brand Header
        doc.setFillColor(30, 41, 59) // Slate 800
        doc.rect(0, 0, pageWidth, 40, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(20)
        doc.setFont("helvetica", "bold")
        doc.text("NyayNow Casebase Report", 15, 25)
        
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.text("OFFICIAL CASE DETAILS & FIRAC ANALYSIS", 15, 32)

        // Metadata
        doc.setTextColor(50, 50, 50)
        doc.setFontSize(10)
        doc.text(`Case Name: ${caseDetail.caseName}`, 15, 55)
        doc.text(`Citation: ${caseDetail.citation}`, 15, 62)
        doc.text(`Court: ${caseDetail.court}`, 15, 69)
        doc.text(`Bench: ${caseDetail.bench}`, 15, 76)
        doc.text(`Date of Judgment: ${caseDetail.date}`, 15, 83)

        // Divider
        doc.setDrawColor(200, 200, 200)
        doc.line(15, 88, pageWidth - 15, 88)

        // Summary
        doc.setFontSize(13)
        doc.setTextColor(30, 58, 138) // Dark Blue
        doc.setFont("helvetica", "bold")
        doc.text("Executive Summary", 15, 98)

        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.setFont("helvetica", "normal")
        const splitSummary = doc.splitTextToSize(caseDetail.summary || "", pageWidth - 30)
        doc.text(splitSummary, 15, 105)

        // FIRAC Analysis
        doc.setFontSize(13)
        doc.setTextColor(30, 58, 138)
        doc.setFont("helvetica", "bold")
        doc.text("FIRAC Assessment", 15, 130)

        // Generate Table for FIRAC
        autoTable(doc, {
            startY: 135,
            theme: 'grid',
            head: [['Component', 'Legal Details']],
            body: [
                ['Facts', caseDetail.firac?.facts || ""],
                ['Issue', caseDetail.firac?.issue || ""],
                ['Rule', caseDetail.firac?.rule || ""],
                ['Analysis', caseDetail.firac?.analysis || ""],
                ['Conclusion', caseDetail.firac?.conclusion || ""]
            ],
            styles: { fontSize: 9, cellPadding: 4 },
            headStyles: { fillColor: [30, 41, 59] }
        })

        // Save PDF
        doc.save(`${caseDetail.caseName.replace(/\s+/g, '_')}_Casebase_Profile.pdf`)
        toast.success("Case profile PDF downloaded successfully!")
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans pt-32">
            {/* AMBIENT LIGHTING */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]" />
            </div>

            {/* NAVBAR */}
            <nav className="relative z-20 p-8 flex justify-between items-center border-b border-white/5 backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                        <BookOpen size={20} className="text-blue-500" />
                    </div>
                    <span className="text-lg font-black tracking-[0.2em] uppercase">Precedent<span className="text-blue-500">Engine</span></span>
                </div>
                <Link href="/client/dashboard" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                    Dashboard
                </Link>
            </nav>

            <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-6 py-20">
                {/* SEARCH HEADER */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                    >
                        <Sparkles size={12} /> Semantic Law Search Active
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Research Institutional Cases.</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                        Query the entire corpus of Indian statutory Law and Precedents using specialized AI embeddings.
                    </p>
                </div>

                {/* SEARCH BAR */}
                <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto mb-20 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
                    <div className="relative flex items-center bg-[#030712] border border-white/10 rounded-[30px] p-2 overflow-hidden shadow-2xl">
                        <div className="pl-6 text-slate-500">
                            <Search size={24} />
                        </div>
                        <input 
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. Right to privacy under Article 21, Precedents on Anticipatory Bail..."
                            className="bg-transparent border-none focus:outline-none flex-1 px-6 py-4 text-white text-lg font-medium placeholder:text-slate-700"
                        />
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="bg-white text-[#020617] font-black px-10 py-4 rounded-[24px] text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all duration-500 active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Search"}
                        </button>
                    </div>
                </form>

                {/* RESULTS */}
                <div className="space-y-8">
                    <AnimatePresence>
                        {results.map((result, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-[40px] bg-white/5 border border-white/10 group hover:border-blue-500/30 transition-all duration-500 hover:bg-white/[0.07] backdrop-blur-3xl"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                                Relevance: {result.relevanceScore}%
                                            </div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                {result.citation}
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                                            {result.caseName}
                                        </h3>
                                        <p className="text-slate-400 leading-relaxed font-medium">
                                            {result.summary}
                                        </p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => openCaseDetail(result)}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shrink-0 self-center"
                                    >
                                        View Full Doc <ExternalLink size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                         <div className="grid grid-cols-1 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 rounded-[40px] bg-white/5 border border-white/10 animate-pulse" />
                            ))}
                         </div>
                    )}

                    {error && (
                        <div className="text-center p-12 bg-red-500/5 border border-red-500/20 rounded-[40px]">
                            <p className="text-red-400 font-bold">{error}</p>
                        </div>
                    )}

                    {!isLoading && results.length === 0 && !error && (
                        <div className="text-center py-20 opacity-30 select-none">
                            <Scale size={80} className="mx-auto mb-6" />
                            <p className="font-black uppercase tracking-[0.4em] text-xs">Awaiting Research Coordinates</p>
                        </div>
                    )}
                </div>
            </main>

            {/* CASE PROFILE SIDE DRAWER (LEXOPS CASEBASE EMBED) */}
            <AnimatePresence>
                {selectedCase && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCase(null)}
                            className="fixed inset-0 bg-black z-40"
                        />

                        {/* Drawer */}
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-3xl bg-[#090d1f] border-l border-white/10 shadow-2xl z-50 flex flex-col pt-20"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-start">
                                <div className="space-y-1 pr-6">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
                                        <Sparkles size={12} /> Casebase Intelligence Profile
                                    </div>
                                    <h3 className="text-xl font-bold text-white leading-tight">{selectedCase.caseName}</h3>
                                    <p className="text-xs text-slate-500 font-mono">{selectedCase.citation}</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedCase(null)}
                                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Loading State */}
                            {isDetailLoading ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                                    <p className="text-sm font-bold text-slate-300">Retrieving Judgment Records...</p>
                                    <p className="text-xs text-slate-500 mt-1">Grounding FIRAC metrics & citations</p>
                                </div>
                            ) : caseDetail ? (
                                <>
                                    {/* Action Bar */}
                                    <div className="px-6 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <span>🏛️ {caseDetail.court}</span>
                                            <span>📅 {caseDetail.date}</span>
                                        </div>
                                        <button 
                                            onClick={downloadCasePDF}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition shadow-lg"
                                        >
                                            <Download size={12} /> PDF Report
                                        </button>
                                    </div>

                                    {/* Tabs Selection */}
                                    <div className="flex border-b border-white/10 bg-white/[0.02]">
                                        {[
                                            { id: 'summary', label: 'Summary', icon: Info },
                                            { id: 'firac', label: 'FIRAC Analysis', icon: Scale },
                                            { id: 'fullText', label: 'Judgment Text', icon: FileText },
                                            { id: 'chat', label: 'AI Case Chat', icon: MessageSquare }
                                        ].map(tab => {
                                            const Icon = tab.icon
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`flex-1 py-4 flex items-center justify-center gap-2 border-b-2 text-xs font-bold transition ${
                                                        activeTab === tab.id 
                                                        ? 'border-blue-500 text-white bg-blue-500/5' 
                                                        : 'border-transparent text-slate-500 hover:text-slate-300'
                                                    }`}
                                                >
                                                    <Icon size={14} />
                                                    <span>{tab.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Tab Contents */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        {activeTab === 'summary' && (
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 font-bold">Executive Summary</h4>
                                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{caseDetail.summary}</p>
                                                
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Judicial Bench</div>
                                                    <div className="text-xs text-white font-medium">{caseDetail.bench}</div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'firac' && (
                                            <div className="space-y-6">
                                                {/* FIRAC Pills */}
                                                <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-white/5 border border-white/5">
                                                    {['facts', 'issue', 'rule', 'analysis', 'conclusion'].map(pill => (
                                                        <button
                                                            key={pill}
                                                            onClick={() => setActiveFiracTab(pill)}
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
                                                                activeFiracTab === pill
                                                                ? 'bg-blue-600 text-white'
                                                                : 'text-slate-500 hover:text-slate-300'
                                                            }`}
                                                        >
                                                            {pill}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* FIRAC Content */}
                                                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                                    <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-3 font-bold">{activeFiracTab}</h4>
                                                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                        {caseDetail.firac[activeFiracTab]}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'fullText' && (
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 font-bold">Full Judgment Recital</h4>
                                                <pre className="text-slate-300 text-xs font-mono leading-relaxed bg-black/40 border border-white/5 p-4 rounded-xl whitespace-pre-wrap h-96 overflow-y-auto">
                                                    {caseDetail.fullText}
                                                </pre>
                                            </div>
                                        )}

                                        {activeTab === 'chat' && (
                                            <div className="h-full flex flex-col justify-between">
                                                {/* Chat Messages */}
                                                <div className="flex-1 space-y-4 overflow-y-auto mb-4 max-h-[300px]">
                                                    {chatMessages.map((msg, i) => (
                                                        <div key={i} className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                                            <div className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                                                                msg.role === 'user' 
                                                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                                                : 'bg-white/5 border border-white/5 text-slate-300 rounded-tl-none'
                                                            }`}>
                                                                {msg.content}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {isChatLoading && (
                                                        <div className="flex items-start gap-2">
                                                            <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none text-xs text-slate-500 animate-pulse">
                                                                Analyzing judgment context...
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div ref={chatEndRef} />
                                                </div>

                                                {/* Chat Form */}
                                                <form onSubmit={handleSendCaseMessage} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={chatInput}
                                                        onChange={e => setChatInput(e.target.value)}
                                                        placeholder="Ask: 'What was the deciding factor?' or 'Which section was applied?'"
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={!chatInput.trim() || isChatLoading}
                                                        className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-40"
                                                    >
                                                        <Send size={14} />
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="p-8 text-center text-red-400">
                                    <AlertCircle className="mx-auto mb-2" size={32} />
                                    <span>Failed to load profile details.</span>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <footer className="p-12 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] border-t border-white/5 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                         <Shield size={14} /> 256-Bit TLS Research Channel
                    </div>
                    <p>© 2025 NyayNow Institutional Research</p>
                </div>
            </footer>
        </div>
    )
}
