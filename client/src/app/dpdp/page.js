import Link from 'next/link';

export const metadata = {
  title: 'Privacy and data rights',
  description: 'Current privacy information and the data controls that NyayNow is still building.',
  alternates: { canonical: 'https://nyaynow.in/dpdp' },
};

const items = [
  ['Data minimisation and purpose limitation', 'In development. The product and processor inventory, consent records, and purpose-to-field map require a documented privacy review.'],
  ['Access, correction, and deletion', 'An authenticated account deletion route exists. Its coverage across all databases, payment records, backups, and providers has not been independently verified. For a request, contact support@nyaynow.in.'],
  ['Consent withdrawal', 'A documented consent-management workflow and withdrawal endpoint are in development. Do not submit sensitive evidence or case files until the applicable service processing terms have been reviewed.'],
  ['Grievance contact', 'The appointed grievance officer identity and contact details are [NEEDED]. Until recorded, contact support@nyaynow.in and label the matter “privacy grievance”.'],
  ['Retention and breach response', 'A complete retention schedule, breach runbook, and response ownership are [NEEDED].'],
  ['Hosting, processors, and model providers', 'Locations and retention vary by provider configuration. We do not claim India-only storage or that prompts are excluded from model-provider retention/training. Review the current provider terms before sharing sensitive information.'],
];

export default function PrivacyRightsPage() {
  return <main className="min-h-screen bg-[#020617] text-slate-300 pt-28 pb-20"><div className="max-w-4xl mx-auto px-6">
    <p className="text-sm uppercase tracking-widest text-emerald-400">Privacy and data rights</p>
    <h1 className="text-4xl md:text-5xl font-bold text-white mt-3">Current controls and open work</h1>
    <p className="text-slate-400 text-lg mt-5">This page describes repository-level status. It is not a representation that NyayNow is fully compliant with the Digital Personal Data Protection Act, 2023, or its rules.</p>
    <div className="grid gap-4 mt-10">{items.map(([title, body]) => <section key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6"><h2 className="text-white text-xl font-semibold">{title}</h2><p className="mt-2 leading-7">{body}</p></section>)}</div>
    <p className="mt-8"><Link className="text-blue-400 underline" href="/grievance">Grievance information</Link> · <Link className="text-blue-400 underline" href="/privacy">Privacy policy</Link></p>
  </div></main>;
}
