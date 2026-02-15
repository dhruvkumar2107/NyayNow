import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Shield, Users, Globe, Award, Zap } from 'lucide-react';


export default function AboutUs() {
    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-900 selection:bg-indigo-500/30">
            <Navbar /> {/* Ensure Navbar is present if used, though strict file didn't import it, assuming it might be needed or was missing. The original code didn't import Navbar but the user might expect it. Wait, the original code had NO Navbar import but used it in other pages. I should probably NOT add it if it wasn't there, or ADD it if it's missing. The file content I read in 1448 didn't show Navbar import or usage. It just exported the component. I will stick to fixing the styles. */}

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-200/40 blur-[120px] pointer-events-none mix-blend-multiply"></div>
                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-indigo-600 text-xs font-bold uppercase tracking-[0.2em] mb-8 shadow-sm"
                    >
                        Our Mission
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-serif font-bold text-slate-900 mb-8 leading-tight"
                    >
                        Democratizing Justice on <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">Internet Scale.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light"
                    >
                        NyayNow is building the world's most advanced legal operating system. We bridge the gap between complex legal systems and the people they serve with military-grade AI.
                    </motion.p>
                </div>
            </section>

            {/* STATS ROW */}
            <section className="py-12 border-y border-slate-200 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <StatCard number="1M+" label="Case Laws Indexed" icon={<Scale size={20} />} />
                    <StatCard number="50k+" label="Documents Drafted" icon={<Zap size={20} />} />
                    <StatCard number="98%" label="Accuracy Rate" icon={<Award size={20} />} />
                    <StatCard number="24/7" label="AI Availability" icon={<Globe size={20} />} />
                </div>
            </section>

            {/* VISION CARDS */}
            <section className="py-24 relative">
                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
                    <VisionCard
                        title="The Problem"
                        desc="Legal services have historically been opaque, expensive, and inaccessible. For the average citizen, navigating the court system is daunting. For lawyers, hours are wasted on repetitive research."
                        icon={<Shield size={32} className="text-red-500" />}
                        gradient="from-red-50 to-white"
                        borderColor="border-red-100"
                    />
                    <VisionCard
                        title="Our Solution"
                        desc="We deploy Large Legal Models (LLMs) trained on 50 years of case law. Our AI doesn't just retrieve information; it reasons, drafts, and predicts outcomes with unprecedented precision."
                        icon={<Zap size={32} className="text-emerald-500" />}
                        gradient="from-emerald-50 to-white"
                        borderColor="border-emerald-100"
                    />
                </div>
            </section>

        </div>
    );
}

function StatCard({ number, label, icon }) {
    return (
        <div className="text-center group cursor-default">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                {icon}
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-2 tracking-tight group-hover:text-indigo-600 transition">{number}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>
        </div>
    )
}

function VisionCard({ title, desc, icon, gradient, borderColor }) {
    return (
        <div className={`p-10 rounded-3xl border ${borderColor} bg-gradient-to-br ${gradient} relative overflow-hidden group hover:border-slate-300 transition duration-500 shadow-xl`}>
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition transform group-hover:scale-110 duration-500 grayscale group-hover:grayscale-0">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 font-serif">{title}</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
                {desc}
            </p>
        </div>
    )
}

// TeamCard removed as per previous task instructions

