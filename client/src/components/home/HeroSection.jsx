'use client'

import React, { useRef, useState } from "react"
import Link from "next/link"
import { motion, useSpring, useMotionValue } from "framer-motion"
import { useAuth } from "../../context/AuthContext"
import { ShieldCheck, ChevronRight, Lock } from "lucide-react"

export default function HeroSection() {
    const { user } = useAuth()

    return (
        <section className="relative pt-20 md:pt-36 pb-16 lg:pb-24 overflow-hidden text-center bg-[#000000]">
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
                    <span>Institutional Grade Legal AI</span>
                    <span className="w-1 h-1 rounded-full bg-white/20 mx-1" />
                    <span className="text-white/20">v2.0 Beta</span>
                </motion.div>

                {/* MASSIVE TITLES */}
                <div className="mb-10 relative">
                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-3xl md:text-6xl lg:text-[85px] font-bold text-white mb-8 leading-[1.1] tracking-[-0.04em]"
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
                            Get Clear, Instant Legal Help <br />
                        </span>
                        <span className="text-shimmer italic inline-block mt-4">In Your Language.</span>
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-3xl mx-auto space-y-6"
                    >
                        <p className="text-lg md:text-2xl text-slate-400 font-medium leading-relaxed tracking-tight">
                            NyayNow is a centralized legal intelligence engine powered by <span className="text-white border-b border-blue-500/50">Autonomous AI Models</span>. Built for modern enterprises searching for clarity and the <span className="text-white">modernization</span> of Indian legal operations.
                        </p>
                        <p className="text-blue-400/80 text-xs font-black uppercase tracking-[0.3em] pb-4">
                            Automate Your Legal Intelligence With Institutional Grade Engineering
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
                            href={!user ? "/register" : "/client/dashboard"}
                            className="group relative w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-[#020617] font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 overflow-hidden"
                        >
                            <span className="relative z-10">
                                {!user ? "Enter System" : "Command Center"}
                            </span>
                            <ChevronRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </Link>
                    </MagneticButton>

                    <MagneticButton>
                        <Link
                            href="/legal-sos"
                            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-[#0F172A] border border-white/10 text-white font-bold text-lg hover:bg-white/5 hover:border-red-500/50 transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] group"
                        >
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                            </div>
                            <span>Activate Legal SOS</span>
                        </Link>
                    </MagneticButton>
                </motion.div>

                {/* BOTTOM TRUST SIGNAL */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 1 }}
                    className="mt-20 flex items-center justify-center gap-8 text-slate-500 text-xs font-bold uppercase tracking-[0.3em] overflow-hidden whitespace-nowrap opacity-50"
                >
                    <div className="flex items-center gap-2 group cursor-default hover:text-blue-400 transition-colors">
                        <Lock size={12} />
                        <span>256-Bit Encryption</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <div className="flex items-center gap-2 group cursor-default hover:text-emerald-400 transition-colors">
                        <ShieldCheck size={12} />
                        <span>BCI Guidelines Aware</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <div className="flex items-center gap-2 group cursor-default hover:text-amber-400 transition-colors">
                        <span className="text-base leading-none italic font-serif">A+</span>
                        <span>Global System Uptime</span>
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
