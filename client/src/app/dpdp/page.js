import React from "react"
import Link from "next/link"
import { Shield, Lock, CheckCircle, Scale, EyeOff, UserCheck } from "lucide-react"

export const metadata = {
    title: 'DPDP Act 2023 Compliance',
    description: 'NyayNow compliance with India\'s Digital Personal Data Protection (DPDP) Act 2023. Understand your rights as a Data Principal.',
}

export default function DPDPCompliancePage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col pt-24">
            <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full relative z-10">
                <div className="absolute top-0 inset-x-0 h-[300px] bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.05),_transparent_70%)] pointer-events-none" />

                <div className="mb-12">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <Shield size={12} /> DPDP Act 2023
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Digital Personal Data Protection Compliance
                    </h1>
                    <p className="text-slate-400 text-lg">
                        In accordance with the Digital Personal Data Protection (DPDP) Act 2023 of India, NyayNow guarantees the security, transparency, and portability of your personal legal data.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Data Principal Rights */}
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Scale className="text-emerald-400" size={22} />
                            Your Rights as a Data Principal
                        </h2>
                        <p className="text-slate-400 leading-relaxed mb-6 text-sm md:text-base">
                            Under the DPDP Act 2023, you hold the following absolute rights regarding the personal data and case briefs you upload to the NyayNow platform:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm font-semibold text-slate-300">
                            <li className="flex items-start gap-2.5">
                                <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-white">Right to Access</p>
                                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">Request a complete summary of your personal data and active cases.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-white">Right to Correction & Erasure</p>
                                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">Request immediate correction or permanent deletion of your data.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-white">Right to Withdraw Consent</p>
                                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">Revoke our consent to process your legal documents at any time.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-white">Right to Grievance Redressal</p>
                                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">Directly contact our Grievance Redressal team for unresolved concerns.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Data Fiduciary Obligations */}
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Lock className="text-blue-400" size={22} />
                            Our Obligations as a Data Fiduciary
                        </h2>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                            NyayNow operates strictly as a Data Fiduciary under the Act. We ensure:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs md:text-sm">
                                <strong className="text-white block mb-1">Local Storage in India</strong>
                                <span className="text-slate-500">
                                    All databases, case uploads, and backups are hosted in secure Indian data center zones (Mumbai/Delhi).
                                </span>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs md:text-sm">
                                <strong className="text-white block mb-1">Zero AI Training Usage</strong>
                                <span className="text-slate-500">
                                    Your case information, chat prompts, and legal drafts are strictly excluded from AI training loops.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Consent Withdrawal & Grievance */}
                    <div className="p-8 rounded-2xl bg-[#000000] border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
                        <h2 className="text-xl font-bold text-white mb-3 tracking-tight">Withdrawal of Consent & Redressal</h2>
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6">
                            If you wish to withdraw your consent for data processing, request complete erasure of your profile and history, or submit a grievance, please write to our Data Privacy & Compliance Desk. We resolve all Data Principal requests within 7 business days.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link 
                                href="/contact"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                Submit Request
                            </Link>
                            <a 
                                href="mailto:support@nyaynow.in"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                support@nyaynow.in
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
