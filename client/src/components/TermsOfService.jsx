"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Scale, Lock, Info } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 py-24 px-6 md:px-12 lg:px-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                        <Scale size={24} className="text-blue-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Terms of Service</h1>
                </div>

                <div className="space-y-12">
                    <section className="p-6 rounded-[32px] bg-red-500/5 border border-red-500/20">
                        <p className="text-sm text-red-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Shield size={16} /> Important Legal Disclaimer
                        </p>
                        <p className="text-white text-base leading-relaxed font-bold">
                            The use of NyayNow AI and its secondary features DOES NOT create an attorney-client relationship. All AI-generated outputs are for informational purposes and should not be treated as professional legal advice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Info size={20} className="text-blue-400" />
                            1. Nature of Service
                        </h2>
                        <p className="leading-relaxed">
                            NyayNow is a legal technology platform. The AI-generated content provided, including but not limited to legal analysis, case summaries, and draft documents, is for <span className="text-white font-bold italic underline">informational purposes only</span>. NyayNow AI is not a registered advocate and does not provide legal advice. Use of this service does not create an attorney-client relationship.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Shield size={20} className="text-blue-400" />
                            2. Limitation of Liability
                        </h2>
                        <p className="leading-relaxed">
                            NyayNow shall not be liable for any damages arising out of the use or inability to use the services. You acknowledge that AI outputs may contain errors or inaccuracies and you are encouraged to consult with a registered advocate before taking any legal action based on AI-generated information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Lock size={20} className="text-blue-400" />
                            3. User Conduct & Confidentiality
                        </h2>
                        <p className="leading-relaxed">
                            Information shared on public features like "Confessions" is not privileged. While we strive to maintain anonymity, data may be disclosed if required by legal process or court order. Do not share highly sensitive or incriminating details on public forums.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Scale size={20} className="text-blue-400" />
                            4. Refund Policy
                        </h2>
                        <p className="leading-relaxed">
                            Subscription fees for NyayNow Pro (Gold/Diamond) are generally non-refundable once AI credits have been consumed or a strategic analysis (Judge AI) has been generated. Refund requests made within 24 hours of purchase, where no features have been utilized, may be considered at the sole discretion of the management.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Info size={20} className="text-blue-400" />
                            5. Accuracy of AI Output
                        </h2>
                        <p className="leading-relaxed">
                            Output from "Judge AI," including "Win Probability" and "Risk Scores," are <span className="text-blue-400 font-bold">Simulated Educational Metrics</span> based on machine learning probability distributions. They do not represent factual guarantees of real-world judicial outcomes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Lock size={20} className="text-blue-400" />
                            6. Smart Escrow & Technology Provider Status
                        </h2>
                        <p className="leading-relaxed">
                            The "Smart Escrow" feature acts solely as a technological intermediary connecting users to authorized payment gateways. NyayNow is NOT a bank, financial institution, trust company, or fiduciary. We hold zero liability for uncompleted or disputed transactions between enterprise users and their counsel.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Shield size={20} className="text-blue-400" />
                            7. Drafting Lab & Quantum Vault
                        </h2>
                        <p className="leading-relaxed">
                            Legal documents generated by the Autonomous Drafting Lab are algorithmic composite drafts. You maintain sole responsibility for verifying the legality and enforceability of any contract. NyayNow explicitly disclaims liability for voided clauses or breaches of contract resulting from AI-generated text. "Quantum Vault" designates standard AES-256 cloud encryption methodology.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Scale size={20} className="text-blue-400" />
                            8. NyayVoice & Courtroom Battle
                        </h2>
                        <p className="leading-relaxed">
                            "NyayVoice" and "Courtroom Battle" (Trial Simulator) utilize advanced speech processing and multi-agent AI. These features are strictly for <span className="text-blue-400 font-bold">Training and Simulation</span> purposes. NyayNow assumes zero liability for the accuracy of voice-to-text transcriptions or the legal validity of arguments practiced within the simulated environment. Users are solely responsible for verifying AI-generated precedents in a real court of law.
                        </p>
                    </section>

                    <section className="p-6 rounded-2xl bg-white/5 border border-white/10 italic text-sm">
                        By using NyayNow, you agree to these terms. Last updated: March 2026.
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

export default TermsOfService;
