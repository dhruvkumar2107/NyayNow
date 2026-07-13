'use client'

import React, { useRef, useState } from "react"
import Link from "next/link"
import { motion, useSpring, useMotionValue } from "framer-motion"
import { useAuth } from "../../context/AuthContext"
import { useLanguage } from "../../context/LanguageContext"
import { ShieldCheck, ChevronRight, Lock } from "lucide-react"

export default function HeroSection() {
    const { user } = useAuth()
    const { t } = useLanguage()

    return (
        <section className="relative pt-32 md:pt-44 pb-16 lg:pb-24 overflow-hidden text-center bg-[#000000]">
            {/* ULTRA-PREMIUM MESH GRADIENT */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse transition-all duration-[10s]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-1000 transition-all duration-[8s]" />
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[140px] animate-pulse delay-700 transition-all duration-[12s]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-blue-400/5 rounded-full blur-[130px] animate-pulse delay-300 transition-all duration-[15s]" />

                {/* HAIRLINE GRID */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-20" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                {/* TRUST BADGE */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-[0.4em] mb-12 backdrop-blur-3xl shadow-2xl hover:border-blue-500/30 transition-colors"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span>{t("hero.badge")}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20 mx-1" />
                    <span className="text-white/20">v2.0 Beta</span>
                </motion.div>

                {/* MASSIVE TITLES */}
                <div className="mb-10 relative">
                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-3xl md:text-6xl lg:text-[75px] font-bold text-white mb-8 leading-[1.15] tracking-[-0.04em]"
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
                             {t("hero.title1")} <br />
                        </span>
                        <span className="text-shimmer italic inline-block mt-4">{t("hero.title2")}</span>
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-3xl mx-auto space-y-6"
                    >
                        <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed tracking-tight">
                            {t("hero.subtitle")}
                        </p>
                        <p className="text-blue-400/80 text-[10px] font-black uppercase tracking-[0.4em] pb-4">
                            {t("hero.grounded")}
                        </p>
                    </motion.div>
                </div>

                {/* BIG TECH CTAS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <MagneticButton>
                        <Link
                            href="/assistant"
                            className="group relative w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-[#020617] font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 overflow-hidden"
                        >
                            <span className="relative z-10">{t("hero.try_ai")}</span>
                            <ChevronRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </Link>
                    </MagneticButton>

                    <MagneticButton>
                        <Link
                            href="/marketplace"
                            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-[#0F172A] border border-white/10 text-white font-bold text-lg hover:bg-white/5 hover:border-blue-500/50 transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] group"
                        >
                            <span>{t("hero.find_lawyer")}</span>
                        </Link>
                    </MagneticButton>
                </motion.div>

                {/* MICRO-TRUST LINE */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="text-slate-500 text-xs mt-6 font-medium"
                >
                    {t("hero.disclaimer")}
                </motion.p>

                {/* TRUST & PARTNERS ROW */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 1 }}
                    className="mt-24 space-y-8"
                >
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">{t("hero.integrated")}</p>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 md:gap-x-12 gap-y-6 grayscale opacity-30 invert hover:opacity-60 transition-opacity duration-500">
                        {['e-Courts', 'Bar Council Info', 'NALSA', 'NIC', 'Supreme Court Data'].map((partner) => (
                           <div key={partner} className="flex items-center gap-2">
                               <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-black">{partner[0]}</div>
                               <span className="text-[10px] md:text-xs font-bold tracking-widest">{partner}</span>
                           </div>
                        ))}
                    </div>

                    {/* STAT BAR — keyword-rich, server-rendered, crawlable */}
                    <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                        {[
                            { value: '10,000+', label: 'Legal Queries Answered' },
                            { value: 'BNS 2024', label: 'Compliant AI Responses' },
                            { value: '14', label: 'Indian Languages Supported' },
                            { value: 'BCI', label: 'Bar Council Verified Lawyers' },
                        ].map(({ value, label }) => (
                            <div
                                key={label}
                                className="flex flex-col items-center gap-1 px-4 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/20 transition-colors"
                            >
                                <span className="text-white font-black text-xl tracking-tight">{value}</span>
                                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider text-center leading-tight">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* SPEAKABLE — used by SpeakableSpecification schema + GEO crawlers */}
                    <p className="speakable sr-only">
                        NyayNow is India's AI-powered legal platform offering free legal advice grounded in BNS 2024 and IPC sections,
                        Bar Council of India verified lawyer connections, Supreme Court and High Court case data,
                        autonomous contract drafting, Legal SOS emergency response, and support in 14 Indian languages including Hindi and Tamil.
                    </p>
                </motion.div>

                {/* BOTTOM TRUST SIGNAL */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 1.2 }}
                    className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] opacity-50"
                >
                    <div className="flex items-center gap-2 group cursor-default hover:text-blue-400 transition-colors">
                        <Lock size={12} />
                        <span>{t("hero.encryption")}</span>
                    </div>
                    <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <div className="flex items-center gap-2 group cursor-default hover:text-emerald-400 transition-colors">
                        <ShieldCheck size={12} />
                        <span>{t("hero.bci")}</span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

function MagneticButton({ children }) {
    const ref = useRef(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const handleMouse = (e) => {
        const { clientX, clientY } = e
        const { height, width, left, top } = ref.current.getBoundingClientRect()
        const middleX = clientX - (left + width / 2)
        const middleY = clientY - (top + height / 2)
        setPosition({ x: middleX * 0.2, y: middleY * 0.2 })
    }

    const reset = () => {
        setPosition({ x: 0, y: 0 })
    }

    const { x, y } = position

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        >
            {children}
        </motion.div>
    )
}
