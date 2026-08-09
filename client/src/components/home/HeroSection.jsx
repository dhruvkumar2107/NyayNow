'use client'

import React, { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { motion, useSpring, useMotionValue } from "framer-motion"
import { useAuth } from "../../context/AuthContext"
import { useLanguage } from "../../context/LanguageContext"
import { ShieldCheck, ChevronRight, Lock, Sparkles, Scale } from "lucide-react"

export default function HeroSection() {
    const { user } = useAuth()
    const { t } = useLanguage()
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const heroRef = useRef(null)

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!heroRef.current) return
            const rect = heroRef.current.getBoundingClientRect()
            setMousePos({
                x: (e.clientX - rect.left) / rect.width,
                y: (e.clientY - rect.top) / rect.height
            })
        }
        heroRef.current?.addEventListener('mousemove', handleMouseMove)
        return () => heroRef.current?.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return (
        <section 
            ref={heroRef}
            className="relative pt-32 md:pt-44 pb-16 lg:pb-24 overflow-hidden text-center bg-[#000000]"
            aria-label="Hero Section"
        >
            {/* MESH GRADIENT BACKGROUND */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden mesh-gradient" />
            
            {/* PATTERN GRID */}
            <div className="absolute inset-0 pattern-grid pointer-events-none" />
            
            {/* NOISE OVERLAY */}
            <div className="absolute inset-0 pattern-noise pointer-events-none" />
            
            {/* DYNAMIC ORBS FOLLOWING MOUSE */}
            <motion.div
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{
                    transform: `translate(${mousePos.x * 20 - 10}px, ${mousePos.y * 20 - 10}px)`
                }}
                transition={{ duration: 0.5 }}
            >
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse transition-all duration-[10s]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-1000 transition-all duration-[8s]" />
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[140px] animate-pulse delay-700 transition-all duration-[12s]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-blue-400/5 rounded-full blur-[130px] animate-pulse delay-300 transition-all duration-[15s]" />
            </motion.div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                {/* TRUST BADGE */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-glass border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-[0.4em] mb-12 shadow-2xl hover:border-blue-500/30 transition-colors"
                >
                    <motion.div 
                        className="w-1.5 h-1.5 rounded-full bg-blue-500" 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span>{t("hero.badge")}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20 mx-1" />
                    <span className="text-white/20">v2.0 Beta</span>
                </motion.div>

                {/* FLOATING PARTICLES */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0, 0.3, 0], scale: [0, 1, 0] }}
                            transition={{ 
                                duration: 8 + i * 0.5, 
                                repeat: Infinity, 
                                delay: i * 0.4,
                                ease: 'easeInOut'
                            }}
                            className="absolute w-1 h-1 rounded-full bg-blue-400/30"
                            style={{
                                left: `${10 + (i * 7) % 80}%`,
                                top: `${20 + (i * 11) % 60}%`,
                            }}
                        />
                    ))}
                </div>

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
                        <span className="text-gradient-gold italic inline-block mt-4">{t("hero.title2")}</span>
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
                            className="group relative w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-[#020617] font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 overflow-hidden btn-glossy-primary"
                        >
                            <span className="relative z-10">{t("hero.try_ai")}</span>
                            <ChevronRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </Link>
                    </MagneticButton>

                    <MagneticButton>
                        <Link
                            href="/marketplace"
                            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-glass-strong border border-white/10 text-white font-bold text-lg hover:bg-glass hover:border-blue-500/50 transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] group btn-glossy-secondary"
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
                           <motion.div
                               key={partner}
                               initial={{ opacity: 0, y: 10 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ delay: 0.05 * ['e-Courts', 'Bar Council Info', 'NALSA', 'NIC', 'Supreme Court Data'].indexOf(partner) }}
                               className="flex items-center gap-2 hover:opacity-100 hover:scale-105 transition-all duration-300"
                           >
                               <div className="w-8 h-8 rounded-lg bg-glass border border-white/10 flex items-center justify-center text-[10px] font-black text-white/50 group-hover:text-white group-hover:border-blue-500/30 transition-all">
                                   {partner[0]}
                               </div>
                               <span className="text-[10px] md:text-xs font-bold tracking-widest text-white/40 group-hover:text-white transition-colors">{partner}</span>
                           </motion.div>
                        ))}
                    </div>

                    {/* STAT BAR — keyword-rich, server-rendered, crawlable */}
                    <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                        {[
                            { value: '10,000+', label: 'Legal Queries Answered', icon: Sparkles, color: 'text-amber-400' },
                            { value: 'BNS 2024', label: 'Compliant AI Responses', icon: Scale, color: 'text-blue-400' },
                            { value: '14', label: 'Indian Languages', icon: Sparkles, color: 'text-emerald-400' },
                            { value: 'BCI', label: 'Bar Council Verified', icon: ShieldCheck, color: 'text-indigo-400' },
                        ].map(({ value, label, icon: Icon, color }) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 + ['Legal Queries Answered', 'Compliant AI Responses', 'Indian Languages', 'Bar Council Verified'].indexOf(label) * 0.1 }}
                                className="flex flex-col items-center gap-1 px-4 py-4 rounded-2xl bg-glass border border-white/5 hover:border-blue-500/20 transition-all card-premium-interactive"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon size={20} className={color} />
                                </div>
                                <span className="text-white font-black text-xl tracking-tight">{value}</span>
                                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider text-center leading-tight">{label}</span>
                            </motion.div>
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
        if (!ref.current) return
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
