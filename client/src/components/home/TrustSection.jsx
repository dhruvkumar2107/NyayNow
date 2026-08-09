"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HelpCircle, 
    ArrowRight, 
    UserCheck, 
    ShieldCheck, 
    MessageSquare, 
    ChevronRight, 
    Star, 
    Briefcase, 
    Sparkles, 
    Check,
    Scale,
    Award
} from 'lucide-react';
import Link from 'next/link';

export default function TrustSection() {
    const [activeTab, setActiveTab] = useState('citizen'); // 'citizen' or 'lawyer'

    const citizenSteps = [
        {
            step: "01",
            title: "Ask in Plain Language",
            desc: "Type or speak your legal query in English, Hindi, or 12 regional Indian languages. No complex legalese needed.",
            icon: MessageSquare,
            color: "from-blue-500 to-indigo-500",
            glow: "rgba(59, 130, 246, 0.15)",
        },
        {
            step: "02",
            title: "Review AI Guidance",
            desc: "Instant breakdown of your legal situation, grounded strictly in BNS (2024) codes and relevant High Court/Supreme Court precedents.",
            icon: Sparkles,
            color: "from-indigo-500 to-purple-500",
            glow: "rgba(139, 92, 246, 0.15)",
        },
        {
            step: "03",
            title: "Consult Vetted Lawyers",
            desc: "If needed, connect securely with a verified lawyer specialized in your case area for representation or formal advice.",
            icon: ShieldCheck,
            color: "from-purple-500 to-pink-500",
            glow: "rgba(236, 72, 153, 0.15)",
        }
    ];

    const lawyerSteps = [
        {
            step: "01",
            title: "Secure DigiLocker KYC",
            desc: "Verify your license credentials using digital signature and Bar Council of India database matching in under 2 minutes.",
            icon: UserCheck,
            color: "from-emerald-500 to-teal-500",
            glow: "rgba(16, 185, 129, 0.15)",
        },
        {
            step: "02",
            title: "Setup Your ERP Cockpit",
            desc: "Access your dashboard to manage case deadlines, track invoices, organize research folders, and schedule appointments.",
            icon: Briefcase,
            color: "from-teal-500 to-cyan-500",
            glow: "rgba(6, 182, 212, 0.15)",
        },
        {
            step: "03",
            title: "Acquire Vetted Clients",
            desc: "Receive qualified consultation inquiries matching your specialization and consult securely via internal HD video/chat.",
            icon: ChevronRight,
            color: "from-cyan-500 to-blue-500",
            glow: "rgba(59, 130, 246, 0.15)",
        }
    ];


    return (
        <section className="py-24 bg-[#020617] border-t border-white/5 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none mesh-gradient-warm" />
            <div className="absolute inset-0 pattern-grid-fine pointer-events-none opacity-20" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* ─── HOW IT WORKS (Citizen vs Lawyer Steps) ─────── */}
                <div className="mb-32">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <p className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-4">How it works</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 text-gradient-premium">
                            Simplifying Justice in 3 Steps
                        </h2>
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium mt-4">
                            Every step is guided by Bar Council of India compliance, BNS 2024 legal standards,
                            and Supreme Court precedents — so you always have accurate, trusted legal guidance.
                        </p>
                        
                        {/* Tab Switcher */}
                        <div className="inline-flex bg-glass border border-white/10 p-1.5 rounded-2xl gap-1 mt-6">
                            <button
                                onClick={() => setActiveTab('citizen')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                                    activeTab === 'citizen'
                                    ? 'bg-white text-slate-950 shadow-lg'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                For Citizens
                            </button>
                            <button
                                onClick={() => setActiveTab('lawyer')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                                    activeTab === 'lawyer'
                                    ? 'bg-white text-slate-950 shadow-lg'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                For Lawyers
                            </button>
                        </div>
                    </div>

                    {/* Step Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <AnimatePresence mode="wait">
                            {(activeTab === 'citizen' ? citizenSteps : lawyerSteps).map((step, idx) => {
                                const Icon = step.icon;
                                return (
                                    <motion.div
                                        key={`${activeTab}-${step.step}`}
                                        initial={{ opacity: 0, y: 25 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -25 }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                        className="relative p-8 rounded-3xl card-premium flex flex-col justify-between group shadow-xl"
                                        style={{ '--card-glow': step.glow }}
                                    >
                                        <div className="absolute top-6 right-6 text-6xl font-black text-white/5 select-none font-mono tracking-tighter group-hover:text-blue-500/10 transition-colors">
                                            {step.step}
                                        </div>
                                        
                                        {/* Floating orb */}
                                        <motion.div
                                            animate={{ y: [0, -10, 0], scale: [1, 1.02, 1] }}
                                            transition={{ duration: 4, repeat: Infinity, delay: idx * 0.5 }}
                                            className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
                                            style={{ background: step.glow }}
                                        />
                                        
                                        <div className="space-y-6 relative z-10">
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 3 }}
                                                transition={{ duration: 0.3 }}
                                                className={`w-12 h-12 rounded-2xl p-0.5 flex items-center justify-center shadow-lg bg-gradient-to-br ${step.color}`}
                                            >
                                                <div className="w-full h-full rounded-[14px] bg-[#020617] flex items-center justify-center">
                                                    <Icon size={20} className="text-white" />
                                                </div>
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-blue-400 transition-colors">{step.title}</h3>
                                                <p className="text-slate-400 text-sm leading-relaxed font-medium">{step.desc}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-6 mt-6 border-t border-white/5 relative z-10">
                                            <Link 
                                                href={activeTab === 'citizen' ? '/assistant' : '/register'}
                                                className="inline-flex items-center gap-1.5 text-xs text-blue-500 font-bold uppercase tracking-wider group-hover:gap-3 transition-all hover:text-amber-400"
                                            >
                                                Start Step <ArrowRight size={12} />
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* TRUST INDICATORS */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="border-t border-white/5 pt-16"
                >
                    <div className="text-center mb-12">
                        <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">Trusted by Legal Professionals</p>
                        <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight text-gradient-emerald">
                            Verified. Compliant. Secure.
                        </h3>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { icon: ShieldCheck, title: "BCI Verified", desc: "Every lawyer verified against Bar Council of India records", color: "text-blue-400", glow: "rgba(59, 130, 246, 0.15)" },
                            { icon: Award, title: "DigiLocker KYC", desc: "Aadhaar & COP verification via government infrastructure", color: "text-emerald-400", glow: "rgba(16, 185, 129, 0.15)" },
                            { icon: Scale, title: "BNS 2024 Compliant", desc: "All AI responses grounded in current Indian criminal law", color: "text-purple-400", glow: "rgba(139, 92, 246, 0.15)" },
                            { icon: Star, title: "Bank-Grade Security", desc: "End-to-end encryption & SOC 2 compliant infrastructure", color: "text-amber-400", glow: "rgba(245, 158, 11, 0.15)" },
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="card-premium-interactive p-6 text-center"
                                style={{ '--card-glow': item.glow }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 2 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-glass border border-white/10 flex items-center justify-center"
                                >
                                    <item.icon size={28} className={item.color} />
                                </motion.div>
                                <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}