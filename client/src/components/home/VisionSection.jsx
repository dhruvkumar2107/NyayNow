'use client'

import React from "react"
import { motion } from "framer-motion"
import { Shield, Zap, Globe, Lock, Scale, Search, MessageSquare, BookOpen } from "lucide-react"

export default function VisionSection() {
    return (
        <section className="py-24 bg-[#020617] relative overflow-hidden text-center">
            {/* Subtle Gradient background */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 blur-[160px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="mb-20">
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
                        className="text-4xl md:text-6xl font-bold text-white mb-10 tracking-tight leading-tight"
                    >
                        Built for the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-white/30">Modern Law Era.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.4 }}
                        className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed tracking-tight"
                    >
                        NyayNow is a comprehensive ecosystem designed to deliver absolute transparency and efficiency to the Indian legal landscape. We bridge the gap between complex legalese and your fundamental rights.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={Search}
                        title="Smart Case Research"
                        description="Find real-world precedents and court rulings instantly using our intelligent search engine."
                        forWho="Public"
                        delay={0.1}
                    />

                    <FeatureCard
                        icon={MessageSquare}
                        title="Expert Consultation"
                        description="Consult securely with verified lawyers for legal advice tailored to your needs."
                        forWho="Universal"
                        delay={0.2}
                    />

                    <FeatureCard
                        icon={FileText}
                        title="Instant Notice Drafting"
                        description="Generate court-ready legal notices, contracts, and affidavits in seconds."
                        forWho="Universal"
                        delay={0.3}
                    />

                    <FeatureCard
                        icon={Scale}
                        title="Judge AI Insights"
                        description="Get a data-driven outlook on your case based on similar past judgments."
                        forWho="Litigation"
                        delay={0.4}
                    />

                    <FeatureCard
                        icon={Shield}
                        title="Verified Professionals"
                        description="All lawyers on our platform are verified through official Bar Council records."
                        forWho="Trust"
                        delay={0.5}
                    />

                    <FeatureCard
                        icon={BookOpen}
                        title="Laws Simplified"
                        description="Understand complex laws in plain language, translated into your native tongue."
                        forWho="Education"
                        delay={0.6}
                    />
                </div>
            </div>
        </section>
    )
}

function FeatureCard({ icon: Icon, title, description, forWho, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-500 group text-left"
        >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Icon className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-blue-400 transition-colors">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">{description}</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-blue-500 transition-colors">{forWho}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:animate-ping" />
            </div>
        </motion.div>
    )
}

function FileText(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    )
}
