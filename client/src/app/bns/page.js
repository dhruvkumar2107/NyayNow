import Link from 'next/link';
import { Scale, ArrowRight, Search } from 'lucide-react';

export const metadata = {
  title: 'BNS Legal Directory — Bharatiya Nyaya Sanhita 2024 Section Guide | NyayNow',
  description: 'Complete guide to Bharatiya Nyaya Sanhita (BNS) 2024 sections in Hindi, Tamil, Telugu and English. Covers BNS equivalents of IPC 302 (murder), IPC 379 (theft), IPC 420 (cheating) and more.',
  keywords: 'BNS 2024, Bharatiya Nyaya Sanhita sections, BNS IPC equivalent, Indian criminal law guide, BNS in Hindi, BNS in Tamil, BNS in Telugu',
  openGraph: {
    title: 'BNS Legal Directory — Bharatiya Nyaya Sanhita 2024 | NyayNow',
    description: 'Complete multilingual guide to BNS 2024 sections. Free legal information in 11 Indian languages.',
    url: 'https://nyaynow.in/bns',
    siteName: 'NyayNow'
  }
};

const SECTIONS = [
  {
    key: 'section-103',
    title: 'Section 103',
    oldIpc: 'IPC 302',
    offense: 'Punishment for Murder',
    punishment: 'Death or life imprisonment + fine',
    color: 'rose'
  },
  {
    key: 'section-303',
    title: 'Section 303',
    oldIpc: 'IPC 379',
    offense: 'Punishment for Theft',
    punishment: 'Up to 3 years imprisonment + fine',
    color: 'amber'
  },
  {
    key: 'section-318',
    title: 'Section 318',
    oldIpc: 'IPC 420',
    offense: 'Cheating / Fraudulent Inducement',
    punishment: 'Up to 7 years imprisonment + fine',
    color: 'blue'
  }
];

const colorMap = {
  rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
};

export default function BnsDirectoryPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 pt-28 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Hero */}
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 text-xs font-black uppercase tracking-widest">
            <Scale size={12} /> Bharatiya Nyaya Sanhita 2024
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-white leading-tight">
            BNS Legal Directory
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Plain-language explanations of every key section of the Bharatiya Nyaya Sanhita (BNS) 2024 — India's new criminal code that replaced the Indian Penal Code (IPC). Available in <strong className="text-white">Hindi, Tamil, Telugu, Marathi</strong> and 7 more Indian languages.
          </p>
          <Link
            href="/translator"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition"
          >
            Translate any legal text <ArrowRight size={12} />
          </Link>
        </div>

        {/* Section Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Search size={16} className="text-slate-500" /> Browse BNS Sections
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {SECTIONS.map(sec => (
              <Link
                key={sec.key}
                href={`/bns/${sec.key}`}
                className="group bg-white/5 border border-white/10 hover:border-blue-500/30 p-6 rounded-2xl transition hover:bg-white/[0.07] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${colorMap[sec.color]}`}>
                    {sec.title}
                  </span>
                  <span className="text-slate-600 text-xs font-mono group-hover:text-slate-400 transition">{sec.oldIpc}</span>
                </div>
                <h3 className="font-serif font-bold text-white text-base group-hover:text-blue-300 transition">{sec.offense}</h3>
                <p className="text-slate-500 text-xs">{sec.punishment}</p>
                <div className="flex items-center gap-1 text-blue-400 text-[10px] font-black uppercase tracking-wider pt-1">
                  Read Full Section <ArrowRight size={10} />
                </div>
              </Link>
            ))}

            {/* Coming soon card */}
            <div className="bg-white/[0.03] border border-dashed border-white/10 p-6 rounded-2xl space-y-3 opacity-60">
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border text-slate-500 bg-white/5 border-white/10">
                More Sections Coming Soon
              </span>
              <p className="text-slate-500 text-sm">BNS Sections for assault, defamation, dowry death, cybercrime, and more are being added weekly.</p>
              <Link href="/assistant" className="text-blue-400 text-[10px] font-black uppercase tracking-wider hover:underline">
                Ask AI for any Section →
              </Link>
            </div>
          </div>
        </div>

        {/* Cross-link to translator */}
        <div className="bg-gradient-to-r from-blue-500/10 to-sky-500/10 border border-blue-500/20 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-white text-lg">Need it in your language?</h3>
            <p className="text-slate-400 text-sm max-w-md">Our Bhashini-powered legal translator converts any legal notice, FIR, or court order into plain Hindi, Tamil, Telugu or Marathi instantly.</p>
          </div>
          <Link
            href="/translator"
            className="shrink-0 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            Open Translator <ArrowRight size={12} />
          </Link>
        </div>

      </div>
    </div>
  );
}
