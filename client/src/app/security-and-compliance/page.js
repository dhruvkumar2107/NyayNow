'use client'

import Link from "next/link"
import { Shield, Lock, Server, FileText } from "lucide-react"

export default function SecurityCompliance() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col pt-24">

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
                        This page describes the safeguards present in the application code and the items that still depend on deployment configuration. It is not a certification or a claim of complete legal compliance.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Section 1: Encryption */}
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Lock className="text-blue-400" size={22} />
                            Transport and storage security
                        </h2>
                        <p className="text-slate-400 leading-relaxed mb-4 text-sm md:text-base">
                            Production HTTPS is provided by the hosting and service providers. Encryption at rest, key management, backup access, and retention depend on each provider’s configuration and have not been independently audited in this repository. The application uses authenticated API routes and HTTP security headers; these controls do not guarantee confidentiality.
                        </p>
                        <p className="text-slate-500 text-xs">Do not submit highly sensitive case information until you have reviewed the applicable service and provider terms.</p>
                    </div>

                    {/* Section 2: Data Residency */}
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <Server className="text-emerald-400" size={22} />
                            Hosting locations
                        </h2>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                            The repository does not establish that all production data is hosted in India. Hosting regions and cross-border processing depend on the current frontend, backend, database, AI, analytics, storage, and communications provider configurations. Confirm those regions and subprocessors before using the service for restricted data.
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
                                    Used by the backend to generate responses. Review Google’s terms for the configured account and region to understand processing, retention, and data use. Avoid sending sensitive information unless the applicable terms have been reviewed.
                                </span>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs md:text-sm">
                                <strong className="text-white block mb-1">Twilio API</strong>
                                <span className="text-slate-500 leading-relaxed">
                                    Used in selected messaging and verification flows. Processing and retention are governed by the configured account and Twilio terms.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Data Rights & Redressal */}
                    <div className="p-8 rounded-2xl bg-[#000000] border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none" />
                        <h2 className="text-xl font-bold text-white mb-3 tracking-tight">Your data rights (DPDP Act)</h2>
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6">
                            For access, correction, or deletion requests, contact NyayNow through the contact page. Requests are handled subject to identity verification, applicable law, and the data systems currently in use. Review the privacy policy for the published process.
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

        </div>
    )
}
