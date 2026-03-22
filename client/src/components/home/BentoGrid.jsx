'use client'

import React, { useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Scale, Mic, Users, FileText, Search, Briefcase, ChevronRight, Globe, Zap } from "lucide-react"

export function BentoGrid() {
    return (
        <section className="py-32 relative overflow-hidden bg-[#000000] border-y border-white/5">
            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8"
                    >
                        Elite Ecosystem
                    </motion.div>
                    <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter">Everything Law. <br /><span className="text-white/40">In one place.</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[220px]">
                    <BentoCard
                        title="NyayCourt Simulator"
                        desc="Neural AI Judges that evaluate every nuance of your oral arguments in a simulated trial."
                        icon={<Scale className="text-white" size={20} />}
                        color="from-blue-600 via-indigo-600 to-indigo-500"
                        href="/courtroom-battle"
                        badge="Flagship"
                        className="md:col-span-8 md:row-span-2"
                        isLarge={true}
                    />
                    <BentoCard
                        title="NyayVoice AI"
                        desc="Democratizing law in 14+ Indian dialects. Breaking the English barrier for 1.4B people."
                        icon={<Mic className="text-white" size={20} />}
                        color="from-cyan-500 via-blue-500 to-indigo-500"
                        href="/voice-assistant"
                        badge="Every Language"
                        className="md:col-span-4 md:row-span-1"
                    />
                    {/* <BentoCard
                        title="Elite Network"
                        desc="Direct access to the top 1% of India's verified legal minds."
                        icon={<Users className="text-white" size={20} />}
                        color="from-blue-500 via-blue-600 to-indigo-600"
                        href="/marketplace"
                        badge="Verified"
                        className="md:col-span-4 md:row-span-2"
                    /> */}
                    <BentoCard
                        title="Drafting Lab"
                        desc="Deploy Agentic AI to autonomously draft and negotiate enterprise contracts."
                        icon={<FileText className="text-white" size={20} />}
                        color="from-blue-400 via-cyan-500 to-emerald-500"
                        href="/drafting"
                        className="md:col-span-4 md:row-span-1"
                    />
                    <BentoCard
                        title="Precedent Engine"
                        desc="Find winning precedents across judicial records with neural semantic search."
                        icon={<Search className="text-white" size={20} />}
                        color="from-indigo-500 via-violet-500 to-purple-500"
                        href="/research"
                        className="md:col-span-12 md:row-span-1"
                    />
                    {/* <BentoCard
                        title="Career Hub"
                        desc="Exclusive internships and mentorship programs for advocates."
                        icon={<Briefcase className="text-white" size={20} />}
                        color="from-blue-600 via-indigo-700 to-indigo-800"
                        href="/career"
                        className="md:col-span-4 md:row-span-1"
                    /> */}
                </div>
            </div>
        </section>
    )
}

function BentoCard({ title, desc, icon, color, href, badge, className, isLarge }) {
    const divRef = useRef(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [opacity, setOpacity] = useState(0)
    const [rotate, setRotate] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e) => {
        if (!divRef.current) return
        const rect = divRef.current.getBoundingClientRect()

        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setPosition({ x, y })

        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = (y - centerY) / 20
        const rotateY = (centerX - x) / 20
        setRotate({ x: rotateX, y: rotateY })
    }

    const handleMouseLeave = () => {
        setOpacity(0)
        setRotate({ x: 0, y: 0 })
    }

    return (
        <motion.div
            style={{
                perspective: 1000
            }}
            className={className}
        >
            <Link
                ref={divRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setOpacity(1)}
                onMouseLeave={handleMouseLeave}
                href={href}
                animate={{
                    rotateX: rotate.x,
                    rotateY: rotate.y
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`relative group bg-[#020617]/50 border border-white/5 rounded-[32px] ${isLarge ? 'p-12 md:p-16' : 'p-8'} overflow-hidden hover:border-blue-500/20 transition-all duration-700 flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover-perspective`}
            >
                {/* SPOTLIGHT */}
                <div
                    className="pointer-events-none absolute -inset-px transition-opacity duration-300"
                    style={{
                        opacity,
                        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, 0.08), transparent 40%)`,
                    }}
                />

                <div className={`absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br ${color} blur-[120px] opacity-[0.03] group-hover:opacity-[0.1] transition-opacity duration-1000`} />

                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-8">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500 border border-white/10`}>
                            {React.cloneElement(icon, { size: 24 })}
                        </div>
                        {badge && (
                            <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-blue-400 transition-colors">
                                {badge}
                            </span>
                        )}
                    </div>

                    <div className="mt-auto">
                        <h3 className={`${isLarge ? 'text-3xl' : 'text-xl'} font-bold text-white mb-3 tracking-tight group-hover:text-blue-400 transition-colors duration-500`}>
                            {title}
                        </h3>
                        <p className={`text-slate-500 ${isLarge ? 'text-lg max-w-md' : 'text-sm'} leading-relaxed font-medium group-hover:text-slate-300 transition-colors`}>
                            {desc}
                        </p>

                        <div className="mt-8 flex items-center gap-2 text-white/20 font-black text-[10px] uppercase tracking-[0.3em] group-hover:text-blue-500 group-hover:gap-4 transition-all duration-500">
                            Explore <ChevronRight size={14} />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
