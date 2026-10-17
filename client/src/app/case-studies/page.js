'use client'

import Link from "next/link"
import { Scale, Users, ShieldAlert, ArrowRight } from "lucide-react"

export default function CaseStudies() {
    const useCases = [
        {
            title: "Understand a legal question",
            industry: "Current product capability",
            summary: "A user can ask a question in the assistant and receive an AI-generated informational response. Selected routes can include search results from Indian Kanoon when the integration is configured. All citations need source verification.",
            icon: Scale
        },
        {
            title: "Practice advocacy",
            industry: "Current product capability",
            summary: "Interactive moot-court and courtroom simulation experiences let users practice argumentation. These are learning tools, not court-tested legal outcomes or professional representation.",
            icon: Users
        }
    ]

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col pt-24">

            <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full relative z-10">
                <div className="absolute top-0 inset-x-0 h-[300px] bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.05),_transparent_70%)] pointer-events-none" />

                <div className="mb-16">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <Users size={12} /> Product use cases
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Product use cases
                    </h1>
                    <p className="text-slate-400 text-lg">
                        These describe product workflows, not customer deployments. We will publish measured outcomes only with permission and supporting evidence.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 mb-16">
                    {useCases.map((study) => {
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
                                    <span className="text-xs font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-2">Available workflow</span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4">
                    <ShieldAlert size={20} className="text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-slate-500 text-xs leading-relaxed">
                        NyayNow is seeking design partners to validate time saved, citation accuracy, language quality, and repeat usage with consented workflows. No customer results or measured impact are claimed on this page.
                    </p>
                </div>
                <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300">Discuss a pilot <ArrowRight size={15} /></Link>
            </main>

        </div>
    )
}
