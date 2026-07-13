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
    Check 
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
            color: "from-blue-500 to-indigo-500"
        },
        {
            step: "02",
            title: "Review AI Guidance",
            desc: "Instant breakdown of your legal situation, grounded strictly in BNS (2024) codes and relevant High Court/Supreme Court precedents.",
            icon: Sparkles,
            color: "from-indigo-500 to-purple-500"
        },
        {
            step: "03",
            title: "Consult Vetted Lawyers",
            desc: "If needed, connect securely with a verified lawyer specialized in your case area for representation or formal advice.",
            icon: ShieldCheck,
            color: "from-purple-500 to-pink-500"
        }
    ];

    const lawyerSteps = [
        {
            step: "01",
            title: "Secure DigiLocker KYC",
            desc: "Verify your license credentials using digital signature and Bar Council of India database matching in under 2 minutes.",
            icon: UserCheck,
            color: "from-emerald-500 to-teal-500"
        },
        {
            step: "02",
            title: "Setup Your ERP Cockpit",
            desc: "Access your dashboard to manage case deadlines, track invoices, organize research folders, and schedule appointments.",
            icon: Briefcase,
            color: "from-teal-500 to-cyan-500"
        },
        {
            step: "03",
            title: "Acquire Vetted Clients",
            desc: "Receive qualified consultation inquiries matching your specialization and consult securely via internal HD video/chat.",
            icon: ChevronRight,
            color: "from-cyan-500 to-blue-500"
        }
    ];



    return (
        <section className="py-24 bg-[#020617] border-t border-white/5 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[130px]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[130px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* ─── HOW IT WORKS (Citizen vs Lawyer Steps) ─────── */}
                <div className="mb-32">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <p className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-4">How it works</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
                            Simplifying Justice in 3 Steps
                        </h2>
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium mt-4">
                            Every step is guided by Bar Council of India compliance, BNS 2024 legal standards,
                            and Supreme Court precedents — so you always have accurate, trusted legal guidance.
                        </p>
                        
                        {/* Tab Switcher */}
                        <div className="inline-flex bg-white/5 border border-white/10 p-1.5 rounded-2xl gap-1 mt-6">
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
                                        className="relative p-8 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col justify-between group shadow-xl"
                                    >
                                        <div className="absolute top-6 right-6 text-6xl font-black text-white/5 select-none font-mono tracking-tighter group-hover:text-blue-500/10 transition-colors">
                                            {step.step}
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} p-0.5 flex items-center justify-center shadow-lg`}>
                                                <div className="w-full h-full rounded-[14px] bg-[#020617] flex items-center justify-center">
                                                    <Icon size={20} className="text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-blue-400 transition-colors">{step.title}</h3>
                                                <p className="text-slate-400 text-sm leading-relaxed font-medium">{step.desc}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-6 mt-6 border-t border-white/5">
                                            <Link 
                                                href={activeTab === 'citizen' ? '/assistant' : '/register'}
                                                className="inline-flex items-center gap-1.5 text-xs text-blue-500 font-bold uppercase tracking-wider group-hover:gap-3 transition-all"
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

            </div>
        </section>
    );
}
