import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, MessageCircle, FileText, Shield, Zap, BookOpen, Users, ArrowRight, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const FAQS = [
    {
        q: "Is the legal advice provided by NyayNow AI binding?",
        a: "No. NyayNow's AI provides 'legal information' and outcome predictions based on historical data. It is a powerful research and drafting tool, but it is NOT a substitute for a licensed attorney. Always consult a qualified lawyer for important legal decisions."
    },
    {
        q: "How accurate is the Judge AI Win Predictor?",
        a: "Our Judge AI has demonstrated 94% accuracy in historical case validations across 50+ legal categories. However, every case has unique variables — the AI is a strategic advisory tool, not a guarantee of outcome."
    },
    {
        q: "Is my case data private and secure?",
        a: "Absolutely. We use AES-256 encryption for all data at rest and TLS 1.3 in transit. Your case files are anonymized before AI processing and we never train our models on your private documents. We are fully PDPA compliant."
    },
    {
        q: "Can I use NyayNow to find a real lawyer?",
        a: "Yes! Our Verified Lawyer Marketplace has 200+ advocates verified by Bar Council ID. You can filter by specialization, experience, location, and consultation fee, and book a video or in-person consultation directly."
    },
    {
        q: "What Indian laws does your AI understand?",
        a: "Our models are trained on BNS (Bhartiya Nyaya Sanhita), BNSS, BSA, the Indian Constitution, IPC, CrPC, CPC, Consumer Protection Act, IT Act, RTI Act, and major state-specific legislation. We update our knowledge base quarterly."
    },
    {
        q: "How does the FIR Generator work?",
        a: "You describe your situation in plain language through our Legal SOS wizard. Our AI classifies the emergency, identifies applicable IPC/BNS sections, and generates a correctly formatted FIR draft you can print or share with authorities."
    },
    {
        q: "Do you support regional Indian languages?",
        a: "Yes! NyayVoice supports voice input and output in Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Punjabi, Odia, and English. We're adding Assamese and Malayalam in 2026."
    },
    {
        q: "Can lawyers use NyayNow to find clients?",
        a: "Yes! The Lawyer Dashboard includes a full CRM, client management tools, AI-powered research, and a verified profile listing that helps you get discovered by clients in your practice area and city."
    }
];

const CATEGORIES = [
    { icon: <Zap size={22} />, title: "Getting Started", desc: "Account setup, first steps, and AI onboarding.", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", link: "/register" },
    { icon: <Shield size={22} />, title: "Security & Privacy", desc: "Encryption, 2FA, data handling, and compliance.", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", link: "/contact" },
    { icon: <FileText size={22} />, title: "Billing & Plans", desc: "Invoices, upgrades, cancellations, and enterprise.", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", link: "/pricing" },
    { icon: <BookOpen size={22} />, title: "AI Features", desc: "How our models work and their limitations.", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", link: "/assistant" },
    { icon: <Users size={22} />, title: "Lawyer Tools", desc: "CRM, leads, verification, and practice tools.", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", link: "/marketplace" },
    { icon: <Star size={22} />, title: "Premium Features", desc: "NyayCourt, DigiLocker, Legal SOS, and more.", color: "text-rose-400 bg-rose-500/10 border-rose-500/20", link: "/courtroom-battle" },
];

export default function HelpCenter() {
    const [query, setQuery] = useState('');
    const filtered = query.trim().length > 1
        ? FAQS.filter(f => f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()))
        : FAQS;

    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">
            <Navbar />

            {/* HERO SEARCH */}
            <section className="relative pt-32 pb-20 px-6 text-center border-b border-white/5 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto relative z-10"
                >
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4 block">Help Center</span>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight font-serif">How can we assist you?</h1>
                    <p className="text-slate-400 mb-10">Find answers to common questions or contact our support team.</p>

                    <div className="relative group max-w-2xl mx-auto">
                        <div className="absolute inset-0 bg-indigo-500/15 blur-xl rounded-2xl group-focus-within:bg-indigo-500/25 transition duration-500" />
                        <div className="relative flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl focus-within:border-indigo-500/50 transition">
                            <span className="pl-6 text-slate-400"><Search size={20} /></span>
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search our knowledge base... (e.g. 'FIR', 'privacy', 'billing')"
                                className="flex-1 bg-transparent border-none outline-none text-white p-5 text-base placeholder:text-slate-600"
                            />
                            {query && (
                                <button onClick={() => setQuery('')} className="pr-5 text-slate-500 hover:text-white transition text-sm font-bold">
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* QUICK CATEGORIES */}
            <section className="py-16 px-6 max-w-6xl mx-auto">
                <h2 className="text-xl font-bold text-white mb-8 text-center">Browse by Topic</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-20">
                    {CATEGORIES.map((c, i) => (
                        <Link key={i} to={c.link}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.04 }}
                                whileHover={{ y: -4 }}
                                className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 cursor-pointer group flex items-start gap-4"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${c.color} group-hover:scale-110 transition-transform duration-300`}>
                                    {c.icon}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold mb-1 text-sm">{c.title}</h3>
                                    <p className="text-slate-500 text-xs leading-relaxed">{c.desc}</p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                <div className="grid lg:grid-cols-5 gap-12">
                    {/* FAQ */}
                    <div className="lg:col-span-3">
                        <h2 className="text-2xl font-bold text-white mb-6 font-serif flex items-center gap-2">
                            Frequently Asked Questions
                            {query && <span className="text-sm font-normal text-slate-500">({filtered.length} results)</span>}
                        </h2>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {filtered.length > 0 ? filtered.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <FaqItem question={item.q} answer={item.a} />
                                    </motion.div>
                                )) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-slate-500">
                                        <Search size={32} className="mx-auto mb-4 opacity-30" />
                                        <p>No results for "{query}". <button onClick={() => setQuery('')} className="text-indigo-400 hover:text-indigo-300 transition">Clear search</button></p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* SUPPORT CARD */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/[0.03] rounded-3xl p-8 border border-white/8 text-center flex flex-col justify-center items-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-600/30">
                                <MessageCircle size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2 font-serif">Still need help?</h3>
                            <p className="text-slate-400 mb-8 text-sm leading-relaxed">Our support team is available Mon–Sat 9AM–7PM IST. Enterprise clients get 24/7 priority.</p>
                            <Link to="/contact" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 text-sm">
                                Contact Support <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6">
                            <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Star size={16} className="text-amber-400" /> Enterprise Support</h4>
                            <p className="text-slate-400 text-sm mb-4 leading-relaxed">SLA-backed support with a dedicated account manager for law firms and government clients.</p>
                            <Link to="/contact" className="text-amber-400 text-xs font-bold uppercase tracking-wider hover:text-amber-300 transition flex items-center gap-1">
                                Talk to Sales <ArrowRight size={12} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

function FaqItem({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <div
            onClick={() => setOpen(!open)}
            className="border border-white/8 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer overflow-hidden"
        >
            <div className="p-5 flex justify-between items-center gap-4">
                <h4 className="font-bold text-slate-200 text-sm leading-relaxed pr-4">{question}</h4>
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex-shrink-0 ${open ? 'text-indigo-400' : 'text-slate-500'}`}
                >
                    <ChevronDown size={18} />
                </motion.div>
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
