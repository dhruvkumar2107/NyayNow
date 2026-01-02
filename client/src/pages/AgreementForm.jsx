import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function AgreementForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        landlordName: "",
        tenantName: "",
        propertyAddress: "",
        rentAmount: "",
        depositAmount: "",
        leaseStart: "",
        leaseDuration: "11",
    });

    const [generatedDoc, setGeneratedDoc] = useState(null);

    const generateAgreement = async () => {
        setLoading(true);
        try {
            // We can reuse the AI endpoint with a qualified prompt
            const prompt = `
            Draft a Rental Agreement (11 Months) for India.
            Landlord: ${formData.landlordName}
            Tenant: ${formData.tenantName}
            Address: ${formData.propertyAddress}
            Rent: ₹${formData.rentAmount}/month
            Deposit: ₹${formData.depositAmount}
            Start Date: ${formData.leaseStart}
            
            Use standard Indian legal terminology.
        `;

            const res = await axios.post("/api/ai/draft-notice", { // Reusing draft endpoint for generic docs
                notice_details: prompt,
                type: "Rental Agreement",
                language: "English"
            });

            setGeneratedDoc(res.data.draft);
        } catch (err) {
            alert("Generation Failed");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 pb-20">
            <Navbar />
            <div className="max-w-3xl mx-auto pt-24 px-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Rental Agreement Generator
                </h1>
                <p className="text-gray-500 mb-8">Fill the details below to auto-generate a legally binding rental agreement.</p>

                {!generatedDoc ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Landlord Name</label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900"
                                    value={formData.landlordName}
                                    onChange={e => setFormData({ ...formData, landlordName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tenant Name</label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900"
                                    value={formData.tenantName}
                                    onChange={e => setFormData({ ...formData, tenantName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Property Address</label>
                            <textarea
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900"
                                rows={3}
                                value={formData.propertyAddress}
                                onChange={e => setFormData({ ...formData, propertyAddress: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (₹)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900"
                                    value={formData.rentAmount}
                                    onChange={e => setFormData({ ...formData, rentAmount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Deposit (₹)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900"
                                    value={formData.depositAmount}
                                    onChange={e => setFormData({ ...formData, depositAmount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900"
                                    value={formData.leaseStart}
                                    onChange={e => setFormData({ ...formData, leaseStart: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            onClick={generateAgreement}
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-lg text-white transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                            {loading ? "Generating..." : "Generate Agreement Draft 📄"}
                        </button>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 animate-in fade-in slide-in-from-bottom-4 shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Generated Draft</h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setGeneratedDoc(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
                                >
                                    Edit Details
                                </button>
                                <button
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold shadow-sm"
                                    onClick={() => alert("Sent to Home Delivery Partner (Dunzo/Porter) - Mock")}
                                >
                                    Print & Deliver 🚚
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 text-gray-900 p-10 rounded-lg shadow-inner min-h-[500px] font-serif whitespace-pre-wrap leading-relaxed">
                            {generatedDoc}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
