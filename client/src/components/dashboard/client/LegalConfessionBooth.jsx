import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Flame, MessageCircle, ThumbsUp, CheckCircle, ChevronDown,
    ChevronUp, Send, Loader2, ShieldOff, Sparkles, Filter,
    Eye, Clock, AlertTriangle, Lightbulb, Lock
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CATEGORIES = ["All", "Criminal", "Family", "Property", "Consumer", "Employment", "Cyber", "Tenant", "Business", "Financial", "Other"];

const CATEGORY_COLORS = {
    Criminal: "rose", Family: "pink", Property: "amber", Consumer: "blue",
    Employment: "orange", Cyber: "violet", Tenant: "teal", Business: "indigo",
    Financial: "emerald", Other: "slate", All: "slate"
};

const CATEGORY_ICONS = {
    Criminal: "⚖️", Family: "👨‍👩‍👧", Property: "🏠", Consumer: "🛒",
    Employment: "💼", Cyber: "💻", Tenant: "🔑", Business: "🏢",
    Financial: "💰", Other: "❓"
};

const TIME_AGO = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

export default function LegalConfessionBooth() {
    const [confessions, setConfessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("new");
    const [expandedId, setExpandedId] = useState(null);
    const [replyText, setReplyText] = useState({});
    const [replyLoading, setReplyLoading] = useState({});

    // New confession form
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', body: '', category: 'Other', tags: '' });

    const fetchConfessions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (category !== "All") params.set("category", category);
            params.set("sort", sort);
            const { data } = await axios.get(`/api/confessions?${params}`);
            setConfessions(data);
        } catch (err) {
            toast.error("Couldn't load confessions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchConfessions(); }, [category, sort]);

    const handlePost = async () => {
        if (!form.title.trim() || !form.body.trim()) {
            return toast.error("Please fill in title and details.");
        }
        setPosting(true);
        try {
            await axios.post('/api/confessions', {
                ...form,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
            });
            toast.success("Posted anonymously! AI analysis incoming...");
            setForm({ title: '', body: '', category: 'Other', tags: '' });
            setShowForm(false);
            fetchConfessions();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to post.");
        } finally {
            setPosting(false);
        }
    };

    const handleReply = async (confessionId) => {
        const text = replyText[confessionId]?.trim();
        if (!text) return;
        setReplyLoading(p => ({ ...p, [confessionId]: true }));
        try {
            await axios.post(`/api/confessions/${confessionId}/reply`, { text });
            toast.success("Reply posted!");
            setReplyText(p => ({ ...p, [confessionId]: '' }));
            fetchConfessions();
        } catch (err) {
            toast.error("Failed to reply.");
        } finally {
            setReplyLoading(p => ({ ...p, [confessionId]: false }));
        }
    };

    const handleUpvote = async (id) => {
        try {
            const { data } = await axios.post(`/api/confessions/${id}/upvote`);
            setConfessions(p => p.map(c => c._id === id ? { ...c, upvotes: Array(data.upvotes).fill(null), _upvoted: data.upvoted } : c));
        } catch { toast.error("Login required to upvote."); }
    };

    const handleHelpful = async (confId, replyId) => {
        try {
            await axios.post(`/api/confessions/${confId}/reply/${replyId}/helpful`);
            fetchConfessions();
        } catch { toast.error("Login required."); }
    };

    const handleResolve = async (id) => {
        try {
            await axios.patch(`/api/confessions/${id}/resolve`);
            toast.success("Marked as resolved!");
            fetchConfessions();
        } catch { toast.error("Failed to resolve."); }
    };

    return (
        <div className="space-y-5">

            {/* ── HERO HEADER ── */}
            <div className="bg-[#0f172a] rounded-3xl p-6 border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-600/8 rounded-full blur-2xl" />
                </div>
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl">🎭</div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl font-bold text-white">Anonymous Legal Confession Booth</h2>
                                <span className="text-[10px] px-2 py-0.5 bg-violet-500/20 border border-violet-500/30 text-violet-300 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Lock size={9} />Anonymous
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm">Your identity is never revealed. AI + verified lawyers respond.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition shrink-0"
                    >
                        <ShieldOff size={16} /> Confess Anonymously
                    </button>
                </div>

                {/* Stats row */}
                <div className="relative flex gap-6 mt-4 pt-4 border-t border-white/5">
                    {[
                        { label: "Active Issues", value: confessions.filter(c => c.status === 'open').length, icon: "🔥" },
                        { label: "AI Responses", value: confessions.reduce((a, c) => a + c.replies.filter(r => r.responderRole === 'ai').length, 0), icon: "🤖" },
                        { label: "Lawyer Replies", value: confessions.reduce((a, c) => a + c.replies.filter(r => r.responderRole === 'lawyer').length, 0), icon: "⚖️" },
                        { label: "Resolved", value: confessions.filter(c => c.status === 'resolved').length, icon: "✅" },
                    ].map(({ label, value, icon }) => (
                        <div key={label} className="text-center">
                            <p className="text-lg">{icon}</p>
                            <p className="text-white font-bold text-base">{value}</p>
                            <p className="text-slate-600 text-xs">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── NEW CONFESSION FORM ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-[#0f172a] rounded-2xl p-6 border border-violet-500/20 shadow-lg shadow-violet-500/5">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-sm">🎭</div>
                                <div>
                                    <p className="text-white font-bold text-sm">Posting Anonymously</p>
                                    <p className="text-slate-600 text-xs">Your name, email, and device info are never stored or shown</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <input
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    maxLength={150}
                                    placeholder="One-line title of your issue (e.g. 'Landlord withholding my security deposit')"
                                    className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60 transition"
                                />

                                <textarea
                                    value={form.body}
                                    onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                                    rows={5}
                                    maxLength={2000}
                                    placeholder="Describe your situation in detail. Include relevant dates, amounts, or key events. The more context you give, the better the legal information..."
                                    className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60 transition resize-none"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1.5">Legal Category</label>
                                        <select
                                            value={form.category}
                                            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                            className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/60 transition"
                                        >
                                            {CATEGORIES.filter(c => c !== 'All').map(c => (
                                                <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1.5">Tags (comma separated)</label>
                                        <input
                                            value={form.tags}
                                            onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                                            placeholder="e.g. rent, deposit, Mumbai"
                                            className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60 transition"
                                        />
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                                    <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                        <span className="text-amber-500 font-bold uppercase tracking-wider">Legal Warning:</span> Posts in this booth are public and <span className="text-white underline">NOT</span> protected by attorney-client privilege. Information may be shared if required by law.
                                    </p>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <p className="text-slate-600 text-xs flex items-center gap-1.5">
                                        <Lock size={10} /> AI analysis will appear within seconds of posting
                                    </p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm transition">Cancel</button>
                                        <motion.button
                                            onClick={handlePost}
                                            disabled={posting}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg transition disabled:opacity-60"
                                        >
                                            {posting ? <><Loader2 size={14} className="animate-spin" /> Posting...</> : <><ShieldOff size={14} /> Post Anonymously</>}
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── FILTER BAR ── */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${category === cat ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/3 border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/20'}`}
                        >
                            {cat !== 'All' && CATEGORY_ICONS[cat]} {cat}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    {[["new", "🕒 Latest"], ["top", "🔥 Top"]].map(([val, label]) => (
                        <button
                            key={val}
                            onClick={() => setSort(val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${sort === val ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-slate-500 hover:text-slate-300'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── CONFESSION FEED ── */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-violet-400" size={28} />
                </div>
            ) : confessions.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-5xl mb-4">🎭</p>
                    <p className="text-slate-400 font-medium">No confessions yet in this category.</p>
                    <p className="text-slate-600 text-sm mt-1">Be the first to post anonymously!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {confessions.map((c) => (
                        <ConfessionCard
                            key={c._id}
                            c={c}
                            expandedId={expandedId}
                            setExpandedId={setExpandedId}
                            replyText={replyText}
                            setReplyText={setReplyText}
                            replyLoading={replyLoading}
                            handleReply={handleReply}
                            handleUpvote={handleUpvote}
                            handleHelpful={handleHelpful}
                            handleResolve={handleResolve}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ConfessionCard({ c, expandedId, setExpandedId, replyText, setReplyText, replyLoading, handleReply, handleUpvote, handleHelpful, handleResolve }) {
    const isExpanded = expandedId === c._id;
    const catColor = CATEGORY_COLORS[c.category] || 'slate';
    const aiReply = c.replies?.find(r => r.responderRole === 'ai');
    const lawyerReplies = c.replies?.filter(r => r.responderRole !== 'ai') || [];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#0f172a] rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-violet-500/30 shadow-lg shadow-violet-500/5' : 'border-white/8 hover:border-white/15'}`}
        >
            {/* Card Header */}
            <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : c._id)}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-${catColor}-500/15 text-${catColor}-400 border border-${catColor}-500/20`}>
                                {CATEGORY_ICONS[c.category]} {c.category}
                            </span>
                            {c.status === 'resolved' && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                    <CheckCircle size={9} /> Resolved
                                </span>
                            )}
                            {c.tags?.map(tag => (
                                <span key={tag} className="text-[9px] px-2 py-0.5 bg-white/5 text-slate-500 rounded border border-white/5">#{tag}</span>
                            ))}
                        </div>

                        <h3 className="text-white font-bold text-sm leading-snug mb-2">{c.title}</h3>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{c.body}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
                        <button
                            onClick={e => { e.stopPropagation(); handleUpvote(c._id); }}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${c._upvoted ? 'bg-violet-500/20 border-violet-500/40 text-violet-400' : 'bg-white/5 border-white/10 text-slate-500 hover:text-violet-400'}`}
                        >
                            <ThumbsUp size={11} /> {c.upvotes?.length || 0}
                        </button>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-600 mt-1" /> : <ChevronDown size={16} className="text-slate-600 mt-1" />}
                    </div>
                </div>

                {/* Footer meta */}
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1"><Clock size={10} />{TIME_AGO(c.createdAt)}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={10} />{c.replies?.length || 0} replies</span>
                    <span className="flex items-center gap-1 text-violet-500"><Lock size={10} />Anonymous</span>
                    {aiReply && <span className="flex items-center gap-1 text-indigo-400"><Sparkles size={10} />AI Analyzed</span>}
                    <button
                        onClick={(e) => { e.stopPropagation(); toast.success("Confession reported for review."); }}
                        className="flex items-center gap-1 hover:text-rose-500 transition ml-auto"
                        title="Report this confession"
                    >
                        <AlertTriangle size={10} /> Report
                    </button>
                </div>
            </div>

            {/* ── EXPANDED VIEW ── */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">

                            {/* Full body */}
                            <div className="text-slate-300 text-sm leading-relaxed">{c.body}</div>

                            {/* AI Analysis Block */}
                            {aiReply ? (
                                <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs">🤖</div>
                                        <div>
                                            <p className="text-indigo-300 font-bold text-xs">NyayNow AI — Preliminary Analysis</p>
                                            <p className="text-indigo-600 text-[10px]">Automated response • Not a substitute for legal counsel</p>
                                        </div>
                                        <Sparkles size={14} className="text-indigo-400 ml-auto" />
                                    </div>
                                    <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                                        {aiReply.text}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-indigo-950/30 border border-indigo-500/10 rounded-2xl p-4 flex items-center gap-3">
                                    <Loader2 className="animate-spin text-indigo-400 shrink-0" size={16} />
                                    <p className="text-indigo-400 text-xs">AI analysis is being generated...</p>
                                </div>
                            )}

                            {/* Lawyer / Community Replies */}
                            {lawyerReplies.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Community Responses ({lawyerReplies.length})</p>
                                    {lawyerReplies.map(reply => (
                                        <div key={reply._id} className="bg-white/3 border border-white/8 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${reply.responderRole === 'lawyer' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-700 text-slate-400'}`}>
                                                        {reply.responderRole === 'lawyer' ? '⚖' : '👤'}
                                                    </div>
                                                    <span className={`text-xs font-bold ${reply.responderRole === 'lawyer' ? 'text-amber-400' : 'text-slate-400'}`}>
                                                        {reply.responderName || (reply.responderRole === 'lawyer' ? 'Legal Expert' : 'Community Member')}
                                                    </span>
                                                    <span className="text-slate-700 text-[10px]">{TIME_AGO(reply.createdAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleHelpful(c._id, reply._id)}
                                                        className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-emerald-400 transition px-2 py-1 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20"
                                                    >
                                                        <ThumbsUp size={10} /> {reply.helpful?.length || 0} Helpful
                                                    </button>
                                                    <button
                                                        onClick={() => toast.success("Content reported. Our team will review it within 24 hours.")}
                                                        className="flex items-center gap-1 text-[10px] text-slate-700 hover:text-rose-500 transition px-2 py-1 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
                                                        title="Report inappropriate content"
                                                    >
                                                        <AlertTriangle size={10} /> Report
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-slate-300 text-xs leading-relaxed">{reply.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply Input */}
                            <div className="flex gap-2">
                                <input
                                    value={replyText[c._id] || ''}
                                    onChange={e => setReplyText(p => ({ ...p, [c._id]: e.target.value }))}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply(c._id)}
                                    placeholder="Share advice or ask a follow-up..."
                                    className="flex-1 bg-[#020617] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/40 transition"
                                />
                                <button
                                    onClick={() => handleReply(c._id)}
                                    disabled={replyLoading[c._id]}
                                    className="px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-500 transition disabled:opacity-50"
                                >
                                    {replyLoading[c._id] ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                                </button>
                            </div>

                            {/* Resolve button */}
                            {c.status !== 'resolved' && (
                                <button
                                    onClick={() => handleResolve(c._id)}
                                    className="flex items-center gap-2 text-xs text-emerald-500 hover:text-emerald-400 transition font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20"
                                >
                                    <CheckCircle size={13} /> Mark as Resolved
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
