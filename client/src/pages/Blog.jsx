import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, BookOpen, TrendingUp, Scale, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ARTICLES = [
    {
        category: 'LegalTech',
        date: 'Feb 14, 2026',
        title: 'How AI is Predicting Supreme Court Judgments with 94% Accuracy',
        desc: 'An inside look at the transformer models powering our Judge AI and how predictive justice is reshaping litigation strategy for modern law firms.',
        gradient: 'from-indigo-600 to-purple-700',
        featured: true,
        readTime: '8 min read',
    },
    {
        category: 'Product Update',
        date: 'Feb 10, 2026',
        title: 'Introducing NyayVoice: Legal Assistance in 10+ Indian Languages',
        desc: 'Breaking the language barrier in Indian law. How we trained our speech-to-text models on regional dialects to democratize legal access.',
        gradient: 'from-purple-900 to-indigo-900',
        readTime: '5 min read',
    },
    {
        category: 'Know Your Rights',
        date: 'Feb 05, 2026',
        title: 'The Rent Control Act: 5 Things Every Tenant Must Know',
        desc: "A simplified breakdown of your rights as a tenant in metropolitan cities. Don't sign a lease without reading this comprehensive guide.",
        gradient: 'from-emerald-900 to-teal-900',
        readTime: '6 min read',
    },
    {
        category: 'Case Study',
        date: 'Jan 28, 2026',
        title: 'Landmark Ruling: Digital Privacy as a Fundamental Right',
        desc: 'Analyzing the impact of the latest Supreme Court verdict on data protection laws and what it means for Indian startups and users.',
        gradient: 'from-blue-900 to-cyan-900',
        readTime: '7 min read',
    },
    {
        category: 'Guide',
        date: 'Jan 20, 2026',
        title: 'The Complete Guide to Filing a Consumer Complaint in India',
        desc: 'Step-by-step walkthrough of the Consumer Protection Act 2019 and how to file a complaint through e-Daakhil for maximum results.',
        gradient: 'from-rose-900 to-pink-900',
        readTime: '10 min read',
    },
    {
        category: 'Analysis',
        date: 'Jan 15, 2026',
        title: 'BNS vs IPC: What Changed for Indian Citizens in 2025',
        desc: 'A detailed comparative analysis of the Bhartiya Nyaya Sanhita versus the Indian Penal Code and how it affects your everyday legal rights.',
        gradient: 'from-amber-900 to-orange-900',
        readTime: '12 min read',
    },
];

const TOPICS = [
    { icon: <Scale size={16} />, label: 'Case Law' },
    { icon: <BookOpen size={16} />, label: 'Know Your Rights' },
    { icon: <TrendingUp size={16} />, label: 'LegalTech' },
    { icon: <Sparkles size={16} />, label: 'Product Updates' },
];

export default function Blog() {
    const handleReadMore = () => {
        toast('Full article archive coming soon. Subscribe to get notified! 📬', { icon: '🔒' });
    };

    const handleSubscribe = (e) => {
        e.preventDefault();
        toast.success('You\'re on the list! We\'ll notify you of new articles.');
    };

    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 selection:bg-indigo-500/30">
            <Navbar />

            {/* HERO */}
            <section className="relative pt-32 pb-20 px-6 text-center border-b border-white/5 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-32 right-1/4 w-[300px] h-[300px] bg-purple-800/10 rounded-full blur-[80px] pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto relative z-10"
                >
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-6 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full"
                    >
                        <Sparkles size={14} /> NyayNow Insights
                    </motion.span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight">
                        The Future of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Legal Intelligence.</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light mb-10">
                        Deep dives into LegalTech, landmark judgment summaries, Indian law simplified, and behind-the-scenes AI model updates.
                    </p>

                    {/* TOPIC PILLS */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {TOPICS.map((t, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 + 0.3 }}
                                onClick={handleReadMore}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-bold text-slate-300 hover:bg-indigo-600/20 hover:border-indigo-500/30 hover:text-white transition-all duration-200"
                            >
                                {t.icon} {t.label}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* FEATURED POST */}
            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <div className="h-px bg-white/10 flex-1" /> Featured Article <div className="h-px bg-white/10 flex-1" />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onClick={handleReadMore}
                    className="grid lg:grid-cols-2 gap-12 items-center bg-white/[0.03] rounded-3xl p-8 md:p-12 border border-white/8 hover:border-indigo-500/30 transition-all duration-500 cursor-pointer group"
                >
                    <div className={`aspect-video bg-gradient-to-br ${ARTICLES[0].gradient} rounded-2xl overflow-hidden relative shadow-2xl group-hover:shadow-indigo-500/20 transition duration-500`}>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition" />
                        <div className="absolute inset-0 flex items-end p-6">
                            <span className="px-3 py-1 bg-indigo-500/80 text-white rounded-full text-sm font-bold backdrop-blur">{ARTICLES[0].readTime}</span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <span className="text-9xl">⚖️</span>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30 uppercase tracking-wider">{ARTICLES[0].category}</span>
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{ARTICLES[0].date}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif leading-tight group-hover:text-indigo-400 transition">
                            {ARTICLES[0].title}
                        </h2>
                        <p className="text-slate-400 text-lg mb-8 leading-relaxed font-light">{ARTICLES[0].desc}</p>
                        <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-widest group-hover:text-indigo-400 transition">
                            Read Full Article <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* RECENT ARTICLES */}
            <section className="pb-24 px-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-4">
                    <h3 className="text-2xl font-bold text-white font-serif">Recent Articles</h3>
                    <button onClick={handleReadMore} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition">
                        View All →
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {ARTICLES.slice(1).map((article, i) => (
                        <BlogCard key={i} {...article} onClick={handleReadMore} />
                    ))}
                </div>
            </section>

            {/* NEWSLETTER CTA */}
            <section className="pb-24 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-3xl p-12 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-indigo-500/10 blur-[80px] pointer-events-none" />
                    <div className="relative z-10">
                        <Bell size={32} className="text-indigo-400 mx-auto mb-6" />
                        <h3 className="text-3xl font-bold text-white font-serif mb-4">Stay Ahead of the Law</h3>
                        <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
                            Get landmark judgment summaries, new feature announcements, and legal intelligence reports delivered weekly.
                        </p>
                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                required
                                placeholder="your@email.com"
                                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 text-sm whitespace-nowrap"
                            >
                                Subscribe Free
                            </button>
                        </form>
                        <p className="text-slate-600 text-xs mt-4">No spam. Unsubscribe anytime. 3,400+ subscribers.</p>
                    </div>
                </motion.div>
            </section>

            <Footer />
        </div>
    );
}

function BlogCard({ category, date, title, desc, gradient, readTime, onClick }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={onClick}
            className="group cursor-pointer"
        >
            <div className={`aspect-[4/3] bg-gradient-to-br ${gradient} rounded-2xl mb-6 relative overflow-hidden border border-white/5 shadow-lg group-hover:shadow-indigo-500/20 transition duration-500`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition duration-300" />
                <div className="absolute bottom-4 left-4">
                    <span className="px-2.5 py-1 bg-black/50 text-white rounded-lg text-xs font-bold backdrop-blur">{readTime}</span>
                </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
                <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">{category}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{date}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition leading-tight font-serif">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">{desc}</p>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition flex items-center gap-1">
                Read More <ArrowRight size={12} className="group-hover:translate-x-1 transition" />
            </div>
        </motion.div>
    );
}
