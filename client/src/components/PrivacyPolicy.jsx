"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 py-24 px-6 md:px-12 lg:px-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/20 flex items-center justify-center">
                        <Shield size={24} className="text-purple-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Privacy Policy</h1>
                </div>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Database size={20} className="text-purple-400" />
                            1. Data Collection
                        </h2>
                        <p className="leading-relaxed">
                            We collect information necessary to provide legal technology services, including account details, case descriptions for AI analysis, and communication logs. We do not sell your personal data to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Lock size={20} className="text-purple-400" />
                            2. Data Security & Encryption
                        </h2>
                        <p className="leading-relaxed">
                            Communications are secured using industry-standard encryption protocols. However, "End-to-End Encryption" (E2EE) is only applied to specific messaging channels. AI queries are processed through secure servers but are subject to processing by our AI infrastructure providers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Eye size={20} className="text-purple-400" />
                            3. Disclosure Requirements
                        </h2>
                        <p className="leading-relaxed">
                            We may disclose user data if required to do so by law or in the good-faith belief that such action is necessary to comply with legal obligations, protect and defend the rights or property of NyayNow, or protect the personal safety of users.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Database size={20} className="text-purple-400" />
                            4. AI Training and Model Exclusion
                        </h2>
                        <p className="leading-relaxed">
                            <span className="text-white font-bold text-sm">We do NOT use your personal data, uploaded case files, agreement PDFs, or AI assistant conversation history to train artificial intelligence or machine learning models.</span> All legal information queries are processed using stateless API nodes where data is analyzed in real-time and not saved or repurposed for AI optimization.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Shield size={20} className="text-purple-400" />
                            5. Your Data Rights
                        </h2>
                        <p className="leading-relaxed">
                            Under the Digital Personal Data Protection (DPDP) Act 2023, you have the following rights:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4 text-sm">
                            <li><span className="text-white font-bold">Right to Access</span>: Request a summary of your personal data processed by us.</li>
                            <li><span className="text-white font-bold">Right to Correction & Erasure</span>: Update inaccurate info or request permanent deletion of your data.</li>
                            <li><span className="text-white font-bold">Right to Nominate</span>: Nominate another individual to exercise your rights in case of death or incapacity.</li>
                            <li><span className="text-white font-bold">Right to Withdrawal</span>: Withdraw consent at any time via account settings.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Shield size={20} className="text-purple-400" />
                            6. Children's Personal Data
                        </h2>
                        <p className="leading-relaxed">
                            In accordance with Section 9 of the Digital Personal Data Protection (DPDP) Act 2023, we do not knowingly collect or process personal data of children (individuals under 18 years of age) without verifiable parental/guardian consent. We do not engage in tracking, behavioral monitoring, or targeted advertising directed at children.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Database size={20} className="text-purple-400" />
                            7. Retention and Localization
                        </h2>
                        <p className="leading-relaxed">
                            Your personal data is localized and stored on secure cloud servers located within the territory of India. We retain personal data only for as long as necessary to fulfill the specific purposes of legal information processing or as mandated by applicable Indian statutory laws.
                        </p>
                    </section>

                    <section className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20">
                        <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-widest">8. Data Protection Officer (DPO)</h2>
                        <p className="text-xs text-slate-400 mb-4 font-medium">
                            Mandatory disclosure under Digital Personal Data Protection (DPDP) Act, 2023.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter mb-0.5">Contact Person</p>
                                <p className="text-white font-bold text-xs uppercase tracking-widest">Mr. Dhruv Kumar</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter mb-0.5">Primary Email</p>
                                <p className="text-purple-400 font-bold text-xs tracking-widest">nyaynow.in@gmail.com</p>
                            </div>
                        </div>
                    </section>

                    <section className="p-6 rounded-2xl bg-white/5 border border-white/10 italic text-sm">
                        Your privacy is our priority. Last updated: June 2026.
                    </section>
                </div>
            </motion.div>
        </div>
    );
};

export default PrivacyPolicy;
