import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const JudgeProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    // GATING check
    if (user && user.plan !== 'diamond') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white shadow-xl rounded-2xl max-w-md border border-slate-200">
                    <div className="text-4xl mb-4">⚖️</div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Diamond Access Only</h1>
                    <p className="text-slate-500 mb-6">
                        User psychology and bias profiling is an elite feature.
                        Upgrade to Diamond to unlock Judicial Analytics.
                    </p>
                    <button onClick={() => navigate("/pricing")} className="bg-[#0B1120] text-white px-6 py-3 rounded-xl font-bold">
                        Upgrade Now
                    </button>
                </div>
            </div>
        );
    }

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.get(`/api/ecourts/judge-profile?name=${query}`);
            setData(res.data);
        } catch (err) {
            alert("Could not fetch profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />

            <div className="container mx-auto px-6 py-12 max-w-5xl">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-2">🧑‍⚖️ Judge Psychology Profiler</h1>
                    <p className="text-slate-500">Know your judge before you enter the courtroom.</p>
                </div>

                {/* SEARCH */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-xl mx-auto mb-12">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Enter Judge Name (e.g., Justice A.K. Menon)"
                            className="flex-grow border-slate-300 rounded-lg p-3"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button disabled={loading} className="bg-blue-600 text-white px-6 rounded-lg font-bold">
                            {loading ? "Analyzing..." : "Analyze"}
                        </button>
                    </form>
                </div>

                {/* RESULTS */}
                {data && (
                    <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* CARD 1: BIO */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 col-span-1">
                            <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">👨‍⚖️</div>
                            <h2 className="text-xl font-bold text-center mb-1">{data.name}</h2>
                            <p className="text-sm text-center text-slate-500 mb-6">{data.court}</p>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm border-b pb-2">
                                    <span className="text-slate-500">Judgments Analyzed</span>
                                    <span className="font-bold">{data.total_judgments}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b pb-2">
                                    <span className="text-slate-500">Appointed</span>
                                    <span className="font-bold">{data.appointed}</span>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg text-center">
                                    <span className="block text-xs text-blue-500 font-bold uppercase">Archetype</span>
                                    <span className="font-bold text-blue-800">{data.adjective}</span>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: BIAS METER */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 col-span-2">
                            <h3 className="text-lg font-bold mb-6">🧠 Judicial Tendencies & Biases</h3>

                            <div className="space-y-6">
                                {data.biases.map((b, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium text-slate-700">{b.topic}</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${b.color === 'red' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                {b.tendency}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${b.color === 'red' ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: '70%' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Favorite Citations</h4>
                                    <ul className="text-sm space-y-1">
                                        {data.favorite_citations.map(c => (
                                            <li key={c} className="italic text-slate-600">"{c}"</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Keywords Used</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {data.keywords.map(k => (
                                            <span key={k} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">{k}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default JudgeProfile;
