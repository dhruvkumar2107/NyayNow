import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const CourtStatus = () => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;

        // Diamond Plan check could happen here or backend
        // For demo, we let everyone see it, but maybe show a badge

        setLoading(true);
        setError('');
        setCaseData(null);

        try {
            // Simulate API call
            const res = await axios.get(`/api/ecourts/search?query=${query}`);
            setCaseData(res.data);
        } catch (err) {
            setError("Could not find case. Please check the CNR number.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />

            <div className="container mx-auto px-6 py-12 max-w-5xl">
                <div className="text-center mb-12">
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                        🏛️ Official eCourt Sync
                    </span>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Check Real-time Case Status</h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Directly connected to the National Judicial Data Grid (NJDG).
                        Enter your CNR Number or Case Number below.
                    </p>
                </div>

                {/* SEARCH BOX */}
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 mb-12 max-w-2xl mx-auto relative overflow-hidden">
                    {/* Decorative bg */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>

                    <form onSubmit={handleSearch} className="relative z-10 flex gap-4">
                        <input
                            type="text"
                            placeholder="Enter Case No (e.g., CNT/1203/2024)"
                            className="flex-grow bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-amber-500 focus:border-amber-500 block w-full p-4"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#0B1120] hover:bg-slate-800 text-white font-bold rounded-xl px-8 py-3 transition-all disabled:opacity-70 flex items-center gap-2"
                        >
                            {loading ? 'Fetching...' : 'Search Record'}
                        </button>
                    </form>
                    {user?.plan !== 'diamond' && (
                        <p className="text-xs text-center mt-3 text-slate-400">
                            🚀 Faster speeds available for <Link to="/pricing" className="text-amber-600 font-bold hover:underline">Diamond Members</Link>
                        </p>
                    )}
                </div>

                {/* RESULTS */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium max-w-2xl mx-auto border border-red-100">
                        {error}
                    </div>
                )}

                {caseData && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* HEADER */}
                        <div className="bg-[#0B1120] p-6 text-white flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                            <div>
                                <h2 className="text-2xl font-bold">{caseData.court}</h2>
                                <p className="text-slate-400 text-sm font-mono mt-1">CNR: {caseData.cnr}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Status</div>
                                <div className={`text-lg font-bold px-4 py-1 rounded-full inline-block ${caseData.status === 'Pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-green-500/20 text-green-300'}`}>
                                    {caseData.status}
                                </div>
                            </div>
                        </div>

                        {/* BODY */}
                        <div className="p-8 grid md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <DetailRow label="Case Number" value={caseData.caseNumber} />
                                <DetailRow label="Filing Date" value={caseData.filingDate} />
                                <DetailRow label="Next Hearing" value={caseData.nextHearing} highlight />
                                <DetailRow label="Coram (Judge)" value={caseData.judge} />
                                <DetailRow label="Current Stage" value={caseData.stage} />
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Parties</h3>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">P</span>
                                            <span className="font-semibold text-slate-800">{caseData.petitioner}</span>
                                        </div>
                                        <div className="flex justify-center my-2">
                                            <span className="text-xs text-slate-400">VS</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">R</span>
                                            <span className="font-semibold text-slate-800">{caseData.respondent}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Acts & Sections</h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {caseData.acts.map(act => (
                                            <span key={act} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium border border-slate-200">
                                                {act}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TIMELINE */}
                        <div className="border-t border-slate-100 p-8 bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Case History</h3>
                            <div className="space-y-6 relative border-l-2 border-slate-200 ml-3 pl-8">
                                {caseData.history.map((h, i) => (
                                    <div key={i} className="relative">
                                        {/* Dot */}
                                        <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white border-4 border-slate-300"></div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                            <div>
                                                <h4 className="font-bold text-slate-800">{h.action}</h4>
                                                <p className="text-sm text-slate-500">{h.outcome}</p>
                                            </div>
                                            <span className="text-xs font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">{h.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const DetailRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className={`font-bold ${highlight ? 'text-amber-600 text-lg' : 'text-slate-900'}`}>{value}</span>
    </div>
);

export default CourtStatus;
