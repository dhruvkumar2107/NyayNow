'use client'

import React from "react"
import { motion } from "framer-motion"
import { Sparkles, ShieldCheck, FileText, AlertTriangle } from "lucide-react"

export default function FeatureCards() {
    const features = [
        {
            icon: <Sparkles className="text-amber-400" size={28} />,
            title: "AI Legal Intelligence",
            desc: "Ask legal queries in plain language across 12+ Indian languages. Get instant answers grounded strictly in BNS 2024, IPC sections, and Supreme Court / High Court precedents — zero hallucination.",
            glow: "rgba(245,158,11,0.15)"
        },
        {
            icon: <ShieldCheck className="text-blue-400" size={28} />,
            title: "BCI Verified Advocates",
            desc: "Connect with Bar Council of India (BCI) verified lawyers. Every advocate is KYC-matched against official Bar Council records before listing on the platform.",
            glow: "rgba(96,165,250,0.15)"
        },
        {
            icon: <FileText className="text-emerald-400" size={28} />,
            title: "Autonomous Drafting",
            desc: "Generate legally enforceable agreements, rent deeds, notices, and affidavits — drafted to BNS 2024 standards. E-sign and print in minutes, ready for court submission.",
            glow: "rgba(52,211,153,0.15)"
        },
        {
            icon: <AlertTriangle className="text-red-400" size={28} />,
            title: "24/7 Legal SOS Response",
            desc: "Emergency legal gateway using court data and BNS 2024 to instantly classify your crisis, deliver rights analysis in 14 languages, draft an FIR, and connect you to a verified advocate — in 60 seconds.",
            glow: "rgba(248,113,113,0.15)"
        }
    ]

    return (
        <section className="py-20 bg-[#070c19] relative overflow-hidden border-t border-b border-white/5">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none" />
            
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-3 block">
                        THE NYAYNOW SUITE
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                        Next-Gen Legal Operating System
                    </h2>
                    <p className="text-slate-400 text-base md:text-lg mt-4 font-light leading-relaxed">
                        NyayNow merges artificial intelligence with India's legal directory framework to deliver absolute transparency, speed, and safety.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 35 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ y: -8 }}
                            className="group relative bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl"
                        >
                            {/* Card Glow Effect — CSS custom property avoids inline style lint warning */}
                            <div 
                                className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl pointer-events-none group-hover:opacity-100 opacity-60 transition-opacity duration-300 card-glow"
                                style={{ '--card-glow-color': f.glow }}
                            />

                            <div className="relative z-10 space-y-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                                    {f.icon}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                                        {f.title}
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed font-light">
                                        {f.desc}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
