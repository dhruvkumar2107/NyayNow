import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, MessageCircle, FileText, Shield, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';


export default function HelpCenter() {
    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">
            <Navbar />

            {/* HERO SEARCH */}
            <section className="relative pt-32 pb-20 px-6 text-center border-b border-white/5 bg-[#0f172a]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto"
                >
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4 block">Support Center</span>
                    <h1 className="text-5xl font-bold text-white mb-8 leading-tight">How can we assist you?</h1>

                    <div className="relative group max-w-2xl mx-auto">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-2xl group-hover:bg-indigo-500/30 transition duration-500"></div>
                        <div className="relative flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <span className="pl-6 text-slate-400"><Search size={20} /></span>
                            <input
                                type="text"
                                placeholder="Search our knowledge base..."
                                className="flex-1 bg-transparent border-none outline-none text-white p-5 text-lg placeholder:text-slate-500"
                            />
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* QUICK CATEGORIES */}
            <section className="py-20 px-6 max-w-6xl mx-auto">
                <div className="grid md:grid-cols-3 gap-6 mb-20">
                    <CategoryCard icon={<Zap size={24} />} title="Getting Started" desc="Account setup, API keys, and first steps." />
                    <CategoryCard icon={<Shield size={24} />} title="Security & Privacy" desc="Data encryption, 2FA, and compliance." />
                    <CategoryCard icon={<FileText size={24} />} title="Billing & Plans" desc="Invoices, upgrades, and enterprise pricing." />
                </div>

                <div className="grid lg:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            <FaqItem
                                question="Is the legal advice provided by AI binding?"
                                answer="No. NyayNow's AI provides 'legal information' and 'predictions' based on data. It is a powerful tool to assist research and drafting, but it is NOT a substitute for a licensed attorney."
                            />
                            <FaqItem
                                question="How accurate is the Judge AI Predictor?"
                                answer="Our Judge AI has shown a 94% accuracy rate in historical case validations. However, future cases have variables that no model can fully predict."
                            />
                            <FaqItem
                                question="Is my case data private and secure?"
                                answer="Absolutely. We use enterprise-grade AES-256 encryption. Your case files are anonymized before being processed by our AI models."
                            />
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-8 border border-white/10 text-center flex flex-col justify-center items-center backdrop-blur-md">
                        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-600/30">
                            <MessageCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Still need help?</h3>
                        <p className="text-slate-400 mb-8 max-w-xs">Our concierge support team is available 24/7 for Enterprise clients.</p>
                        <a href="/contact" className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition">Contact Support</a>
                    </div>
                </div>
            </section>


        </div>
    );
}

function CategoryCard({ icon, title, desc }) {
    return (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition cursor-pointer group">
            <div className="w-12 h-12 bg-black/30 rounded-xl flex items-center justify-center text-indigo-400 mb-6 group-hover:text-white transition">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{desc}</p>
        </div>
    )
}

function FaqItem({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <div onClick={() => setOpen(!open)} className="border border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition cursor-pointer overflow-hidden">
            <div className="p-5 flex justify-between items-center">
                <h4 className="font-bold text-slate-200 text-sm md:text-base pr-8">{question}</h4>
                <div className={`text-slate-500 transition-transform duration-300 ${open ? 'rotate-90 text-indigo-400' : ''}`}>
                    <ChevronRight size={16} />
                </div>
            </div>
            {open && (
                <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                    {answer}
                </div>
            )}
        </div>
    )
}
