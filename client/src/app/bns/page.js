export const metadata = {
  title: 'BNS legal information status | NyayNow',
  description: 'Status of NyayNow legal-code explanations and primary-source links.',
  robots: { index: false, follow: false },
};

export default function BnsDirectoryPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 pt-28 pb-20 px-6">
      <article className="max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-amber-300">Legal review in development</p>
        <h1 className="mt-4 text-4xl font-bold text-white">BNS explanations are not published yet</h1>
        <p className="mt-5 leading-7 text-slate-400">NyayNow has not completed source-linked, counsel-reviewed section explanations. Do not rely on AI-generated summaries for legal decisions. Consult the current official Act and a qualified advocate.</p>
        <p className="mt-6"><a className="text-blue-300 underline" href="https://www.indiacode.nic.in/handle/123456789/20062" target="_blank" rel="noreferrer">Source record IN-CODE-BNS-2023: official India Code text</a></p>
      </article>
    </main>
  );
}
