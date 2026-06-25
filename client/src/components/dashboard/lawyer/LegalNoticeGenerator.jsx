import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Download, Eye, EyeOff, ChevronDown, AlertCircle, CheckCircle, Loader2, RotateCcw, Pen } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import jsPDF from 'jspdf';

const NOTICE_TYPES = [
    { value: 'Anticipatory Bail Application (BNSS Sec 482)', label: '⚖️ Anticipatory Bail Application — BNSS 482', color: 'indigo' },
    { value: 'Regular Bail Application (BNSS Sec 480)', label: '⚖️ Regular Bail Application — BNSS 480', color: 'blue' },
    { value: 'Writ Petition (Article 226/32)', label: '📜 Writ Petition (High/Supreme Court)', color: 'purple' },
    { value: 'Criminal Complaint to Magistrate (BNSS Sec 175)', label: '🚨 Criminal Complaint — Magistrate', color: 'red' },
    { value: 'Divorce Petition (Mutual Consent)', label: '💔 Mutual Consent Divorce Petition', color: 'rose' },
    { value: 'Demand Notice (Money Recovery)', label: '💰 Demand Notice — Money Recovery', color: 'emerald' },
    { value: 'Cheque Bounce Notice (Section 138 NI Act)', label: '🏦 Cheque Bounce — Section 138 NI Act', color: 'amber' },
    { value: 'Eviction Notice (Tenant Removal)', label: '🏠 Eviction Notice — Tenant Removal', color: 'cyan' },
    { value: 'Defamation Notice (Online/Offline)', label: '📣 Defamation Notice', color: 'orange' },
    { value: 'Consumer Complaint Notice (Consumer Protection Act)', label: '🛒 Consumer Complaint Notice', color: 'teal' },
];

const FIELD_CLASS = "w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition duration-200";

