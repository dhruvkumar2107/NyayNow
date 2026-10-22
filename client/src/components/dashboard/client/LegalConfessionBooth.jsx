import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Flame, MessageCircle, ThumbsUp, CheckCircle, ChevronDown,
    ChevronUp, Send, Loader2, ShieldOff, Sparkles, Filter,
    Eye, Clock, AlertTriangle, Lightbulb, Lock
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CATEGORIES = ["All", "Criminal", "Family", "Property", "Consumer", "Employment", "Cyber", "Tenant", "Business", "Financial", "Other"];

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

    const fetchConfessions = useCallback(async () => {
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
    }, [category, sort]);

    useEffect(() => { fetchConfessions(); }, [fetchConfessions]);

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
            <div className="mi-glass-card relative overflow-hidden rounded-[var(--radius-lg)] p-6">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-[var(--gold)]/10 blur-3xl" />
                    <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-[var(--emerald)]/10 blur-2xl" />
                </div>
                <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--gold)]/10 text-2xl">🎭</div>
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <h2 className="text-xl font-bold text-[var(--text)]">Anonymous Legal Confession Booth</h2>
                                <span className="flex items-center gap-1 rounded-full border border-[var(--gold-hairline)] bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--gold-soft)]">
                                    <Lock size={9} />Anonymous
                                </span>
                            </div>
                            <p className="text-sm text-[var(--text-muted)]">Review the privacy terms before sharing sensitive details. Replies may be AI-generated and are not necessarily reviewed by a lawyer.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="mi-tap mi-focus flex shrink-0 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-[#0B1220] shadow-lg transition hover:brightness-110"
                    >
                        <ShieldOff size={16} /> Confess Anonymously
                    </button>
                </div>

                {/* Stats row */}
                <div className="relative mt-4 flex gap-6 border-t border-[var(--gold-hairline)] pt-4">
                    {[
                        { label: "Active Issues", value: confessions.filter(c => c.status === 'open').length, icon: "🔥" },
                        { label: "AI Responses", value: confessions.reduce((a, c) => a + c.replies.filter(r => r.responderRole === 'ai').length, 0), icon: "🤖" },
                        { label: "Lawyer Replies", value: confessions.reduce((a, c) => a + c.replies.filter(r => r.responderRole === 'lawyer').length, 0), icon: "⚖️" },
                        { label: "Resolved", value: confessions.filter(c => c.status === 'resolved').length, icon: "✅" },
                    ].map(({ label, value, icon }) => (
                        <div key={label} className="text-center">
                            <p className="text-lg">{icon}</p>
                            <p className="text-base font-bold text-[var(--text)]">{value}</p>
                            <p className="text-xs text-[var(--text-muted)]">{label}</p>
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
                        <div className="mi-glass-card rounded-[var(--radius-lg)] p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gold)]/20 text-sm">🎭</div>
                                <div>
                                    <p className="text-sm font-semibold text-[var(--text)]">Posting Anonymously</p>
                                    <p className="text-xs text-[var(--text-muted)]">Your name, email, and device info are never stored or shown</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <input
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    maxLength={150}
                                    placeholder="One-line title of your issue (e.g. 'Landlord withholding my security deposit')"
                                    className="mi-focus w-full rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
                                />

                                <textarea
                                    value={form.body}
                                    onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                                    rows={5}
                                    maxLength={2000}
                                    placeholder="Describe your situation in detail. Include relevant dates, amounts, or key events. The more context you give, the better the legal information..."
                                    className="mi-focus w-full resize-none rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs text-[var(--text-muted)]">Legal Category</label>
                                        <select
                                            value={form.category}
                                            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                            className="mi-focus w-full rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none"
                                        >
                                            {CATEGORIES.filter(c => c !== 'All').map(c => (
                                                <option key={c} value={c} className="bg-[var(--surface)]">{CATEGORY_ICONS[c]} {c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs text-[var(--text-muted)]">Tags (comma separated)</label>
                                        <input
                                            value={form.tags}
                                            onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                                            placeholder="e.g. rent, deposit, Mumbai"
                                            className="mi-focus w-full rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--warn)_30%,transparent)] bg-[color-mix(in_srgb,var(--warn)_8%,transparent)] p-3">
                                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[var(--warn)]" />
                                    <p className="text-[11px] font-medium leading-relaxed text-[var(--text-muted)]">
                                        <span className="font-semibold uppercase tracking-wider text-[var(--warn)]">Legal Warning:</span> Posts in this booth are public and <span className="text-[var(--text)] underline">NOT</span> protected by attorney-client privilege. Information may be shared if required by law.
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <p className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                        <Lock size={10} /> AI analysis will appear within seconds of posting
                                    </p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowForm(false)} className="mi-focus rounded-[var(--radius-md)] px-4 py-2 text-sm text-[var(--text-muted)] transition hover:text-[var(--text)]">Cancel</button>
                                        <motion.button
                                            onClick={handlePost}
                                            disabled={posting}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="mi-focus flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--gold)] px-5 py-2 text-sm font-semibold text-[#0B1220] shadow-lg transition disabled:opacity-60"
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
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`mi-focus rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-semibold transition ${category === cat ? 'border-[var(--gold-hairline)] bg-[var(--gold)]/15 text-[var(--gold-soft)]' : 'border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 text-[var(--text-muted)] hover:text-[var(--text)]'}`}
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
                            className={`mi-focus rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-semibold transition ${sort === val ? 'border-[var(--gold-hairline)] bg-[var(--gold)]/15 text-[var(--gold-soft)]' : 'border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── CONFESSION FEED ── */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-[var(--gold)]" size={28} />
                </div>
            ) : confessions.length === 0 ? (
                <div className="py-16 text-center">
                    <p className="mb-4 text-5xl">🎭</p>
                    <p className="font-medium text-[var(--text-muted)]">No confessions yet in this category.</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Be the first to post anonymously!</p>
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
    const aiReply = c.replies?.find(r => r.responderRole === 'ai');
    const lawyerReplies = c.replies?.filter(r => r.responderRole !== 'ai') || [];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mi-glass-card overflow-hidden rounded-[var(--radius-lg)] transition-all duration-300 ${isExpanded ? 'border-[var(--gold)]/40' : 'hover:border-[var(--gold)]/30'}`}
        >
            {/* Card Header */}
            <div
                className="cursor-pointer p-5"
                onClick={() => setExpandedId(isExpanded ? null : c._id)}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        {/* Badges */}
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-md border border-[var(--gold-hairline)] bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--gold-soft)]">
                                {CATEGORY_ICONS[c.category]} {c.category}
                            </span>
                            {c.status === 'resolved' && (
                                <span className="flex items-center gap-1 rounded-md border border-[color-mix(in_srgb,var(--emerald)_35%,transparent)] bg-[color-mix(in_srgb,var(--emerald)_12%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--emerald)]">
                                    <CheckCircle size={9} /> Resolved
                                </span>
                            )}
                            {c.tags?.map(tag => (
                                <span key={tag} className="rounded border border-[var(--gold-hairline)] bg-[var(--surface-2)]/40 px-2 py-0.5 text-[9px] text-[var(--text-muted)]">#{tag}</span>
                            ))}
                        </div>

                        <h3 className="mb-2 text-sm font-bold leading-snug text-[var(--text)]">{c.title}</h3>
                        <p className="line-clamp-2 text-xs leading-relaxed text-[var(--text-muted)]">{c.body}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-center gap-1 pt-1">
                        <button
                            onClick={e => { e.stopPropagation(); handleUpvote(c._id); }}
                            className={`mi-focus flex items-center gap-1 rounded-[var(--radius-sm)] border px-2.5 py-1.5 text-xs font-semibold transition ${c._upvoted ? 'border-[var(--gold)]/40 bg-[var(--gold)]/20 text-[var(--gold-soft)]' : 'border-[var(--gold-hairline)] bg-[var(--surface-2)]/40 text-[var(--text-muted)] hover:text-[var(--gold)]'}`}
                        >
                            <ThumbsUp size={11} /> {c.upvotes?.length || 0}
                        </button>
                        {isExpanded ? <ChevronUp size={16} className="mt-1 text-[var(--text-muted)]" /> : <ChevronDown size={16} className="mt-1 text-[var(--text-muted)]" />}
                    </div>
                </div>

                {/* Footer meta */}
                <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1"><Clock size={10} />{TIME_AGO(c.createdAt)}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={10} />{c.replies?.length || 0} replies</span>
                    <span className="flex items-center gap-1 text-[var(--gold)]"><Lock size={10} />Anonymous</span>
                    {aiReply && <span className="flex items-center gap-1 text-[var(--gold-soft)]"><Sparkles size={10} />AI Analyzed</span>}
                    <button
                        onClick={(e) => { e.stopPropagation(); toast.success("Confession reported for review."); }}
                        className="ml-auto flex items-center gap-1 transition hover:text-[var(--sos)]"
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
                        <div className="space-y-4 border-t border-[var(--gold-hairline)] px-5 pb-5 pt-4">

                            {/* Full body */}
                            <div className="text-sm leading-relaxed text-[var(--text)]">{c.body}</div>

                            {/* AI Analysis Block */}
                            {aiReply ? (
                                <div className="rounded-[var(--radius-lg)] border border-[var(--gold-hairline)] bg-[var(--gold)]/5 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--gold-hairline)] bg-[var(--gold)]/20 text-xs">🤖</div>
                                        <div>
                                            <p className="text-xs font-bold text-[var(--gold-soft)]">NyayNow AI — Preliminary Analysis</p>
                                            <p className="text-[10px] text-[var(--text-muted)]">Automated response • Not a substitute for legal counsel</p>
                                        </div>
                                        <Sparkles size={14} className="ml-auto text-[var(--gold)]" />
                                    </div>
                                    <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-[var(--text)]">
                                        {aiReply.text}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-4">
                                    <Loader2 className="shrink-0 animate-spin text-[var(--gold)]" size={16} />
                                    <p className="text-xs text-[var(--gold-soft)]">AI analysis is being generated...</p>
                                </div>
                            )}

                            {/* Lawyer / Community Replies */}
                            {lawyerReplies.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Community Responses ({lawyerReplies.length})</p>
                                    {lawyerReplies.map(reply => (
                                        <div key={reply._id} className="rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${reply.responderRole === 'lawyer' ? 'border border-[color-mix(in_srgb,var(--warn)_30%,transparent)] bg-[color-mix(in_srgb,var(--warn)_15%,transparent)] text-[var(--warn)]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
                                                        {reply.responderRole === 'lawyer' ? '⚖' : '👤'}
                                                    </div>
                                                    <span className={`text-xs font-bold ${reply.responderRole === 'lawyer' ? 'text-[var(--warn)]' : 'text-[var(--text-muted)]'}`}>
                                                        {reply.responderName || (reply.responderRole === 'lawyer' ? 'Legal Expert' : 'Community Member')}
                                                    </span>
                                                    <span className="text-[10px] text-[var(--text-muted)]">{TIME_AGO(reply.createdAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleHelpful(c._id, reply._id)}
                                                        className="mi-focus flex items-center gap-1 rounded-[var(--radius-sm)] border border-transparent px-2 py-1 text-[10px] text-[var(--text-muted)] transition hover:border-[color-mix(in_srgb,var(--emerald)_20%,transparent)] hover:bg-[color-mix(in_srgb,var(--emerald)_10%,transparent)] hover:text-[var(--emerald)]"
                                                    >
                                                        <ThumbsUp size={10} /> {reply.helpful?.length || 0} Helpful
                                                    </button>
                                                    <button
                                                        onClick={() => toast.success("Content reported. Our team will review it within 24 hours.")}
                                                        className="mi-focus flex items-center gap-1 rounded-[var(--radius-sm)] border border-transparent px-2 py-1 text-[10px] text-[var(--text-muted)] transition hover:border-[color-mix(in_srgb,var(--sos)_20%,transparent)] hover:bg-[color-mix(in_srgb,var(--sos)_10%,transparent)] hover:text-[var(--sos)]"
                                                        title="Report inappropriate content"
                                                    >
                                                        <AlertTriangle size={10} /> Report
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs leading-relaxed text-[var(--text)]">{reply.text}</p>
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
                                    className="mi-focus flex-1 rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--bg)] px-4 py-2.5 text-xs text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
                                />
                                <button
                                    onClick={() => handleReply(c._id)}
                                    disabled={replyLoading[c._id]}
                                    className="mi-focus rounded-[var(--radius-md)] bg-[var(--gold)] px-4 py-2.5 text-[#0B1220] transition hover:brightness-110 disabled:opacity-50"
                                >
                                    {replyLoading[c._id] ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                                </button>
                            </div>

                            {/* Resolve button */}
                            {c.status !== 'resolved' && (
                                <button
                                    onClick={() => handleResolve(c._id)}
                                    className="mi-focus flex items-center gap-2 rounded-[var(--radius-sm)] border border-transparent px-3 py-1.5 text-xs font-medium text-[var(--emerald)] transition hover:border-[color-mix(in_srgb,var(--emerald)_20%,transparent)] hover:bg-[color-mix(in_srgb,var(--emerald)_10%,transparent)]"
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
