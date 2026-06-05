'use client'

import React from "react"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { Scale, Users, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react"

export default function CaseStudies() {
    const studies = [
        {
            title: "Transitioning to BNS 2024",
            industry: "Legal Practice Group",
            summary: "How a mid-sized law firm in Bengaluru mapped their open litigations to the new Bharatiya Nyaya Sanhita criminal codes in under 48 hours using the NyayNow Precedent Engine.",
            metric: "90% Time Saved",
            icon: Scale
        },
        {
            title: "Pro-bono Legal Aid Assistance",
            industry: "Non-Profit Organization",
            summary: "A legal aid society used NyayVoice dialect models to capture audio testimony from rural clients in Hindi and Kannada, automatically mapping claims to statutory guidelines.",
            metric: "400+ Clients Guided",
            icon: Users
        },
        {
            title: "Contract Compliance Restructuring",
            industry: "Technology Enterprise",
            summary: "A cloud-hosting company scrubbed 1,200 active client service level agreements to conform to data retention rules outlined in the Indian DPDP Act 2023.",
            metric: "Zero Compliancy Gaps",
            icon: CheckCircle
        }
    ]

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col pt-24">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full relative z-10">
                <div className="absolute top-0 inset-x-0 h-[300px] bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.05),_transparent_70%)] pointer-events-none" />

                <div className="mb-16">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <Users size={12} /> Case Studies
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Case Studies
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Explore how advocates, organizations, and businesses leverage NyayNow to streamline legal workflows and master transitions to the new 2024 legal frameworks.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 mb-16">
                    {studies.map((study) => {
                        const Icon = study.icon
                        return (
                            <div key={study.title} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-bl-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white tracking-tight">{study.title}</h2>
                                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-0.5">{study.industry}</p>
                                            </div>
                                        </div>
                                        <p className="text-slate-400 leading-relaxed text-sm md:text-base">{study.summary}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 px-6 py-4 rounded-2xl text-center min-w-[150px] self-start md:self-center">
                                        <span className="text-xs text-slate-500 block mb-1">Impact</span>
                                        <span className="text-sm font-black text-white uppercase tracking-wider">{study.metric}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Privacy Warning */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4">
                    <ShieldAlert size={20} className="text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-slate-500 text-xs leading-relaxed">
                        To maintain strict advocate-client privileges and adhere to the DPDP Act 2023, case studies are modeled based on general platform usage reports. Identifiable details, specific facts, and litigation records have been fully anonymized.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    )
}
