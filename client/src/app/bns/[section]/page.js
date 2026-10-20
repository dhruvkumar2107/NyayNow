import Link from 'next/link';

export const metadata = {
  title: 'BNS section explanations in development | NyayNow',
  description: 'NyayNow has not published counsel-reviewed BNS section explanations. Consult the official Act.',
  robots: { index: false, follow: false },
};

export default function BnsSectionPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 pt-28 pb-20 px-6">
      <article className="max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-amber-300">Legal review in development</p>
        <h1 className="mt-4 text-4xl font-bold text-white">BNS section explanations are not published yet</h1>
        <p className="mt-5 leading-7 text-slate-400">NyayNow has not completed source-linked, counsel-reviewed explanations for individual sections. Do not rely on an AI-generated section summary for legal decisions. Consult the current official Act and a qualified advocate.</p>
        <p className="mt-6"><a className="text-blue-300 underline" href="https://www.indiacode.nic.in/handle/123456789/20062" target="_blank" rel="noreferrer">Source record IN-CODE-BNS-2023: official India Code text</a></p>
        <Link className="mt-8 inline-block text-sm text-slate-300 underline" href="/bns">Return to BNS status</Link>
      </article>
    </main>
  );
}
