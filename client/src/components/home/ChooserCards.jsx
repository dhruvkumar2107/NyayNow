'use client'

import React, { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Sparkles, FileText, UserCheck, MapPin, 
    Mic, Scale, Search, Briefcase, ChevronRight 
} from "lucide-react"

export default function ChooserCards() {
    const [activeTab, setActiveTab] = useState("citizens") // "citizens" or "professionals"

    const citizenServices = [
        {
            title: "Ask a Legal Question",
            desc: "Get instant, AI-powered answers grounded in Indian Law (BNS & IPC).",
            link: "/assistant",
            icon: Sparkles,
            badge: "Free Trial",
            color: "from-blue-500/10 to-indigo-500/10 border-blue-500/30 hover:border-blue-500/80 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
            iconColor: "text-blue-400"
        },
        {
            title: "Find a Verified Lawyer",
            desc: "Consult top advocates filtered by city, budget, and language.",
            link: "/marketplace",
            icon: UserCheck,
            badge: "BCI Verified",
            color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/30 hover:border-emerald-500/80 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
            iconColor: "text-emerald-400"
        },
        {
            title: "Draft an Agreement",
            desc: "Draft rental agreements, NDAs, legal notices, and wills in minutes.",
            link: "/drafting",
            icon: FileText,
            badge: "Smart Templates",
            color: "from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/80 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
            iconColor: "text-purple-400"
        },
        {
            title: "Nearby Radar Map",
            desc: "Locate nearest police stations, local courts, and registered advocates.",
            link: "/nearby",
            icon: MapPin,
            badge: "Real-time Map",
            color: "from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-500/80 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
            iconColor: "text-amber-400"
        },
        {
            title: "Voice Search (NyayVoice)",
            desc: "Speak your queries directly in Hindi, Tamil, Telugu, and 11+ languages.",
            link: "/nyayvoice",
            icon: Mic,
            badge: "14+ Dialects",
            color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/30 hover:border-cyan-500/80 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
            iconColor: "text-cyan-400"
        }
    ]

    const professionalServices = [
        {
            title: "Outcome Predictor (Judge AI)",
            desc: "Analyze win probability, legal risks, and precedents from court cases.",
            link: "/judge-ai",
            icon: Sparkles,
            badge: "Advanced AI",
            color: "from-indigo-500/10 to-violet-500/10 border-indigo-500/30 hover:border-indigo-500/80 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]",
            iconColor: "text-indigo-400"
        },
        {
            title: "NyayCourt Trial Simulator",
            desc: "Practice argument delivery against interactive AI prosecution & judges.",
            link: "/nyaycourt-simulator",
            icon: Scale,
            badge: "Interactive simulation",
            color: "from-violet-500/10 to-fuchsia-500/10 border-violet-500/30 hover:border-violet-500/80 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
            iconColor: "text-violet-400"
        },
        {
            title: "Legal Precedent Search",
            desc: "Locate winning case law citations across 1.2M+ Indian judgments.",
            link: "/research",
            icon: Search,
            badge: "Semantic Search",
            color: "from-pink-500/10 to-rose-500/10 border-pink-500/30 hover:border-pink-500/80 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]",
            iconColor: "text-pink-400"
        },
        {
            title: "Advocate Portal & Lead Hub",
            desc: "Access client consultations, manage active slots, and premium plans.",
            link: "/pricing",
            icon: Briefcase,
            badge: "Pro Tools",
            color: "from-blue-500/10 to-sky-500/10 border-blue-500/30 hover:border-blue-500/80 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
            iconColor: "text-blue-400"
        }
    ]

    const activeServices = activeTab === "citizens" ? citizenServices : professionalServices

    return (
        <section className="relative py-16 bg-[#000000] overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        What would you like to do today?
                    </h2>
                    <p className="text-slate-400 text-base max-w-xl mx-auto mb-8 leading-relaxed">
                        Select a path below to access our direct services. No complicated menus, no guesswork.
                    </p>

                    {/* Tabs switcher */}
                    <div className="inline-flex bg-white/5 border border-white/10 p-1 rounded-2xl">
                        <button
                            onClick={() => setActiveTab("citizens")}
                            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === "citizens" ? "bg-white text-slate-950 shadow-lg shadow-white/5" : "text-slate-400 hover:text-white"}`}
                        >
                            For Citizens & Clients
                        </button>
                        <button
                            onClick={() => setActiveTab("professionals")}
                            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === "professionals" ? "bg-white text-slate-950 shadow-lg shadow-white/5" : "text-slate-400 hover:text-white"}`}
                        >
                            For Advocates & Professionals
                        </button>
                    </div>
                </div>

                {/* Services Grid */}
                <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode="wait">
                        {activeServices.map((card, idx) => {
                            const Icon = card.icon
                            return (
                                <motion.div
                                    key={card.title}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    className="flex h-full"
                                >
                                    <Link 
                                        href={card.link}
                                        className={`flex flex-col justify-between w-full p-6 sm:p-8 rounded-3xl border bg-gradient-to-br transition-all duration-500 group relative overflow-hidden text-left ${card.color}`}
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-bl-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                                        <div>
                                            <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-6 group-hover:scale-105 transition-transform duration-500">
                                                <Icon size={22} className={card.iconColor} />
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors duration-300">{card.title}</h3>
                                            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 font-medium">{card.desc}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 px-3 py-1 rounded-full bg-white/5 border border-white/10 group-hover:text-white group-hover:bg-white/10 transition-colors">
                                                {card.badge}
                                            </span>
                                            <span className="text-xs font-bold text-white group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                                                Launch
                                                <ChevronRight size={14} />
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    )
}
