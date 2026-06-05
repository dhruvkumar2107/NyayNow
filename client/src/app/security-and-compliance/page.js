'use client'

import React from "react"
import Link from "next/link"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { Shield, Lock, Server, FileText, CheckCircle } from "lucide-react"

export default function SecurityCompliance() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col pt-24">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full relative z-10">
                <div className="absolute top-0 inset-x-0 h-[300px] bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.05),_transparent_70%)] pointer-events-none" />

                <div className="mb-12">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <Shield size={12} /> Compliance & Trust
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Security and Compliance
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Our technical architectures, data retention policies, and third-party frameworks are designed to guarantee complete confidentiality and DPDP Act 2023 compliance.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Section 1: Encryption */}
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Lock className="text-blue-400" size={22} />
                            State-of-the-art encryption
                        </h2>
                        <p className="text-slate-400 leading-relaxed mb-4 text-sm md:text-base">
                            All network channels use TLS 1.3 / SSL encryption to secure data in transit. Files, documents, case summaries, and conversations are encrypted at rest using AES-256 keys, ensuring that no unauthorized parties can intercept or read your records.
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm font-semibold text-slate-300">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-400" /> End-to-End SSL Transmission</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-400" /> AES-256 rest encryption</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-400" /> Secure key rotation policy</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-400" /> Strictly isolated client databases</li>
                        </ul>
                    </div>

                    {/* Section 2: Data Residency */}
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Server className="text-emerald-400" size={22} />
                            Indian data residency & sovereign clouds
                        </h2>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                            In alignment with the Digital Personal Data Protection (DPDP) Act 2023, NyayNow hosts all databases, case files, and account information strictly within sovereign data centers located inside India (Mumbai and Delhi regions). No user data leaves India’s national borders.
                        </p>
                    </div>

                    {/* Section 3: Subprocessors */}
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <FileText className="text-amber-400" size={22} />
                            Subprocessors & LLM safety
                        </h2>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base mb-4">
                            We integrate secure API infrastructure for processing localized text:
                        </p>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs md:text-sm">
                                <strong className="text-white block mb-1">Gemini API (Google Cloud Platform)</strong>
                                <span className="text-slate-500 leading-relaxed">
                                    Used as our main legal LLM compiler. Data passed to the API is encrypted, strictly transient, and Google does not use our prompts, documents, or legal queries to train any public models.
                                </span>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs md:text-sm">
                                <strong className="text-white block mb-1">Twilio API</strong>
                                <span className="text-slate-500 leading-relaxed">
                                    Used exclusively for generating OTP tokens and sending emergency triage warnings. All numbers and messages are logged temporarily for transport security.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Data Rights & Redressal */}
                    <div className="p-8 rounded-2xl bg-[#000000] border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none" />
                        <h2 className="text-xl font-bold text-white mb-3 tracking-tight">Your data rights (DPDP Act)</h2>
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6">
                            Under the DPDP Act 2023, you hold the right to access, rectify, or completely delete your information at any time. If you wish to request a complete export or a permanent takedown of your account history, please contact our Grievance Redressal Officer.
                        </p>
                        <Link 
                            href="/contact"
                            className="inline-flex items-center gap-2 text-xs font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
                        >
                            Contact Redressal Officer →
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
