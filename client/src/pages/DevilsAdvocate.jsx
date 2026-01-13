import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

const DevilsAdvocate = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [argument, setArgument] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    // GATING
    if (user && !['gold', 'diamond'].includes(user.plan)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center p-8 max-w-md">
                    <h1 className="text-4xl font-extrabold text-red-600 mb-4">😈 ACCESS DENIED</h1>
                    <p className="text-gray-400 mb-8">
                        The Devil's Advocate is reserved for **Gold & Diamond** members.
                        Prepare your arguments against the toughest AI opponent.
                    </p>
                    <button
                        onClick={() => navigate("/pricing")}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
                    >
                        Upgrade to Challenge
                    </button>
                </div>
            </div>
        );
    }

    const handleChallenge = async () => {
        if (!argument) return;
        setLoading(true);
        setAnalysis(null);

        try {
            const res = await axios.post('/api/ai/devils-advocate', { argument });
            setAnalysis(res.data);
            toast.error("Objection Overruled!", { icon: "🔨" });
        } catch (err) {
            console.error(err);
            toast.error("Server Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-200 selection:bg-red-500/30">
            <Navbar />
            <Toaster />

            <div className="container mx-auto px-6 py-12 max-w-6xl">

                {/* HEADER */}
                <div className="text-center mb-16 relative">
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 tracking-tighter mb-4 italic">
                        THE DEVIL'S ADVOCATE
                    </h1>
                    <p className="text-red-400 font-mono tracking-widest uppercase text-sm">
                        AI Adversarial Engine • Test Your Case Before The Court Does
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">

                    {/* LEFT: DEFENSE (USER) */}
                    <div className="bg-[#111] border border-gray-800 p-8 rounded-3xl relative">
                        <span className="absolute -top-3 left-8 bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded-full tracking-wider uppercase">
                            Your Argument (Defense)
                        </span>

                        <textarea
                            className="w-full bg-[#0a0a0a] border border-gray-700 rounded-xl p-6 text-lg text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all h-[400px] resize-none leading-relaxed"
                            placeholder="Type your opening statement, bail argument, or defense logic here..."
                            value={argument}
                            onChange={(e) => setArgument(e.target.value)}
                        />

                        <button
                            onClick={handleChallenge}
                            disabled={loading}
                            className={`w-full mt-6 py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all 
                            ${loading ? 'bg-gray-800 cursor-wait' : 'bg-white text-black hover:bg-gray-200 hover:scale-[1.01]'}`}
                        >
                            {loading ? "Simulating Opposition..." : "Challenge The AI ⚡"}
                        </button>
                    </div>

                    {/* RIGHT: PROSECUTION (AI) */}
                    <div className={`p-8 rounded-3xl border-2 transition-all duration-500 relative min-h-[500px] flex flex-col justify-center
                        ${analysis ? 'bg-[#1a0505] border-red-900/50' : 'bg-[#111] border-dashed border-gray-800'}`}>

                        <span className="absolute -top-3 right-8 bg-red-600 text-white px-3 py-1 text-xs font-bold rounded-full tracking-wider uppercase">
                            Opposing Counsel (AI)
                        </span>

                        {!analysis ? (
                            <div className="text-center opacity-30">
                                <div className="text-6xl mb-4">⚖️</div>
                                <h3 className="text-xl font-bold uppercase">Waiting for your move</h3>
                                <p className="text-sm mt-2">I will find every loophole in your logic.</p>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                                <h3 className="text-2xl font-bold text-red-500 mb-6 font-mono border-b border-red-900/50 pb-4">
                                    "OBJECTION, YOUR HONOR!"
                                </h3>

                                <div className="space-y-6">
                                    <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                        <h4 className="text-red-400 text-xs font-bold uppercase mb-2">Rebuttal</h4>
                                        <p className="text-gray-300 italic">"{analysis.sarcastic_rebuttal}"</p>
                                    </div>

                                    <div>
                                        <h4 className="text-orange-500 text-xs font-bold uppercase mb-3">Critical Weaknesses</h4>
                                        <ul className="space-y-2">
                                            {analysis.weaknesses.map((w, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-gray-400">
                                                    <span className="text-red-600 font-bold">✕</span> {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="text-blue-500 text-xs font-bold uppercase mb-3">Counter-Arguments</h4>
                                        <ul className="space-y-2">
                                            {analysis.counter_arguments.map((c, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-gray-400">
                                                    <span className="text-blue-600 font-bold">→</span> {c}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DevilsAdvocate;
