import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Briefcase, MapPin, Clock, ArrowRight, Sparkles, Zap, Heart, Globe, Coffee, TrendingUp } from 'lucide-react';

const JOBS = [
    {
        id: 'senior-ai-engineer',
        title: "Senior AI Engineer (LLM Implementation)",
        type: "Full-time",
        location: "Remote / Bengaluru",
        level: "Senior",
        desc: "Lead the development of our core legal reasoning models. You'll own our RAG pipelines, fine-tune Llama/Mistral, and push the frontier of domain-specific LLMs. Python, LangChain, and vector DBs required.",
        tags: ["Python", "LLMs", "RAG", "LangChain"],
    },
    {
        id: 'fullstack-dev',
        title: "Full Stack Developer (MERN + AI Integration)",
        type: "Full-time",
        location: "Remote",
        level: "Mid–Senior",
        desc: "Build the interfaces and APIs that bring AI to millions of users. Own features end-to-end across React, Node.js, MongoDB, and our AI pipeline integrations. Strong UI/UX sensibility is a plus.",
        tags: ["React", "Node.js", "MongoDB", "API Design"],
    },
    {
        id: 'legal-domain-expert',
        title: "Legal Domain Expert & AI Trainer",
        type: "Contract / Full-time",
        location: "Delhi NCR / Remote",
        level: "Mid-level",
        desc: "Collaborate directly with our AI team to ensure precision in legal reasoning. You'll create training datasets, review AI outputs, and help build the most accurate legal AI for India. LLB required.",
        tags: ["Indian Law", "AI Training", "Research", "LLB"],
    },
    {
        id: 'growth-product',
        title: "Growth & Product Marketing Manager",
        type: "Full-time",
        location: "Gurugram / Remote",
        level: "Mid-level",
        desc: "Drive user acquisition, retention, and go-to-market strategy for a category-defining legal tech platform. Experience with B2B SaaS, content marketing, and analytics tools preferred.",
        tags: ["Growth", "B2B SaaS", "Analytics", "Marketing"],
    },
];

const PERKS = [
    { icon: <Globe size={20} />, title: "Remote-First", desc: "Work from anywhere in India. We have no mandatory office days." },
    { icon: <TrendingUp size={20} />, title: "Meaningful Equity", desc: "Be an owner. We offer ESOP to every employee from day one." },
    { icon: <Coffee size={20} />, title: "₹18K Learning Budget", desc: "Annual budget for courses, books, conferences, and certifications." },
    { icon: <Heart size={20} />, title: "Health Insurance", desc: "₹5 Lakh health cover for you and your dependents." },
    { icon: <Zap size={20} />, title: "Top-of-Market Pay", desc: "We benchmark aggressively against the best startups in India." },
    { icon: <Sparkles size={20} />, title: "Real Ownership", desc: "Ship features used by thousands. No bureaucracy, no red tape." },
];

const LEVEL_COLOR = {
    'Senior': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Mid–Senior': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'Mid-level': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

export default function Careers() {
    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">
            <Navbar />

            {/* HERO */}
            <div className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/8 rounded-full blur-[120px] pointer-events-none" />
                <div className="relative z-10 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {JOBS.length} Open Positions
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight font-serif"
                    >
                        Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Legal Revolution.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-light mb-10"
                    >
                        We're building the intelligence layer for the Indian Justice System. Work on problems that matter — LLMs, high-scale systems, and products that help millions access justice.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-4 text-sm"
                    >
                        {["Startup India Recognized", "Remote-First", "ESOP from Day 1", "Mission-Driven"].map((t, i) => (
                            <span key={i} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-slate-300 font-medium">{t}</span>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* PERKS */}
            <section className="pb-20 px-6 max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-white text-center mb-10 font-serif">Why NyayNow?</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {PERKS.map((perk, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-4 p-5 bg-white/[0.03] border border-white/8 rounded-xl hover:bg-white/[0.05] transition group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                                {perk.icon}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm mb-1">{perk.title}</h3>
                                <p className="text-slate-500 text-xs leading-relaxed">{perk.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* JOBS GRID */}
            <section className="pb-12 px-6 max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-8 font-serif text-center">Open Roles</h2>
                <div className="grid gap-5">
                    {JOBS.map((job, i) => (
                        <JobCard key={job.id} {...job} delay={i * 0.05} />
                    ))}
                </div>

                {/* OPEN APPLICATION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 text-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/10 rounded-3xl p-12 relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold text-white mb-4 font-serif">Don't see a perfect fit?</h3>
                        <p className="text-slate-400 mb-8 max-w-lg mx-auto text-lg font-light">
                            We are always looking for exceptional, mission-driven talent. Send your résumé and a short note on why you belong here.
                        </p>
                        <a
                            href={`mailto:nyaynow.in@gmail.com?subject=Open Application — [Your Role]&body=Hi NyayNow Team,%0A%0AI'd love to join the mission. Here's a bit about myself:%0A%0A`}
                            className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition shadow-[0_0_20px_rgba(255,255,255,0.15)] inline-flex items-center gap-2"
                        >
                            Email Us <ArrowRight size={18} />
                        </a>
                    </div>
                </motion.div>
            </section>

            <Footer />
        </div>
    );
}

function JobCard({ title, type, location, level, desc, tags, delay }) {
    const emailSubject = `Application: ${title}`;
    const emailBody = `Hi NyayNow Team,%0A%0AI'm applying for the ${title} position.%0A%0AAbout me:%0A`;
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="bg-white/[0.03] border border-white/8 hover:border-indigo-500/40 hover:bg-white/[0.05] p-8 rounded-2xl transition-all duration-300 group"
        >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{title}</h3>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${LEVEL_COLOR[level] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                            {level}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wider mb-4">
                        <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                            <Clock size={12} /> {type}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                            <MapPin size={12} /> {location}
                        </span>
                    </div>
                    <p className="text-slate-400 mb-5 max-w-3xl leading-relaxed text-base font-light">{desc}</p>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg border border-indigo-500/20 font-medium">{tag}</span>
                        ))}
                    </div>
                </div>
                <a
                    href={`mailto:nyaynow.in@gmail.com?subject=${emailSubject}&body=${emailBody}`}
                    className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 text-sm whitespace-nowrap"
                >
                    Apply Now <ArrowRight size={16} />
                </a>
            </div>
        </motion.div>
    );
}