export default function LegalNoticeGenerator() {
    const { user } = useAuth();

    const [form, setForm] = useState({
        noticeType: '',
        senderName: user?.name || '',
        senderAddress: '',
        senderBarCouncil: '',
        recipientName: '',
        recipientAddress: '',
        facts: '',
        amount: '',
        complianceDays: '15',
        additionalClauses: '',
    });

    const [generatedNotice, setGeneratedNotice] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [step, setStep] = useState(1); // 1 = form, 2 = preview

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleGenerate = async () => {
        if (!form.noticeType || !form.senderName || !form.recipientName || !form.facts) {
            toast.error('Please fill in Notice Type, Sender Name, Recipient Name, and Facts.');
            return;
        }
        setLoading(true);
        setGeneratedNotice('');
        try {
            const { data } = await axios.post('/api/ai/legal-notice', form);
            setGeneratedNotice(data.notice);
            setStep(2);
            toast.success('Legal Notice generated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to generate notice. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const usableWidth = pageWidth - margin * 2;
        const pageHeight = doc.internal.pageSize.getHeight();

        // — Header decorative bar —
        doc.setFillColor(55, 48, 163); // indigo-800
        doc.rect(0, 0, pageWidth, 14, 'F');

        // — NyayNow branding in header —
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text('NYAYNOW LEGAL SERVICES', margin, 9);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('nyaynow.in | AI-Powered Legal Platform', pageWidth - margin, 9, { align: 'right' });

        // — Title —
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(30, 30, 30);
        doc.text('LEGAL NOTICE', pageWidth / 2, 30, { align: 'center' });

        // — Divider under title —
        doc.setDrawColor(99, 102, 241);
        doc.setLineWidth(0.5);
        doc.line(margin, 33, pageWidth - margin, 33);

        // — Body text —
        doc.setFont('times', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(40, 40, 40);

        const clean = generatedNotice.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s/g, '');
        const lines = doc.splitTextToSize(clean, usableWidth);
        let y = 40;

        lines.forEach(line => {
            if (y > pageHeight - 40) {
                doc.addPage();
                // Repeat header on new page
                doc.setFillColor(55, 48, 163);
                doc.rect(0, 0, pageWidth, 14, 'F');
                y = 20;
            }
            doc.text(line, margin, y);
            y += 5.5;
        });

        // — Signature slot box —
        const sigY = Math.min(y + 15, pageHeight - 70);
        doc.setFillColor(248, 248, 252);
        doc.setDrawColor(200, 200, 220);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, sigY, usableWidth / 2 - 5, 45, 3, 3, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 120);
        doc.text('ADVOCATE SIGNATURE', margin + 5, sigY + 8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 150);
        doc.text('(Sign with official seal)', margin + 5, sigY + 14);
        // Signature line
        doc.setDrawColor(160, 160, 180);
        doc.setLineWidth(0.4);
        doc.line(margin + 5, sigY + 32, margin + usableWidth / 2 - 15, sigY + 32);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 120);
        doc.text(form.senderName, margin + 5, sigY + 38);
        if (form.senderBarCouncil) {
            doc.text(`Enrol. No: ${form.senderBarCouncil}`, margin + 5, sigY + 43);
        }

        // — Date block (right side) —
        doc.setFillColor(248, 248, 252);
        doc.roundedRect(pageWidth / 2 + 5, sigY, usableWidth / 2 - 5, 45, 3, 3, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 120);
        doc.text('DATE OF NOTICE', pageWidth / 2 + 10, sigY + 8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 80);
        const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        doc.text(today, pageWidth / 2 + 10, sigY + 22);
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 150);
        doc.text(`Notice Type: ${form.noticeType.split('(')[0].trim()}`, pageWidth / 2 + 10, sigY + 30);
        doc.text(`Compliance: ${form.complianceDays} days`, pageWidth / 2 + 10, sigY + 36);

        // — Watermark —
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(60);
        doc.setTextColor(240, 240, 245);
        doc.text('NYAYNOW', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });

        // — Footer —
        const footerY = pageHeight - 10;
        doc.setFillColor(55, 48, 163);
        doc.rect(0, footerY - 6, pageWidth, 16, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 220);
        doc.text(
            `This notice was generated via NyayNow AI Legal Platform. Confidential & Privileged Communication. | nyaynow.in`,
            pageWidth / 2, footerY, { align: 'center' }
        );

        doc.save(`Legal_Notice_${form.recipientName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
        toast.success('PDF downloaded!');
    };

    const selectedType = NOTICE_TYPES.find(t => t.value === form.noticeType);

    return (
        <div className="space-y-8 relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header Section */}
            <div className="bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0f172a] rounded-[2.5rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <Sparkles className="text-indigo-400" size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-bold text-white tracking-tight font-serif">Aethelgard AI Drafter</h2>
                                <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]">Quantum Drafting</span>
                            </div>
                            <p className="text-slate-500 text-sm max-w-xl leading-relaxed">Synthesize court-ready legal notices, bail applications, and petitions with high-precision AI. Automatically optimized for Indian Judicial Standards (BNS/BNSS).</p>
                        </div>
                    </div>

                    {step === 2 && (
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => { setStep(1); setGeneratedNotice(''); }}
                            className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg shadow-black/20"
                        >
                            <RotateCcw size={16} /> Reset Engine
                        </motion.button>
                    )}
                </div>

                {/* Animated Step Indicator */}
                <div className="flex items-center gap-4 mt-12">
                    {[{ n: 1, label: 'Parameter Input' }, { n: 2, label: 'Neural Synthesis' }].map(({ n, label }) => (
                        <React.Fragment key={n}>
                            <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-500 ${step >= n ? 'bg-indigo-600/10 text-indigo-300 border border-indigo-500/30 shadow-lg' : 'bg-white/5 text-slate-600 border border-transparent'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${step > n ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : step === n ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-white/10 text-slate-600'}`}>
                                    {step > n ? '✓' : n}
                                </div>
                                <span className="uppercase tracking-[0.1em]">{label}</span>
                            </div>
                            {n < 2 && <div className={`flex-1 h-0.5 max-w-[100px] rounded-full overflow-hidden bg-white/5`}>
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: step > n ? '0%' : '-100%' }}
                                    transition={{ duration: 0.8 }}
                                    className="w-full h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"
                                />
                            </div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div key="form" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">

                        {/* Bento Grid Form */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Panel: Metadata */}
                            <div className="bg-[#0f172a]/50 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl hover:border-indigo-500/20 transition-colors duration-500">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Select Legal Instrument / Application</label>
                                <div className="grid grid-cols-1 gap-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-2">
                                    {NOTICE_TYPES.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => setForm(p => ({ ...p, noticeType: type.value }))}
                                            className={`text-left px-5 py-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${form.noticeType === type.value ? 'bg-indigo-600/10 border-indigo-500/50 text-white shadow-lg' : 'bg-white/3 border-white/5 text-slate-400 hover:bg-white/5 hover:border-white/10 hover:text-slate-200'}`}
                                        >
                                            <div className="relative z-10 flex justify-between items-center">
                                                <span className="text-sm font-bold tracking-tight">{type.label}</span>
                                                {form.noticeType === type.value && <CheckCircle size={16} className="text-indigo-400" />}
                                            </div>
                                            {form.noticeType === type.value && <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Panel: Parties */}
                                <div className="bg-[#0f172a]/50 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl">
                                    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Pen size={14} className="text-emerald-400" /></div>
                                        Protagonist & Antagonist
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] mb-2 font-mono">Advocate Identity</label>
                                                <input name="senderName" value={form.senderName} onChange={handleChange} placeholder="Adv. Rajesh Kumar" className={FIELD_CLASS} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] mb-2 font-mono">Enrolment ID</label>
                                                <input name="senderBarCouncil" value={form.senderBarCouncil} onChange={handleChange} placeholder="MH/1234/2020" className={FIELD_CLASS} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] mb-2 font-mono">Noticee / Respondent / State</label>
                                            <input name="recipientName" value={form.recipientName} onChange={handleChange} placeholder="Opposite Party or State Authority" className={FIELD_CLASS} />
                                        </div>
                                    </div>
                                </div>

                                {/* Panel: Timeline */}
                                <div className="bg-[#0f172a]/50 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl">
                                    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center"><AlertCircle size={14} className="text-indigo-400" /></div>
                                        Deadline Matrix
                                    </h3>
                                    <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
                                        {['7', '15', '30'].map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setForm(p => ({ ...p, complianceDays: d }))}
                                                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${form.complianceDays === d ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                                            >
                                                {d} DAYS
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Facts Panel */}
                        <div className="bg-[#0f172a]/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden">
                            <h3 className="text-sm font-bold text-white mb-8 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center"><FileText size={18} className="text-amber-400" /></div>
                                Evidence Repository & Facts
                            </h3>
                            <div className="space-y-8">
                                <textarea
                                    name="facts"
                                    value={form.facts}
                                    onChange={handleChange}
                                    rows={6}
                                    placeholder="Input core grievance details here. Specify dates, monetary values, and contractual breaches..."
                                    className={`${FIELD_CLASS} bg-black/40 rounded-[1.5rem] p-8 border-white/10 text-lg leading-relaxed placeholder:text-slate-700 resize-none font-medium h-[240px] shadow-inner`}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Principal Amount (₹)</label>
                                        <input name="amount" value={form.amount} onChange={handleChange} placeholder="0.00" type="number" className={`${FIELD_CLASS} text-2xl font-bold bg-transparent border-none p-0 focus:ring-0`} />
                                    </div>
                                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Special Stipulations</label>
                                        <input name="additionalClauses" value={form.additionalClauses} onChange={handleChange} placeholder="e.g. Demand for Interest @ 18% p.a." className={`${FIELD_CLASS} bg-transparent border-none p-0 focus:ring-0`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Hub */}
                        <div className="flex justify-center pt-8">
                            <motion.button
                                onClick={handleGenerate}
                                disabled={loading}
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative group w-full max-w-lg"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-60 transition duration-500"></div>
                                <div className="relative py-6 rounded-[2rem] bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-black text-lg flex items-center justify-center gap-4 shadow-2xl border-t border-white/20">
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={24} />
                                            NEURAL SYNTHESIS IN PROGRESS...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={24} className="animate-pulse" />
                                            GENERATE LEGAL INSTRUMENT
                                        </>
                                    )}
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>

                ) : (
                    <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-8">

                        {/* Pro Control Bar */}
                        <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                                    <CheckCircle className="text-emerald-400" size={28} />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-black uppercase tracking-wider text-sm">Synthesis Complete</p>
                                    <p className="text-slate-500 text-xs font-medium">{form.noticeType.split('(')[0].trim()} • Secure Link Established</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                                >
                                    {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                                    {showPreview ? 'Hide Feed' : 'Holographic Preview'}
                                </button>
                                <motion.button
                                    onClick={handleDownloadPDF}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs rounded-2xl shadow-xl shadow-emerald-600/20 transition uppercase tracking-widest"
                                >
                                    <Download size={16} /> Export Dossier
                                </motion.button>
                            </div>
                        </div>

                        {/* Holo Preview */}
                        <AnimatePresence>
                            {showPreview && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="relative"
                                >
                                    <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] pointer-events-none" />
                                    <div className="bg-white rounded-[3px] border border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 font-black text-8xl pointer-events-none text-black select-none uppercase">CONFIDENTIAL</div>

                                        {/* Physical Doc Header */}
                                        <div className="bg-[#1e1b4b] px-10 py-4 flex justify-between items-center border-b border-black">
                                            <span className="text-white font-black text-xs tracking-[0.2em]">NYAYNOW LEGAL COMMAND</span>
                                            <span className="text-indigo-300 text-[10px] font-bold">SYSTEM_GEN_V2.0 // IND_JUD_STD</span>
                                        </div>

                                        <div className="p-16 md:p-24 bg-white text-slate-900 font-serif leading-loose">
                                            <div className="text-center mb-16 border-b-2 border-slate-900 pb-8">
                                                <h1 className="text-3xl font-black uppercase tracking-[0.4em] mb-2 text-slate-900">LEGAL NOTICE</h1>
                                                <p className="italic text-slate-500 font-sans text-sm tracking-wide">Privileged and Confidential Communication</p>
                                            </div>

                                            <div className="prose prose-slate max-w-none prose-p:text-justify prose-p:text-lg prose-headings:mb-4">
                                                <pre className="whitespace-pre-wrap font-serif text-slate-900 leading-[2.2] text-justify text-lg tracking-tight">
                                                    {generatedNotice}
                                                </pre>
                                            </div>

                                            {/* Signature Grid */}
                                            <div className="mt-32 grid grid-cols-2 gap-20 pt-10 border-t border-slate-200">
                                                <div>
                                                    <div className="h-24 flex items-end mb-4 italic text-slate-300 text-sm">Seal & Authorization Required</div>
                                                    <div className="h-px bg-slate-900 mb-3" />
                                                    <p className="font-black text-sm uppercase tracking-wider">{form.senderName}</p>
                                                    <p className="text-xs text-slate-500 font-sans font-bold uppercase tracking-widest mt-1">Advocate on Record</p>
                                                    {form.senderBarCouncil && <p className="text-[10px] text-slate-400 font-sans mt-0.5">Enrolment: {form.senderBarCouncil}</p>}
                                                </div>
                                                <div className="text-right">
                                                    <div className="h-24" />
                                                    <p className="text-6xl font-black text-slate-100 mb-0 opacity-40 select-none">NYAYNOW</p>
                                                    <div className="h-px bg-slate-200 mb-3" />
                                                    <p className="font-bold text-sm text-slate-500 uppercase tracking-widest font-sans">Issued: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Quick Insight Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Instrument Class', value: form.noticeType.split('(')[0].trim(), icon: '📜', color: 'indigo' },
                                { label: 'Primary Target', value: form.recipientName, icon: '👤', color: 'rose' },
                                { label: 'Execution Window', value: `${form.complianceDays} Standard Days`, icon: '⚡', color: 'emerald' },
                            ].map(({ label, value, icon, color }) => (
                                <div key={label} className="bg-[#0f172a]/80 backdrop-blur-md rounded-[2rem] p-8 border border-white/5 shadow-xl hover:border-indigo-500/20 transition-all group overflow-hidden relative">
                                    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                                    <div className="text-3xl mb-6 transform group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-500">{icon}</div>
                                    <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.2em] mb-1">{label}</p>
                                    <p className="text-white text-lg font-bold truncate tracking-tight">{value || 'NOT_SPECIFIED'}</p>
                                </div>
                            ))}
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
