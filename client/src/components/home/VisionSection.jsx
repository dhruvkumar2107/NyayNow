'use client'

import React from "react"
import { motion } from "framer-motion"
import { Shield, Zap, Globe, Lock, Scale, Search } from "lucide-react"

export default function VisionSection() {
    const pillars = [
        {
            icon: <Search className="text-blue-500" size={24} />,
            title: "Predictive Analytics",
            desc: "Access mathematical outcome heuristics through our proprietary neural-network precedent matching system."
        },
        {
            icon: <Lock className="text-indigo-400" size={24} />,
            title: "Secure Chambers",
            desc: "End-to-end encrypted high-fidelity communication suite for virtual strategy and immediate counsel."
        },
        {
            icon: <Zap className="text-emerald-400" size={24} />,
            title: "AI Automation",
            desc: "Institutional-grade drafting engine generating ironclad contracts and statutory notices in seconds."
        },
        {
            icon: <Scale className="text-blue-400" size={24} />,
            title: "Strategy Sandbox",
            desc: "Neural network simulations to predict case outcomes and refine complex legal arguments."
        },
        {
            icon: <Globe className="text-cyan-400" size={24} />,
            title: "NyayVoice AI",
            desc: "Democratizing legal access via every Indian dialect. Breaking the English barrier for 1.4B people."
        },
        {
            icon: <Shield className="text-red-500" size={24} />,
            title: "Legal SOS",
            desc: "A unique crisis response feature for immediate triage. From incident to professional counsel in moments."
        }
    ]

    return (
        <section className="py-24 bg-[#020617] relative overflow-hidden">
            {/* Subtle Gradient background */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 blur-[160px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-24 items-start">
                    {/* Sticky Narrative */}
                    <div className="lg:sticky lg:top-40">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8"
                        >
                            The Vision
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, delay: 0.2 }}
                            className="text-5xl md:text-7xl font-bold text-white mb-10 tracking-tight leading-[0.9]"
                        >
                            Built for the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-white/30">Modern Law Era.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.4 }}
                            className="text-slate-500 text-lg md:text-xl max-w-md font-medium leading-relaxed tracking-tight"
                        >
                            NyayNow is a comprehensive ecosystem designed to deliver absolute transparency and efficiency to the Indian legal landscape. We bridge the gap between complex legalese and your fundamental rights.
                        </motion.p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-16">
                        {pillars.map((pillar, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className="group relative flex gap-8"
                            >
                                <div className="shrink-0">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600/10 group-hover:border-blue-500/30 transition-all duration-500 group-hover:scale-110 shadow-2xl">
                                        {pillar.icon}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-blue-400 transition-colors duration-500">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-slate-500 text-[15px] font-medium leading-relaxed group-hover:text-slate-300 transition-colors duration-500 max-w-md">
                                        {pillar.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
