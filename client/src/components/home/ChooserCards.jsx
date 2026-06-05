'use client'

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { HelpCircle, UserCheck, Briefcase } from "lucide-react"

export default function ChooserCards() {
    const cards = [
        {
            title: "I need legal information",
            desc: "Ask questions, draft basic documents, and check status using our localized legal AI.",
            badge: "1-2 Free Trial Queries",
            link: "/assistant",
            icon: HelpCircle,
            color: "from-blue-500/10 to-indigo-500/10 border-blue-500/30 hover:border-blue-500/80 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
        },
        {
            title: "I need a lawyer",
            desc: "Connect directly with verified advocates filtered by specialization, city, language, and budget.",
            badge: "Verified Advocates Only",
            link: "/marketplace",
            icon: UserCheck,
            color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/30 hover:border-emerald-500/80 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
        },
        {
            title: "I'm a legal professional",
            desc: "Access pro tools, advanced courtroom simulator, drafting labs, and lead pool dashboard.",
            badge: "Advocate Portal",
            link: "/pricing",
            icon: Briefcase,
            color: "from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-500/80 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
        }
    ]

    return (
        <section className="relative py-16 bg-[#000000] overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card, idx) => {
                        const Icon = card.icon
                        return (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="flex"
                            >
                                <Link 
                                    href={card.link}
                                    className={`flex flex-col justify-between w-full p-8 rounded-2xl border bg-gradient-to-br transition-all duration-500 group relative overflow-hidden ${card.color}`}
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-bl-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                                    <div>
                                        <div className="inline-flex p-3.5 rounded-xl bg-white/5 border border-white/10 text-white mb-6 group-hover:scale-110 transition-transform duration-500">
                                            <Icon size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{card.title}</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed mb-6">{card.desc}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 py-1 rounded-full bg-white/5 border border-white/10 group-hover:text-white group-hover:bg-white/10 transition-colors">
                                            {card.badge}
                                        </span>
                                        <span className="text-sm font-bold text-white group-hover:translate-x-1.5 transition-transform flex items-center gap-1.5">
                                            Explore
                                            <span aria-hidden="true">→</span>
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
