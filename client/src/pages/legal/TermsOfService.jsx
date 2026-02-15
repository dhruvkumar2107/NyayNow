import React from 'react';
import Navbar from '../../components/Navbar';


const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-[#020617] flex flex-col font-sans text-slate-400 selection:bg-amber-500/30">
            <Navbar />

            <div className="relative pt-32 pb-20 px-6">
                {/* Background FX */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

                <div className="container mx-auto max-w-4xl relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-500/20 mb-6">
                            Legal Compliance
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Terms of Service</h1>
                        <p className="text-slate-500">Effective Date: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="bg-[#0f172a] backdrop-blur-xl p-10 md:p-16 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                <span className="text-amber-500 text-lg">01.</span> Acceptance
                            </h2>
                            <p className="leading-relaxed text-lg font-light">
                                By accessing <span className="text-white font-bold">NyayNow</span> ("the Platform"), you agree to be legally bound by these Terms. Our services are designed to augment, not replace, professional legal counsel.
                            </p>
                        </section>

                        <div className="h-px bg-white/5 w-full"></div>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                <span className="text-amber-500 text-lg">02.</span> AI Disclaimer
                            </h2>
                            <div className="bg-amber-500/10 border-l-4 border-amber-500 p-6 rounded-r-xl">
                                <p className="text-amber-200 leading-relaxed italic">
                                    "Our Artificial Intelligence models provide legal information, not advice. Verification by a qualified attorney is mandatory for all critical legal matters."
                                </p>
                            </div>
                        </section>

                        <div className="h-px bg-white/5 w-full"></div>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                <span className="text-amber-500 text-lg">03.</span> User Conduct
                            </h2>
                            <ul className="grid gap-4">
                                {[
                                    "You must provide accurate verification documents.",
                                    "Misuse of AI for illegal drafting is strictly prohibited.",
                                    "Account credentials must be kept confidential."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <div className="h-px bg-white/5 w-full"></div>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                <span className="text-amber-500 text-lg">04.</span> Limitation of Liability
                            </h2>
                            <p className="leading-relaxed">
                                To the maximum extent permitted by law, NyayNow shall not be liable for any indirect, incidental, or consequential damages arising from the use of our AI tools or lawyer connection services.
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 text-center">
                        <button onClick={() => window.print()} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition uppercase tracking-wider text-xs">
                            Download PDF Version
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default TermsOfService;
