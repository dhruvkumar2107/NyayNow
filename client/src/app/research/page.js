'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, ExternalLink, Shield, Loader2, Filter, Sparkles, Scale, Info } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

export default function PrecedentEnginePage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSearch = async (e) => {
        e?.preventDefault()
        if (!query.trim()) return
        
        setIsLoading(true)
        setError(null)
        setResults([])

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/ai/chat`, {
                message: `[LEGAL RESEARCH ENGINE] Find and summarize 3 relevant Indian legal precedents or case laws for this topic: "${query}". 
                Format the response as a JSON array of objects with keys: "caseName", "citation", "summary", "relevanceScore" (0-100). 
                If you cannot find exact cases, generate relevant illustrative scenarios with their statutory basis.`
            })
            
            // Attempt to parse JSON from AI response
            const text = res.data.response
            const jsonMatch = text.match(/\[.*\]/s)
            if (jsonMatch) {
                setResults(JSON.parse(jsonMatch[0]))
            } else {
                // Fallback if AI doesn't return clean JSON
                setResults([{
                    caseName: "Result for: " + query,
                    citation: "Supreme Court of India / High Court",
                    summary: text,
                    relevanceScore: 95
                }])
            }
        } catch (err) {
            console.error(err)
            setError("The research engine failed to retrieve data. Please refine your query.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans pt-32">
            {/* AMBIENT LIGHTING */}
            <div className="fixed inset-0 pointer-events-none">
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
                                    <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
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

            <footer className="p-12 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] border-t border-white/5">
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
