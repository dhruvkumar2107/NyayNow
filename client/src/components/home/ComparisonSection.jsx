'use client'

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Brain, Gavel, ArrowRight, Shield, Lock } from "lucide-react"

export function ComparisonSection() {
    return (
        <section className="py-16 md:py-32 relative overflow-hidden bg-[#000000] border-y border-white/5">
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1/4 h-full bg-blue-500/20 blur-[140px] rounded-full" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/4 h-full bg-indigo-500/20 blur-[140px] rounded-full" />
            </div>

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8"
                    >
                        Dual Intelligence
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-8 tracking-tighter leading-tight"
                    >
                        One Purpose. <br /><span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Comprehensive Legal Intelligence.</span>
                    </motion.h2>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-8 lg:gap-px bg-white/5 border border-white/5 rounded-[40px] overflow-hidden"
                >
                    {/* STRATEGIC MODULE */}
                    <Link href="/judge-ai" className="group relative bg-[#010204] p-6 sm:p-12 md:p-20 hover:bg-slate-900/40 transition-all duration-700 hover-perspective">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-10 group-hover:scale-110 transition-all duration-500 shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                                <Gavel className="text-blue-500" size={32} />
                            </div>

                            <h3 className="text-4xl font-bold text-white mb-6 group-hover:text-blue-400 transition-colors">Judge AI</h3>
                            <p className="text-blue-500/60 font-black text-[11px] uppercase tracking-[0.3em] mb-8">Strategic Analysis Engine</p>

                            <div className="space-y-6 mb-12">
                                {[
                                    { t: "Predictive Analytics", d: "Outcome probability based on 20 years of data." },
                                    { t: "Risk Auditing", d: "Detect procedural flaws before they arise." },
                                    { t: "Winning Strategy", d: "Formulate bulletproof legal pathways." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                        <div>
                                            <h4 className="text-white font-bold text-sm mb-1">{item.t}</h4>
                                            <p className="text-slate-500 text-xs font-medium">{item.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-[0.2em] group-hover:gap-6 transition-all duration-500">
                                Launch Strategic Suite <ArrowRight className="text-blue-500" size={16} />
                            </div>
                        </div>
                    </Link>

                    {/* ASSISTANT MODULE */}
                    <Link href="/assistant" className="group relative bg-[#010204] p-6 sm:p-12 md:p-20 hover:bg-slate-900/40 transition-all duration-700 border-t lg:border-t-0 lg:border-l border-white/5 hover-perspective">
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-10 group-hover:scale-110 transition-all duration-500 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
                                <Brain className="text-indigo-400" size={32} />
                            </div>

                            <h3 className="text-4xl font-bold text-white mb-6 group-hover:text-indigo-400 transition-colors">AI Assistant</h3>
                            <p className="text-indigo-400/60 font-black text-[11px] uppercase tracking-[0.3em] mb-8">Conversational Intelligence</p>

                            <div className="space-y-6 mb-12">
                                {[
                                    { t: "Instant Opinions", d: "Get high-fidelity legal views in plain English." },
                                    { t: "Precedent Research", d: "Semantic search across 5M+ judicial records." },
                                    { t: "Compliance Mapping", d: "Audit adherence to statutory regulations." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                        <div>
                                            <h4 className="text-white font-bold text-sm mb-1">{item.t}</h4>
                                            <p className="text-slate-500 text-xs font-medium">{item.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-[0.2em] group-hover:gap-6 transition-all duration-500">
                                Launch Research Suite <ArrowRight className="text-indigo-400" size={16} />
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* TRUST BAND */}
                <div className="mt-20 flex flex-wrap items-center justify-center gap-12 text-[#94a3b8] font-bold text-[10px] uppercase tracking-[0.4em]">
                    <div className="flex items-center gap-3">
                        <Shield size={14} className="text-blue-500" />
                        End-to-End Privacy
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <div className="flex items-center gap-3">
                        <Lock size={14} className="text-blue-500" />
                        Institutional Security
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <div className="flex items-center gap-3">
                        <Shield size={14} className="text-blue-500" />
                        Verified Success
                    </div>
                </div>
            </div>
        </section>
    )
}
