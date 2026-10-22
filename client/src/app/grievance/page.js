import Link from 'next/link';

export const metadata = {
  title: 'Grievance information | NyayNow',
  description: 'How to contact NyayNow about a grievance and information still needed for formal grievance handling.',
  alternates: { canonical: 'https://nyaynow.in/grievance' },
};

export default function GrievancePage() {
  return <main className="min-h-screen bg-[#020617] text-slate-300 pt-28 pb-20"><div className="max-w-3xl mx-auto px-6">
    <p className="text-xs uppercase tracking-widest text-blue-300">Grievance information</p>
    <h1 className="text-4xl font-bold text-white mt-3">Contact NyayNow</h1>
    <p className="mt-5 leading-7">Email <a className="text-blue-300 underline" href="mailto:support@nyaynow.in?subject=Privacy%20grievance">support@nyaynow.in</a> with “privacy grievance” in the subject. Share only the minimum information needed to identify your request; do not email sensitive case evidence.</p>
    <section className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-6"><h2 className="text-xl font-semibold text-white">Formal contact details</h2><p className="mt-2">The appointed grievance officer’s name, postal address, monitored escalation channel, and response timelines have not been verified in the materials available for this review. These details are [NEEDED] and must be filled and legally reviewed before this page is represented as the formal statutory grievance notice.</p></section>
    <p className="mt-6"><Link className="text-blue-300 underline" href="/dpdp">Privacy and data rights</Link></p>
  </div></main>;
}
