import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Shield, Users, Globe, Award, Zap, Target, Heart, Code2, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const STATS = [
    { number: "1M+", label: "Case Laws Indexed", icon: <Scale size={20} />, color: 'text-indigo-400' },
    { number: "50k+", label: "Documents Drafted", icon: <Zap size={20} />, color: 'text-amber-400' },
    { number: "98%", label: "Accuracy Rate", icon: <Award size={20} />, color: 'text-emerald-400' },
    { number: "24/7", label: "AI Availability", icon: <Globe size={20} />, color: 'text-purple-400' },
];

const VALUES = [
    {
        icon: <Target size={28} />,
        title: "Radical Accessibility",
        desc: "Legal knowledge should not be a luxury. We price our tools to make professional-grade legal intelligence accessible to every Indian citizen.",
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    },
    {
        icon: <Shield size={28} />,
        title: "Privacy First",
        desc: "Your case data is yours. We use AES-256 encryption, process your files in isolated sandboxes, and never train our models on your private documents.",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
        icon: <Heart size={28} />,
        title: "Human-Centered AI",
        desc: "We build AI that empowers lawyers and citizens, not replaces them. Every output includes sourced references so you can verify and question everything.",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20"
    },
    {
        icon: <Code2 size={28} />,
        title: "Built for India",
        desc: "Trained on BNS, BNSS, BSA, IPC, CrPC, CPC and every major Indian state law. Not a Western AI wrapped with an Indian flag — built from the ground up.",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
];

const TIMELINE = [
    { year: "2024", label: "Founded", desc: "NyayNow incorporated. Core legal reasoning engine development begins." },
    { year: "Q1 2025", label: "Beta Launch", desc: "First 500 beta users. AI Legal Assistant and Drafting Lab released." },
    { year: "Q3 2025", label: "Judge AI", desc: "Win Probability Predictor launched. 94% historical accuracy validated." },
    { year: "Q4 2025", label: "Marketplace", desc: "Verified Lawyer Marketplace with 200+ verified advocates goes live." },
    { year: "2026", label: "NyayVoice + NyayCourt", desc: "Multilingual voice AI and AI Courtroom Battle Simulator released. Startup India recognition." },
];

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">
            <Navbar />

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[120px] pointer-events-none mix-blend-screen" />
                <div className="absolute top-32 right-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] pointer-events-none" />
                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-8"
                    >
                        <Sparkles size={12} /> Our Mission
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight"
                    >
                        Democratizing Justice on <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Internet Scale.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light mb-12"
                    >
                        NyayNow is building the world's most advanced legal operating system for India. We bridge the gap between complex legal systems and 1.4 billion people who deserve access to justice.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <a href="/assistant" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition inline-flex items-center gap-2">
                            Try Our AI <ArrowRight size={18} />
                        </a>
                        <a href="/careers" className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition inline-flex items-center gap-2">
                            Join Our Team <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Hiring</span>
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* STATS ROW */}
            <section className="py-12 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((s, i) => (
                        <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.05 }} className="text-center group cursor-default">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4 group-hover:scale-110 transition-transform ${s.color}`}>
                                {s.icon}
                            </div>
                            <div className={`text-4xl font-bold text-white mb-2 tracking-tight ${s.color}`}>{s.number}</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* PROBLEM / SOLUTION */}
            <section className="py-24 relative">
                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
                    <motion.div {...fadeUp} className="p-10 rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/8 to-transparent relative overflow-hidden group hover:border-red-500/40 transition duration-500 shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition">
                            <Shield size={80} className="text-red-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-6 font-serif">The Problem</h3>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            Legal services have historically been opaque, expensive, and inaccessible. For the average citizen, navigating the court system is daunting. For lawyers, hours are wasted on repetitive research that AI can do in seconds.
                        </p>
                        <div className="mt-6 space-y-2">
                            {["2.5M+ pending cases in Indian courts", "Only 1 lawyer per 1,200 citizens", "Average legal fee: ₹5,000+ per consultation"].map((p, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-slate-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/60 flex-shrink-0" />
                                    {p}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                    <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="p-10 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 to-transparent relative overflow-hidden group hover:border-emerald-500/40 transition duration-500 shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition">
                            <Zap size={80} className="text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-6 font-serif">Our Solution</h3>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            We deploy Large Legal Models trained on 50 years of Indian case law. Our AI doesn't just retrieve information; it reasons, drafts, and predicts outcomes with unprecedented precision — in English, Hindi, and regional languages.
                        </p>
                        <div className="mt-6 space-y-2">
                            {["Legal Q&A in 10+ Indian languages", "Document drafting in under 60 seconds", "94% win-probability prediction accuracy"].map((p, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-slate-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 flex-shrink-0" />
                                    {p}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* VALUES */}
            <section className="py-12 border-t border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-4">What We Stand For</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Our core principles guide every product decision we make.</p>
                    </motion.div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {VALUES.map((v, i) => (
                            <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.07 }}
                                className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/20 transition-all duration-300 group cursor-default"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${v.color} group-hover:scale-110 transition-transform duration-300`}>
                                    {v.icon}
                                </div>
                                <h3 className="text-white font-bold text-lg mb-3 font-serif">{v.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TIMELINE */}
            <section className="py-24 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-4">Our Journey</h2>
                        <p className="text-slate-400">Built fast. Built in India. Built for justice.</p>
                    </motion.div>
                    <div className="relative">
                        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/30 to-transparent" />
                        <div className="space-y-10">
                            {TIMELINE.map((item, i) => (
                                <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }} className="flex gap-8 items-start pl-4">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 border-4 border-[#020617] flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        </div>
                                    </div>
                                    <div className="pb-2">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-indigo-400 font-bold text-sm">{item.year}</span>
                                            <span className="text-white font-bold">{item.label}</span>
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 border-t border-white/5">
                <motion.div {...fadeUp} className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-6">Be part of the Legal Revolution</h2>
                    <p className="text-slate-400 mb-10 text-lg leading-relaxed">
                        We're a small team solving a massive problem. If democratizing justice with AI excites you, we want to talk.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/careers" className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 inline-flex items-center justify-center gap-2 transition shadow-xl">
                            Explore Careers <ArrowRight size={18} />
                        </a>
                        <a href="/contact" className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl inline-flex items-center justify-center gap-2 transition">
                            Get in Touch
                        </a>
                    </div>
                </motion.div>
            </section>

            <Footer />
        </div>
    );
}
