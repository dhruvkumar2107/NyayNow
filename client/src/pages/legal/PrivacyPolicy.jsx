import React from 'react';
import Navbar from '../../components/Navbar';

import { Shield, Lock, Eye, Database } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-[#020617] flex flex-col font-sans text-slate-400 selection:bg-indigo-500/30">
            <Navbar />

            <div className="relative pt-32 pb-20 px-6">
                {/* Background FX */}
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

                <div className="container mx-auto max-w-4xl relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20 mb-6">
                            Data Protection
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Privacy Policy</h1>
                        <p className="text-slate-500">Compliance Verified: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        <div className="bg-[#0f172a] border border-white/10 p-6 rounded-2xl flex items-center gap-4 shadow-lg shadow-black/20">
                            <div className="bg-emerald-500/20 p-3 rounded-xl text-emerald-400"><Lock size={24} /></div>
                            <div>
                                <h3 className="text-white font-bold">End-to-End Encryption</h3>
                                <p className="text-xs text-slate-400">AES-256 Standard for all case files.</p>
                            </div>
                        </div>
                        <div className="bg-[#0f172a] border border-white/10 p-6 rounded-2xl flex items-center gap-4 shadow-lg shadow-black/20">
                            <div className="bg-indigo-500/20 p-3 rounded-xl text-indigo-400"><Database size={24} /></div>
                            <div>
                                <h3 className="text-white font-bold">Zero-Training Policy</h3>
                                <p className="text-xs text-slate-400">Your private data is NOT used to train our AI.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0f172a] backdrop-blur-xl p-10 md:p-16 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                1. Data Collection
                            </h2>
                            <p className="leading-relaxed text-lg font-light mb-4">
                                We utilize minimal data collection protocols required to function:
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Identity Verification Documents (Encrypted)
                                </li>
                                <li className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Case Metadata for Lawyer Matching
                                </li>
                            </ul>
                        </section>

                        <div className="h-px bg-white/5 w-full"></div>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                2. Usage of Information
                            </h2>
                            <p className="leading-relaxed">
                                Client case details are accessible <span className="text-white font-bold">only</span> to the specific lawyer you explicitly connect with. Our AI analyzes text strings locally or via stateless calls where possible to ensure confidentiality.
                            </p>
                        </section>

                        <div className="h-px bg-white/5 w-full"></div>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                3. Cookies & Tracking
                            </h2>
                            <p className="leading-relaxed">
                                We use session cookies strictly for authentication and safety. We do not sell your behavioral data to third-party ad networks.
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 text-center">
                        <div className="inline-block p-4 rounded-xl bg-[#0f172a] border border-white/10">
                            <p className="text-slate-500 text-xs text-center">
                                Questions about your data? <br />
                                <a href="mailto:privacy@nyaynow.com" className="text-indigo-400 font-bold hover:underline">Contact our DPO</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PrivacyPolicy;
