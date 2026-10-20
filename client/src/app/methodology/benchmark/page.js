export const metadata = {
  title: 'Legal AI evaluation status | NyayNow',
  description: 'Current status of NyayNow legal AI evaluation.',
  robots: { index: false, follow: false },
};

export default function BenchmarkStatusPage() {
  return <main className="min-h-screen bg-[#020617] text-slate-200 pt-28 pb-20"><article className="max-w-3xl mx-auto px-6">
    <p className="text-xs uppercase tracking-widest text-amber-300">Evaluation in development</p>
    <h1 className="mt-4 text-4xl font-bold text-white">No public benchmark results yet</h1>
    <p className="mt-5 leading-7 text-slate-400">NyayNow has not published a counsel-reviewed benchmark or reproducible performance results. We will not display accuracy numbers until dataset permissions, task definitions, reviewer rubric, sample size, baseline, and error analysis are documented.</p>
    <h2 className="mt-10 text-2xl text-white font-semibold">Planned measures</h2>
    <ul className="mt-4 list-disc pl-6 space-y-2 text-slate-400"><li>Citation existence and passage support scored separately</li><li>Statute currency, jurisdiction, and procedural context</li><li>Unsupported statements, abstention, and severe error rates</li><li>Language quality, human correction time, latency, and cost</li></ul>
    <p className="mt-8 text-sm text-slate-500">Dataset, permissions, reviewer identities, sample size, and results: [NEEDED]. No sample case dataset is published here.</p>
  </article></main>;
}
