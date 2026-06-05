'use client'

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LegalSOSSection } from "../components/home/LegalSOSSection"
import { ComparisonSection } from "../components/home/ComparisonSection"
import { BentoGrid } from "../components/home/BentoGrid"
import HeroSection from "../components/home/HeroSection"
import VisionSection from "../components/home/VisionSection"
import ChooserCards from "../components/home/ChooserCards"
import GroundingShowcase from "../components/home/GroundingShowcase"

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0c1220] font-sans text-slate-400 selection:bg-indigo-500/30">
            {/* HERO SECTION */}
            <HeroSection />

            {/* AUDIENCE CHOOSER CARDS */}
            <ChooserCards />

            {/* VISION SECTION */}
            <VisionSection />

            {/* GROUNDING SHOWCASE SECTION (Replaces uppercase marquee) */}
            <GroundingShowcase />

            {/* DYNAMIC STATS WITH METHODOLOGY */}
            <section className="py-20 relative overflow-hidden bg-[#020617]">
                <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05)_0%,transparent_50%)]" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-24 mb-12">
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
                    <Link
                        href="/methodology"
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                        View Verification Methodology
                        <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </section>

            <LegalSOSSection />
            <ComparisonSection />
            <BentoGrid />
        </div>
    )
}
