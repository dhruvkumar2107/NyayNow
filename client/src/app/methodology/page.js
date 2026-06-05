'use client'

import React from "react"
import Link from "next/link"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { BookOpen, Scale, Award, Database, RefreshCw } from "lucide-react"

export default function Methodology() {
    const metrics = [
        { title: "Statute Alignment", value: "98.4%", desc: "Accurate linking to BNS 2024 sections without hallucinated legal provisions." },
        { title: "Retrieval Latency", value: "1.2s", desc: "Average time to fetch, parse, and verify Indian case law citations." },
        { title: "Dialect Comprehension", value: "14+", desc: "Supported Indian languages and regional dialects parsed accurately." },
        { title: "Precedents Indexed", value: "1.2M+", desc: "Supreme Court, High Court, and district court judgments cataloged." }
    ]

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col pt-24">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full relative z-10">
                <div className="absolute top-0 inset-x-0 h-[300px] bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.05),_transparent_70%)] pointer-events-none" />

                <div className="mb-16">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <BookOpen size={12} /> Technical Methodology
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Grounding and Calibration Methodology
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Learn how NyayNow calibrates neural networks to ground responses in verified Indian gazettes, statutory records, and case laws.
                    </p>
                </div>

                {/* METRICS GRID */}
                <div className="grid grid-cols-2 gap-6 mb-16">
                    {metrics.map((m) => (
                        <div key={m.title} className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <span className="text-3xl md:text-5xl font-bold text-white block mb-2">{m.value}</span>
                            <span className="text-sm font-bold text-slate-400 block mb-1">{m.title}</span>
                            <span className="text-xs text-slate-500 leading-relaxed block">{m.desc}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-12">
                    {/* Retrival & Augmentation */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <RefreshCw className="text-blue-400" size={20} />
                            Hybrid RAG retrieval pipeline
                        </h2>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                            NyayNow uses a custom-tuned Retrieval-Augmented Generation (RAG) framework. When you enter a legal question or case description, our system converts the input into vector representations and performs semantic lookups against our database of Indian statutes. 
                            This filters out irrelevant noise, matching the case facts with exact BNS 2024 citations and Supreme Court rulings.
                        </p>
                    </div>

                    {/* Datasets */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <Database className="text-emerald-400" size={20} />
                            Verified Indian legal data corpora
                        </h2>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                            Our database is synchronized weekly with official federal repositories:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs md:text-sm">
                                <strong className="text-white block mb-1">BNS 2024 & New Criminal Codes</strong>
                                <span className="text-slate-500">
                                     Bharatiya Nyaya Sanhita, Bharatiya Nagarik Suraksha Sanhita, and Bharatiya Sakshya Adhiniyam codes cataloged.
                                </span>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs md:text-sm">
                                <strong className="text-white block mb-1">e-Courts Precedent Gazette</strong>
                                <span className="text-slate-500">
                                    Citations and summaries of rulings from Supreme Court and state High Courts.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Educational Simulator Notice */}
                    <div className="p-8 rounded-2xl bg-white/5 border border-[#dc2626]/20 bg-red-500/5 relative overflow-hidden">
                        <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                            <Scale className="text-red-400" size={20} />
                            Simulator boundaries & warnings
                        </h2>
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                            All metrics, analysis cards, courtroom simulations, and legal notices generated by NyayNow are intended as simulated educational resources. NyayNow operates in compliance with the Bar Council of India guidelines, meaning we do not offer formal legal advice or advocate ranking lists. Always seek standard professional advice from a registered advocate.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
