'use client'
import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Search,
    MessageSquare,
    FileText,
    ShieldCheck,
    Gavel,
    Zap,
    ArrowRight,
    BookOpen,
    UserCheck,
    CheckCircle2
} from 'lucide-react'

const FeatureCard = ({ icon: Icon, title, description, forWho, delay }) => {
    const divRef = useRef(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [opacity, setOpacity] = useState(0)

    const handleMouseMove = (e) => {
        if (!divRef.current) return
        const rect = divRef.current.getBoundingClientRect()
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    return (
        <motion.div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
            className="group relative p-10 rounded-[32px] bg-slate-900/40 border border-white/5 hover:border-blue-500/30 transition-all duration-700 overflow-hidden"
        >
            {/* SPOTLIGHT EFFECT */}
            <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, 0.1), transparent 40%)`,
                }}
            />

            <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                    <Icon className="text-blue-400" size={24} />
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-blue-400 transition-colors">
                        {forWho}
                    </span>
                    {forWho === "Universal" && <CheckCircle2 size={10} className="text-emerald-500" />}
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:translate-x-1 transition-transform duration-500">{title}</h3>
                <p className="text-slate-400 text-[15px] leading-relaxed mb-8 font-medium">
                    {description}
                </p>

                <div className="flex items-center gap-2 text-blue-500 font-bold text-[10px] uppercase tracking-[0.25em] group-hover:gap-4 transition-all cursor-pointer">
                    Explore <ArrowRight size={14} />
                </div>
            </div>
        </motion.div>
    )
}

export default function OnboardingSection() {
    return (
        <section className="py-32 relative overflow-hidden bg-[#020617]">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                    >
                        Capabilities
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-[-0.03em] leading-[1.1]"
                    >
                        Built for the <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">Modern Law Era.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium tracking-tight"
                    >
                        A comprehensive ecosystem designed to deliver absolute transparency and efficiency to the Indian legal landscape.
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
                        icon={Gavel}
                        title="Judge AI Insights"
                        description="Get a data-driven outlook on your case based on similar past judgments."
                        forWho="Litigation"
                        delay={0.4}
                    />

                    <FeatureCard
                        icon={ShieldCheck}
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

                {/* INSTITUTIONAL ONBOARDING */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-32 p-1 md:p-1.5 rounded-[40px] bg-gradient-to-b from-blue-500/20 to-transparent border border-white/5 overflow-hidden"
                >
                    <div className="bg-[#030712] rounded-[38px] p-8 md:p-20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />

                        <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-10">
                                    <UserCheck size={14} /> Comprehensive Support
                                </div>
                                <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Need a Guardian? <br /><span className="text-blue-500">We guide the way.</span></h3>
                                <p className="text-slate-400 text-lg mb-12 leading-relaxed font-medium">
                                    Navigating legal complexity requires more than just code — it requires clarity. NyayNow bridges the gap between legalese and your rights.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[
                                        { t: "Legal SOS", d: "Immediate crisis response" },
                                        { t: "Marketplace", d: "Deep precedent matching" },
                                        { t: "Knowledge", d: "Plain-language laws" },
                                        { t: "AI Drafting", d: "Instant official notices" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 font-bold group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-sm mb-1 group-hover:text-blue-400 transition-colors uppercase tracking-wider">{item.t}</h4>
                                                <p className="text-slate-500 text-xs font-medium">{item.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative group/parent">
                                <div className="aspect-square md:aspect-video rounded-[32px] bg-slate-900/50 border border-white/5 p-12 md:p-16 flex flex-col items-center justify-center text-center relative overflow-hidden hover:border-blue-500/40 transition-all duration-700 shadow-2xl">
                                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover/parent:opacity-100 transition-opacity duration-1000" />
                                    <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20 group-hover/parent:scale-110 transition-transform duration-700 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                                        <ArrowRight className="text-blue-500 rotate-[-45deg]" size={40} />
                                    </div>
                                    <h4 className="text-white font-bold text-2xl mb-4 tracking-tight">Enter the Command Center</h4>
                                    <p className="text-slate-500 text-sm mb-10 max-w-xs font-medium">Create your secure profile to access the full legal suite.</p>
                                    <Link href="/register" className="px-10 py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-blue-500 hover:text-white transition-all duration-500 tracking-wider text-xs">
                                        GET STARTED FREE
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
