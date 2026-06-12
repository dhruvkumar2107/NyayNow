'use client'

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShieldAlert, Zap, Lock, ChevronRight, Phone } from "lucide-react"

export function LegalSOSSection() {
    return (
        <section className="relative py-20 md:py-40 overflow-hidden bg-[#020617]">
            {/* AMBIENT EMERGENCY GLOW */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-10">
                            <ShieldAlert size={14} className="text-red-500" />
                            <span className="text-red-500 font-black text-[10px] tracking-[0.3em] uppercase">Emergency Response AI</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-8 tracking-tighter leading-[1.1]">
                            The Unique <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">Legal SOS Game-Changer.</span>
                        </h2>

                        <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-12 max-w-lg font-medium">
                            Democratizing legal protection through instant, multi-dialect crisis response. Get immediate rights analysis in your language, an AI-drafted FIR, and an elite advocate connection in 60 seconds.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5">
                            <Link
                                href="/legal-sos"
                                className="group relative flex items-center justify-center gap-4 px-10 py-5 rounded-2xl bg-red-600 text-white font-black text-lg shadow-[0_20px_40px_rgba(220,38,38,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden"
                            >
                                <div className="relative flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-white" />
                                </div>
                                <span className="relative z-10">Activate Legal SOS</span>
                            </Link>

                            <a
                                href="tel:112"
                                className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all active:scale-[0.98]"
                            >
                                <Phone size={20} className="text-red-500" />
                                <span>Police 112</span>
                            </a>
                        </div>

                        <div className="mt-12 flex items-center gap-6 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                            <div className="flex items-center gap-2">
                                <Lock size={12} /> Encrypted
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                            <div className="flex items-center gap-2">
                                <Zap size={12} /> Blitz Fast
                            </div>
                        </div>
                    </motion.div>

                    <div className="relative space-y-4">
                        {/* THE SONAR TIMELINE */}
                        <div className="absolute left-10 top-8 bottom-8 w-px bg-gradient-to-b from-red-500/50 via-red-500/20 to-transparent z-0 hidden md:block" />

                        <SOSCard
                            step="01"
                            title="Instant Triage"
                            desc="Institutional AI classifies your legal crisis and jurisdiction in under 5 seconds."
                            color="bg-red-500"
                            delay={0.2}
                        />
                        <SOSCard
                            step="02"
                            title="Rights Revelation"
                            desc="Get a high-fidelity audit of your fundamental legal protections in 14+ dialects."
                            color="bg-rose-500"
                            delay={0.4}
                        />
                        <SOSCard
                            step="03"
                            title="The FIR Engine"
                            desc="Automated BNS/IPC drafting for direct police submission. Professional grade."
                            color="bg-red-400"
                            delay={0.6}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

function SOSCard({ step, title, desc, color, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-8 p-5 sm:p-8 rounded-3xl bg-[#030712] border border-white/5 hover:border-red-500/30 transition-all duration-700 shadow-2xl group z-10"
        >
            <div className={`w-12 h-12 rounded-2xl ${color}/10 border border-${color}/20 flex items-center justify-center text-xl font-black text-${color}/80 group-hover:scale-110 transition-transform duration-500 shrink-0`}>
                {step}
            </div>
            <div>
                <h3 className="text-white font-bold text-xl mb-2 tracking-tight">{title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <ChevronRight size={16} className="text-red-500" />
            </div>
        </motion.div>
    )
}
