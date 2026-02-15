import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

import { Briefcase, MapPin, Clock, ArrowRight, Sparkles } from 'lucide-react';

export default function Careers() {
    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">
            <Navbar />

            {/* HERO */}
            <div className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <Sparkles size={14} /> We Are Hiring
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                        Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Legal Revolution.</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-light">
                        Help us build the intelligence layer for the Indian Justice System. Work on cutting-edge LLMs, high-scale systems, and products that impact millions.
                    </motion.p>
                </div>
            </div>

            {/* JOBS GRID */}
            <div className="max-w-5xl mx-auto px-6 pb-24">
                <div className="grid gap-6">
                    <JobCard
                        title="Senior AI Engineer (LLM Implementation)"
                        type="Full-time"
                        location="Remote / Bangalore"
                        desc="Lead the development of our core legal reasoning models. Experience with RAG pipelines, fine-tuning Llama/Mistral, and Python is a must."
                        delay={0.3}
                    />
                    <JobCard
                        title="Full Stack Developer (MERN)"
                        type="Full-time"
                        location="Remote"
                        desc="Build beautiful, responsive interfaces and robust APIs. Extensive experience with React, Node.js, and MongoDB required."
                        delay={0.4}
                    />
                    <JobCard
                        title="Legal Domain Expert"
                        type="Contract / Full-time"
                        location="Delhi NCR"
                        desc="Collaborate with engineers to ensure our AI models accurately reflect Indian Penal Code and case laws. Law degree required."
                        delay={0.5}
                    />
                </div>

                {/* CALL TO ACTION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 text-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/10 rounded-3xl p-12 relative overflow-hidden group shadow-2xl"
                >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold text-white mb-4">Don't see a fit?</h3>
                        <p className="text-slate-400 mb-8 max-w-lg mx-auto text-lg">
                            We are always looking for exceptional talent. If you think you can make a difference, send your resume and a short note about why you belong here.
                        </p>
                        <a href="mailto:nyaynow.in@gmail.com" className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition shadow-[0_0_20px_rgba(255,255,255,0.2)] inline-flex items-center gap-2">
                            Email Us <ArrowRight size={18} />
                        </a>
                    </div>
                </motion.div>
            </div>


        </div>
    );
}

function JobCard({ title, type, location, desc, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="bg-[#0f172a]/80 border border-white/10 hover:border-indigo-500/50 hover:bg-[#1e293b]/80 p-8 rounded-2xl transition-all duration-300 cursor-pointer group backdrop-blur-md"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{title}</h3>
                <div className="flex gap-3 text-xs font-bold uppercase tracking-wider">
                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                        <Clock size={12} /> {type}
                    </span>
                    <span className="bg-white/5 text-slate-400 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1">
                        <MapPin size={12} /> {location}
                    </span>
                </div>
            </div>
            <p className="text-slate-400 mb-6 max-w-3xl leading-relaxed text-lg font-light">{desc}</p>
            <div className="flex items-center text-indigo-400 font-bold text-sm tracking-wide group-hover:text-white transition gap-2">
                View Details & Apply <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </motion.div>
    )
}
