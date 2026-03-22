'use client'
import React from "react"
import { motion } from "framer-motion"
import Footer from "../components/Footer"
import { LegalSOSSection } from "../components/home/LegalSOSSection"
import { ComparisonSection } from "../components/home/ComparisonSection"
import { BentoGrid } from "../components/home/BentoGrid"
import HeroSection from "../components/home/HeroSection"
import VisionSection from "../components/home/VisionSection"

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0c1220] font-sans text-slate-400 selection:bg-indigo-500/30">

            <HeroSection />
            <VisionSection />

            {/* TRUST MARQUEE */}
            <section className="py-20 border-y border-white/5 bg-[#020617] relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#020617] via-transparent to-[#020617] z-10" />
                <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
                    <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em]">Bridging the Path to Justice</p>
                </div>

                <div className="flex overflow-hidden group select-none">
                    <div className="flex animate-marquee whitespace-nowrap gap-16 items-center px-8">
                        {[
                            "JUDICIAL INTELLIGENCE", "LEGAL RESEARCH NETWORK", "STATUTORY COMPLIANCE", "NATIVE DIALECT AI", "LEGAL ACCESSIBILITY", "INDIAN CONSTITUTIONAL LAW"
                        ].map((name) => (
                            <span key={name} className="text-2xl md:text-3xl font-serif font-black text-white/20 hover:text-blue-400/50 transition-colors duration-500 tracking-[0.15em] cursor-default">{name}</span>
                        ))}
                    </div>
                    {/* Duplicate for seamless loop */}
                    <div className="flex animate-marquee whitespace-nowrap gap-16 items-center px-8" aria-hidden="true">
                        {[
                            "JUDICIAL INTELLIGENCE", "LEGAL RESEARCH NETWORK", "STATUTORY COMPLIANCE", "NATIVE DIALECT AI", "LEGAL ACCESSIBILITY", "INDIAN CONSTITUTIONAL LAW"
                        ].map((name) => (
                            <span key={name} className="text-2xl md:text-3xl font-serif font-black text-white/20 hover:text-blue-400/50 transition-colors duration-500 tracking-[0.15em] cursor-default">{name}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* DYNAMIC STATS */}
            <section className="py-20 relative overflow-hidden bg-[#020617]">
                <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05)_0%,transparent_50%)]" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-24">
                        {[
                            { val: 100, suffix: "K+", label: "Legal Queries", color: "from-blue-400 to-indigo-500" },
                            { val: 1.2, suffix: "M", label: "Precedents Analyzed", color: "from-blue-500 to-cyan-500" },
                            { val: 0, suffix: "", label: "Entry Fees", color: "from-emerald-400 to-teal-500" },
                            { val: 14, suffix: "", label: "Regional Dialects", color: "from-amber-400 to-orange-500" }
                        ].map((stat, i) => (
                            <div key={stat.label} className="text-center group">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="relative inline-block"
                                >
                                    <div className={`text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br ${stat.color} tracking-tighter mb-4 group-hover:scale-110 transition-transform duration-500`}>
                                        {stat.val}{stat.suffix}
                                    </div>
                                    <div className="h-1 w-12 bg-white/10 mx-auto rounded-full group-hover:bg-blue-500/50 transition-colors duration-500" />
                                </motion.div>
                                <div className="mt-6 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] font-sans">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <LegalSOSSection />
            <ComparisonSection />
            <BentoGrid />

            <Footer />
        </div>
    )
}
