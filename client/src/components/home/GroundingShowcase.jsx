'use client'

import React, { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Scale, ShieldAlert, BookOpen, ExternalLink, ArrowRight } from "lucide-react"

export default function GroundingShowcase() {
    const [activeTab, setActiveTab] = useState(0)

    const examples = [
        {
            title: "Property & Theft",
            scenario: "Someone entered my closed yard at night and stole my bicycle.",
            statute: "Bharatiya Nyaya Sanhita (BNS) 2024",
            sections: [
                { num: "Section 303(2)", desc: "Punishment for Theft - imprisonment up to 3 years or fine." },
                { num: "Section 329(1)", desc: "Lurking house-trespass or house-breaking by night." }
            ],
            citations: "State of Maharashtra v. Sayaji (2025) • Grounded on BNS 2024 Gazette",
            updated: "Last verified: June 2026"
        },
        {
            title: "Digital & Fraud",
            scenario: "A seller took an advance payment of ₹50,000 online and blocked my phone.",
            statute: "Bharatiya Nyaya Sanhita (BNS) 2024",
            sections: [
                { num: "Section 318(4)", desc: "Cheating and dishonestly inducing delivery of property (previously IPC 420)." },
                { num: "Section 319", desc: "Cheating by personation using electronic devices." }
            ],
            citations: "Delhi HC v. Amit Kumar (2025) • IT Act Sec 66D Compliance",
            updated: "Last verified: May 2026"
        },
        {
            title: "Physical Injury",
            scenario: "What constitutes grievous hurt under the new criminal codes?",
            statute: "Bharatiya Nyaya Sanhita (BNS) 2024",
            sections: [
                { num: "Section 117(1)", desc: "Voluntarily causing grievous hurt (previously IPC 325)." },
                { num: "Section 115(2)", desc: "Simple hurt definitions and injury mapping criteria." }
            ],
            citations: "SC Guidelines on Medico-Legal Reports (2025)",
            updated: "Last verified: June 2026"
        }
    ]

    const partners = [
        { name: "e-Courts India", link: "https://ecourts.gov.in" },
        { name: "Bar Council Gazette", link: "#" },
        { name: "NALSA", link: "https://nalsa.gov.in" },
        { name: "Ministry of Law & Justice", link: "https://lawmin.gov.in" }
    ]

    return (
        <section className="py-24 bg-[#020617] border-y border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_20%,rgba(99,102,241,0.03),transparent_50%)]" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* HEADER */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <p className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Verification & Grounding</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
                        AI Outputs Grounded in Live Indian Codes
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Unlike general chatbots, NyayNow verifies every response against the newly updated Bharatiya Nyaya Sanhita (BNS 2024) and official judicial precedents.
                    </p>
                </div>

                {/* INTERACTIVE WORKCASE */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch mb-24">
                    {/* TABS SELECTOR */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Select Scenario</p>
                        {examples.map((ex, idx) => (
                            <button
                                key={ex.title}
                                onClick={() => setActiveTab(idx)}
                                className={`text-left p-6 rounded-2xl border transition-all duration-300 flex flex-col gap-2 relative overflow-hidden ${
                                    activeTab === idx 
                                    ? "bg-white/5 border-white/10 shadow-lg text-white" 
                                    : "bg-transparent border-transparent text-slate-400 hover:bg-white/[0.02]"
                                }`}
                            >
                                {activeTab === idx && (
                                    <motion.div 
                                        layoutId="activeTabIndicator"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500" 
                                    />
                                )}
                                <span className="text-base font-bold tracking-tight">{ex.title}</span>
                                <span className="text-xs text-slate-500 line-clamp-1">{ex.scenario}</span>
                            </button>
                        ))}
                    </div>

                    {/* LIVE SIMULATOR SHELL */}
                    <div className="lg:col-span-8 flex">
                        <div className="w-full bg-[#000000] border border-white/10 rounded-3xl p-8 md:p-10 flex flex-col justify-between relative shadow-2xl">
                            {/* Window header */}
                            <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-8">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest ml-4">Grounded Verification</span>
                                </div>
                                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    {examples[activeTab].updated}
                                </span>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-8 flex-grow"
                                >
                                    {/* USER INPUT */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400">U</div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black uppercase text-slate-500 tracking-wider">User Query</p>
                                            <p className="text-white text-base font-medium">"{examples[activeTab].scenario}"</p>
                                        </div>
                                    </div>

                                    {/* SYSTEM RESPONSE */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">N</div>
                                        <div className="space-y-4 w-full">
                                            <div>
                                                <p className="text-xs font-black uppercase text-slate-500 tracking-wider mb-1">AI Classification & Grounding</p>
                                                <p className="text-slate-300 font-bold flex items-center gap-2 text-sm md:text-base">
                                                    <Scale size={16} className="text-blue-400" />
                                                    {examples[activeTab].statute}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {examples[activeTab].sections.map((sec) => (
                                                    <div key={sec.num} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                                        <span className="text-xs font-black text-blue-400 block mb-1">{sec.num}</span>
                                                        <span className="text-xs text-slate-400 leading-normal">{sec.desc}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <BookOpen size={12} />
                                                    Citations: {examples[activeTab].citations}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                                <Link 
                                    href="/assistant"
                                    className="inline-flex items-center gap-2 text-xs font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 group"
                                >
                                    Try AI Query Free
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/methodology"
                                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300"
                                >
                                    Our Grounding Methodology
                                    <ExternalLink size={12} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PRESS & PARTNERS */}
                <div className="pt-16 border-t border-white/5">
                    <p className="text-center text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] mb-10">
                        Integrated & Aligned with Trusted Initiatives
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                        {partners.map((partner) => (
                            <Link
                                key={partner.name}
                                href={partner.link}
                                target={partner.link !== "#" ? "_blank" : undefined}
                                rel="noopener noreferrer"
                                className="text-xs md:text-sm font-bold text-slate-500 hover:text-slate-300 tracking-wider flex items-center gap-1 transition-colors"
                            >
                                {partner.name}
                                {partner.link !== "#" && <ExternalLink size={10} className="opacity-50" />}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
