import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';


export default function Blog() {
    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">

            {/* HERO */}
            <section className="relative pt-32 pb-24 px-6 text-center border-b border-white/5 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto relative z-10"
                >
                    <span className="flex items-center justify-center gap-2 text-xs font-bold text-gold-400 uppercase tracking-widest mb-6">
                        <Sparkles size={14} /> NyayNow Insights
                    </span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight">
                        The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Legal Intelligence.</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Deep dives into LegalTech, summaries of landmark judgments, and updates on our AI models.
                    </p>
                </motion.div>
            </section>

            {/* FEATURED POST */}
            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center bg-white/5 rounded-3xl p-8 md:p-12 border border-white/10 hover:border-indigo-500/30 transition duration-500 cursor-pointer group">
                    <div className="aspect-video bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl overflow-hidden relative shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-9xl opacity-20 filter blur-sm">⚖️</span>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30 uppercase tracking-wider">LegalTech</span>
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Feb 14, 2026</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif leading-tight group-hover:text-indigo-400 transition">
                            How AI is Predicting Supreme Court Judgments with 94% Accuracy
                        </h2>
                        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                            An inside look at the transformer models powering our Judge AI and how predictive justice is reshaping litigation strategy for modern law firms.
                        </p>
                        <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-widest group-hover:text-indigo-400 transition">
                            Read Full Article <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
                        </div>
                    </div>
                </div>
            </section>

            {/* RECENT ARTICLES */}
            <section className="pb-24 px-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-4">
                    <h3 className="text-2xl font-bold text-white font-serif">Recent Articles</h3>
                    <a href="#" className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition">View Archive →</a>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <BlogCard
                        category="Updates"
                        date="Feb 10, 2026"
                        title="Introducing NyayVoice: Legal Assistance in 10+ Indian Languages"
                        desc="Breaking the language barrier in Indian law. How we trained our speech-to-text models on regional dialects."
                        gradient="from-purple-900 to-indigo-900"
                    />
                    <BlogCard
                        category="Rights"
                        date="Feb 05, 2026"
                        title="The Rent Control Act: 5 Things Every Tenant Must Know"
                        desc="A simplified breakdown of your rights as a tenant in metropolitan cities. Don't sign a lease without reading this."
                        gradient="from-emerald-900 to-teal-900"
                    />
                    <BlogCard
                        category="Case Study"
                        date="Jan 28, 2026"
                        title="Landmark Ruling: Digital Privacy as a Fundamental Right"
                        desc="Analyzing the impact of the latest Supreme Court verdict on data protection laws and what it means for startups."
                        gradient="from-blue-900 to-cyan-900"
                    />
                </div>
            </section>


        </div>
    );
}

function BlogCard({ category, date, title, desc, gradient }) {
    return (
        <div className="group cursor-pointer">
            <div className={`aspect-[4/3] bg-gradient-to-br ${gradient} rounded-2xl mb-6 relative overflow-hidden border border-white/5 shadow-lg group-hover:shadow- indigo-500/20 transition duration-500`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"></div>
            </div>
            <div className="flex items-center gap-3 mb-3">
                <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">{category}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{date}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition leading-tight font-serif">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">{desc}</p>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition flex items-center gap-1">
                Read More <ArrowRight size={12} className="group-hover:translate-x-1 transition" />
            </div>
        </div>
    )
}
