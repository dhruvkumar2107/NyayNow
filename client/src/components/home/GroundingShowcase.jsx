'use client'

import Link from "next/link"
import { ArrowRight, BookOpenCheck } from "lucide-react"

export default function GroundingShowcase() {
    return (
        <section className="py-24 bg-[#020617] border-y border-white/5">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-amber-200">
                    <BookOpenCheck size={15} /> Source verification in development
                </div>
                <h2 className="mt-6 text-3xl md:text-5xl font-bold text-white tracking-tight">
                    Legal answers need sources you can check
                </h2>
                <p className="mt-5 text-slate-400 text-lg leading-relaxed">
                    NyayNow does not yet publish verified example answers or benchmark results. AI-generated legal information can be incomplete or incorrect. Check primary sources and consult an advocate before acting.
                </p>
                <Link href="/methodology/benchmark" className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5">
                    See evaluation status <ArrowRight size={16} />
                </Link>
            </div>
        </section>
    )
}
