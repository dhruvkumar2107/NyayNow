import { useState } from "react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import PaywallModal from "../components/PaywallModal";

export default function AgreementForm() {
    const { user } = useAuth();
    const [step, setStep] = useState(1); // 1: Type, 2: Details, 3: Preview
    const [docType, setDocType] = useState("Rent Agreement");
    const [loading, setLoading] = useState(false);
    const [contract, setContract] = useState("");
    const [showPaywall, setShowPaywall] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        partyA: "", // Landlord / Employer
        partyB: "", // Tenant / Employee
        amount: "",
        duration: "",
        location: "",
        extraTerms: ""
    });

    const handleDraft = async () => {
        setLoading(true);
        try {
            const res = await axios.post("/api/ai/draft-contract", {
                type: docType,
                parties: {
                    Party_1: formData.partyA,
                    Party_2: formData.partyB
                },
                terms: {
                    Amount: formData.amount,
                    Duration: formData.duration,
                    Location: formData.location,
                    Extra_Terms: formData.extraTerms
                }
            });
            setContract(res.data.contract);
            setStep(3);
        } catch (err) {
            if (err.response?.status === 403) {
                setShowPaywall(true);
            } else {
                alert("Drafting Failed: " + (err.response?.data?.error || "Unknown"));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        window.print(); // Simple PDF export via browser for now
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <Navbar />
            <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

            <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
                <header className="text-center mb-10">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                        TurboAgreements
                    </span>
                    <h1 className="text-4xl font-bold text-[#0B1120] mb-2 font-display">
                        AI Contract <span className="text-blue-600">Drafter</span>
                    </h1>
                    <p className="text-slate-500">Create waterproof legal documents in seconds.</p>
                </header>

                {/* PROGRESS BAR */}
                <div className="flex items-center justify-center mb-10 gap-4">
                    {[1, 2, 3].map(chk => (
                        <div key={chk} className={`w-3 h-3 rounded-full ${step >= chk ? "bg-blue-600" : "bg-slate-200"}`} />
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 min-h-[400px]">

                    {/* STEP 1: SELECT TYPE */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-bold mb-6">Select Document Type</h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                {["Rent Agreement", "NDA (Non-Disclosure)", "Employment Contract", "Sale Deed", "Freelance Agreement"].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => { setDocType(type); setStep(2); }}
                                        className={`p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02]
                                            ${docType === type
                                                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                                                : "border-slate-100 hover:border-blue-300"}`}
                                    >
                                        <div className="text-2xl mb-2">📄</div>
                                        <div className="font-bold text-slate-800">{type}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: FILL DETAILS */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-8">
                            <h2 className="text-2xl font-bold mb-6">Enter Details for {docType}</h2>
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">First Party (e.g. Landlord)</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 border rounded-lg"
                                        value={formData.partyA}
                                        onChange={e => setFormData({ ...formData, partyA: e.target.value })}
                                        placeholder="Full Name / Company"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Second Party (e.g. Tenant)</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 border rounded-lg"
                                        value={formData.partyB}
                                        onChange={e => setFormData({ ...formData, partyB: e.target.value })}
                                        placeholder="Full Name / Company"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Value / Amount (₹)</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 border rounded-lg"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="e.g. 15,000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Duration / Date</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 border rounded-lg"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        placeholder="e.g. 11 Months"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Location / Property Address</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 border rounded-lg"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Full Address"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Extra Terms / Specific Clauses</label>
                                    <textarea
                                        className="w-full p-3 bg-slate-50 border rounded-lg h-24 resize-none"
                                        value={formData.extraTerms}
                                        onChange={e => setFormData({ ...formData, extraTerms: e.target.value })}
                                        placeholder="e.g. No pets allowed, 2 months notice period..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button onClick={() => setStep(1)} className="text-slate-500 font-bold px-4">Back</button>
                                <button
                                    onClick={handleDraft}
                                    disabled={loading}
                                    className="bg-[#0B1120] hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
                                >
                                    {loading ? "Drafting with AI..." : "Generate Contract ✨"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PREVIEW & DOWNLOAD */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-8">
                            <div className="flex justify-between items-center mb-6 no-print">
                                <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2">
                                    <span>✓</span> Draft Ready
                                </h2>
                                <div className="flex gap-2">
                                    <button onClick={() => setStep(2)} className="text-slate-500 font-bold px-4">Edit</button>
                                    <button
                                        onClick={handleDownload}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition"
                                    >
                                        Print / Save PDF 📥
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white p-8 border border-slate-200 shadow-sm rounded-none min-h-[600px] prose max-w-none print:shadow-none print:border-0">
                                <ReactMarkdown>{contract}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
