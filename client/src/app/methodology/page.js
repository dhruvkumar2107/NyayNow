import Link from "next/link"
import { BookOpen, Scale, ShieldCheck, Database, ArrowRight, FlaskConical } from "lucide-react"

export const metadata = {
    title: 'AI Methodology & Evaluation | NyayNow',
    description: 'How NyayNow currently generates Indian legal information, uses optional legal search context, and plans to validate citation quality.',
    alternates: { canonical: 'https://nyaynow.in/methodology' },
}

const stages = [
    { n: '01', title: 'Understand the question', body: 'The API receives the user’s question and selected language. The assistant can also receive a short conversation history and user-provided case context.' },
    { n: '02', title: 'Retrieve when configured', body: 'When an Indian Kanoon API key is configured, selected routes search Indian Kanoon and pass a small number of returned snippets and links to the model. Without that key, this retrieval step is skipped.' },
    { n: '03', title: 'Generate and disclose limits', body: 'The backend calls Google Gemini through a model fallback helper. The answer is generated text and can be wrong or incomplete; users should open cited sources and ask a qualified advocate about case-specific decisions.' },
]

export default function Methodology() {
    return (
        <main className="min-h-screen bg-[#020617] text-slate-300 font-sans pt-24">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="mb-12">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <BookOpen size={12} /> AI methodology
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">How NyayNow works today</h1>
                    <p className="text-slate-400 text-lg">We describe the deployed architecture and its current limits plainly. This page is updated as retrieval, evaluation, and data partnerships are built and validated.</p>
                </div>

                <section className="space-y-4 mb-12" aria-label="Current request flow">
                    {stages.map((stage) => <article key={stage.n} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-xs text-blue-400 font-bold tracking-widest">STEP {stage.n}</span>
                        <h2 className="text-xl font-bold text-white mt-2 mb-2">{stage.title}</h2>
                        <p className="text-slate-400 leading-relaxed">{stage.body}</p>
                    </article>)}
                </section>

                <section className="grid md:grid-cols-2 gap-4 mb-12">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3"><Database className="text-emerald-400" size={19} /> What is implemented</h2>
                        <ul className="space-y-2 text-sm text-slate-400 list-disc pl-5">
                            <li>Gemini-based generation in the Node API.</li>
                            <li>Optional Indian Kanoon search in selected legal routes, when configured.</li>
                            <li>Some routes request Google Search grounding through Gemini; availability depends on model and API configuration.</li>
                            <li>A separate FastAPI service exists, but the main assistant route inspected here uses the Node service.</li>
                        </ul>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3"><FlaskConical className="text-amber-400" size={19} /> What is not yet substantiated</h2>
                        <ul className="space-y-2 text-sm text-slate-400 list-disc pl-5">
                            <li>No public, reproducible benchmark currently supports a legal accuracy percentage.</li>
                            <li>The inspected assistant path does not implement a custom vector database or embedding retrieval pipeline.</li>
                            <li>Corpus size, update cadence, and comprehensive court coverage are not independently verified here.</li>
                            <li>AI output is not a substitute for legal advice and does not predict a court outcome reliably.</li>
                        </ul>
                    </div>
                </section>

                <section className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 mb-12">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3"><ShieldCheck className="text-blue-400" size={20} /> Evaluation before stronger claims</h2>
                    <p className="text-sm text-slate-400 leading-relaxed">A credible legal AI evaluation should publish the dataset provenance and cutoff date, task definitions, citation-level scoring rules, expert review process, sample size, baselines, error categories, and confidence intervals. NyayNow will publish performance claims only after that protocol is run and independently reviewable.</p>
                </section>

                <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3"><Scale className="text-red-400" size={20} /> User safety</h2>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">Treat generated content as an informational starting point. Verify every statute and judgment against its source, especially before filing, signing, paying, or taking urgent action. Do not enter highly sensitive personal information unless you have reviewed the applicable privacy terms.</p>
                    <Link href="/disclaimer" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300">Read the legal disclaimer <ArrowRight size={15} /></Link>
                </section>
            </div>
        </main>
    )
}
