import { useState } from "react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import PaywallModal from "../components/PaywallModal";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Lock, Briefcase, Scroll, ExternalLink, Sparkles, Printer, Edit2, ArrowLeft } from "lucide-react";

export default function AgreementForm() {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [docType, setDocType] = useState("Rent Agreement");
    const [loading, setLoading] = useState(false);
    const [contract, setContract] = useState("");
    const [showPaywall, setShowPaywall] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        partyA: "", partyB: "", amount: "", duration: "", location: "", extraTerms: ""
    });

    const handleDraft = async () => {
        if (!user && parseInt(localStorage.getItem("ai_usage_agreement") || "0") >= 1) {
            setShowPaywall(true); return;
        }
        setLoading(true);
        try {
            const res = await axios.post("/api/ai/draft-contract", {
                type: docType,
                parties: { Party_1: formData.partyA, Party_2: formData.partyB },
                terms: { Amount: formData.amount, Duration: formData.duration, Location: formData.location, Extra_Terms: formData.extraTerms }
            });
            setContract(res.data.contract);
            if (!user) localStorage.setItem("ai_usage_agreement", "1");
            setStep(3);
        } catch (err) {
            if (err.response?.status === 403) setShowPaywall(true);
            else alert("Drafting Failed");
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-400 font-sans selection:bg-indigo-500/30 pb-20 overflow-hidden relative">
            <Navbar />
            <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

            {/* PROGRESS READER */}
            <div className="fixed top-24 left-0 w-full z-40 px-6 pointer-events-none">
                <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
                    <button onClick={step > 1 ? () => setStep(step - 1) : null} className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition ${step > 1 ? 'text-slate-400 hover:text-white cursor-pointer' : 'opacity-0'}`}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="flex gap-2 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-2 rounded-full transition-all duration-500 ${step >= s ? 'w-12 bg-indigo-500 shadow-[0_0_10px_#6366f1]' : 'w-4 bg-white/10'}`}></div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-40 max-w-6xl mx-auto px-6 relative z-10 min-h-[600px] flex flex-col justify-center">
                <AnimatePresence mode="wait">

                    {/* STEP 1: TYPE SELECTION */}
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key="step1" className="text-center">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl mx-auto mb-8 flex items-center justify-center text-4xl shadow-xl shadow-indigo-500/20">
                                <Scroll className="text-white" />
                            </motion.div>
                            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">AI Drafting <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Studio</span></h2>
                            <p className="text-slate-400 mb-16 text-xl max-w-2xl mx-auto">Select a legal framework to begin automating your documentation.</p>

                            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                                {[
                                    { name: "Rent Agreement", icon: <FileText size={28} />, desc: "Residential or commercial lease terms." },
                                    { name: "NDA", icon: <Lock size={28} />, desc: "Confidentiality & Non-Disclosure." },
                                    { name: "Employment Contract", icon: <Briefcase size={28} />, desc: "Offer letters and role definitions." },
                                    { name: "Sale Deed", icon: <Scroll size={28} />, desc: "Property & asset transfer proof." },
                                    { name: "Freelance Agreement", icon: <ExternalLink size={28} />, desc: "Client-Contractor scope of work." },
                                    { name: "Custom", icon: <Sparkles size={28} />, desc: "Tailor-made for specific needs." },
                                ].map(t => (
                                    <button
                                        key={t.name}
                                        onClick={() => { setDocType(t.name); setStep(2); }}
                                        className={`p-8 rounded-[2rem] border transition-all text-left flex flex-col gap-4 group relative overflow-hidden
                                        ${docType === t.name
                                                ? 'bg-indigo-600 border-indigo-500 shadow-2xl scale-[1.02]'
                                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 hover:-translate-y-1'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${docType === t.name ? 'bg-white/20 text-white' : 'bg-white/5 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white'}`}>
                                            {t.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-white mb-1 group-hover:text-indigo-200 transition">{t.name}</h3>
                                            <p className="text-sm text-slate-500 group-hover:text-slate-300 transition">{t.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: DETAILS FORM */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} key="step2">
                            <div className="max-w-3xl mx-auto">
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-bold text-white mb-2">Configure {docType}</h2>
                                    <p className="text-slate-400">Fill in the key parameters for the AI engine.</p>
                                </div>

                                <div className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <Input label="First Party" placeholder="Full Legal Name (e.g. Landlord)" value={formData.partyA} onChange={e => setFormData({ ...formData, partyA: e.target.value })} />
                                        <Input label="Second Party" placeholder="Full Legal Name (e.g. Tenant)" value={formData.partyB} onChange={e => setFormData({ ...formData, partyB: e.target.value })} />
                                        <Input label="Term Duration" placeholder="e.g. 11 Months" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                                        <Input label="Consideration Value" placeholder="₹ 0.00 (Rent/Salary/Fee)" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                                    </div>
                                    <Input label="Jurisdiction / Address" placeholder="Complete Location Address" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 ml-1 uppercase tracking-wider">Special Clauses</label>
                                        <textarea
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 outline-none focus:border-indigo-500 transition resize-none h-32 text-white placeholder-slate-600 font-medium"
                                            placeholder="Add specific terms, conditions, or bespoke clauses here..."
                                            value={formData.extraTerms}
                                            onChange={e => setFormData({ ...formData, extraTerms: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            onClick={handleDraft}
                                            disabled={loading}
                                            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:scale-[1.01] transition shadow-[0_0_30px_rgba(99,102,241,0.3)] disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                                        >
                                            {loading ? <><span className="animate-spin text-xl">🌀</span> Synthesizing Document...</> : <><Sparkles size={20} /> Generate Agreement</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: PREVIEW */}
                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key="step3" className="max-w-4xl mx-auto">
                            <div className="flex justify-between items-center mb-8 bg-black/40 p-4 rounded-2xl border border-white/10 backdrop-blur-md sticky top-24 z-30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">✓</div>
                                    <div>
                                        <h2 className="font-bold text-white leading-tight">Draft Ready</h2>
                                        <p className="text-xs text-slate-400">AI-Generated Legal Draft</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white px-4 py-2 rounded-lg transition font-bold text-sm bg-white/5 hover:bg-white/10 flex items-center gap-2">
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button onClick={() => window.print()} className="bg-white text-black px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200 shadow-lg transition flex items-center gap-2 text-sm">
                                        <Printer size={16} /> Print / PDF
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white text-slate-900 p-16 shadow-2xl rounded-[3px] min-h-[800px] mx-auto print:shadow-none print:border-0 print:m-0 print:w-full font-serif leading-relaxed">
                                <div className="mb-12 text-center border-b-2 border-black pb-8">
                                    <h1 className="text-4xl font-bold uppercase tracking-widest mb-2">{docType.toUpperCase()}</h1>
                                    <p className="italic text-slate-600">Generated via NyayNow Legal AI</p>
                                </div>

                                <article className="prose prose-slate max-w-none prose-p:text-justify prose-headings:font-bold prose-lg">
                                    <ReactMarkdown>{contract}</ReactMarkdown>
                                </article>

                                <div className="mt-32 flex justify-between pt-10 border-t border-slate-300 break-inside-avoid">
                                    <div className="text-center w-64">
                                        <div className="h-16 border-b border-black mb-2"></div>
                                        <p className="font-bold text-lg">{formData.partyA || "Party A"}</p>
                                        <p className="text-xs uppercase tracking-widest text-slate-500">(Signature)</p>
                                    </div>
                                    <div className="text-center w-64">
                                        <div className="h-16 border-b border-black mb-2"></div>
                                        <p className="font-bold text-lg">{formData.partyB || "Party B"}</p>
                                        <p className="text-xs uppercase tracking-widest text-slate-500">(Signature)</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}

function Input({ label, value, onChange, placeholder }) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 ml-1 uppercase tracking-wider">{label}</label>
            <input
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-indigo-500 transition font-medium text-white placeholder-slate-600"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    )
}
