import Link from 'next/link';

export default function DigiLockerUnavailable() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <section className="max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Integration unavailable</p>
        <h1 className="mt-3 text-3xl font-bold">DigiLocker verification is not available</h1>
        <p className="mt-4 leading-7 text-slate-300">NyayNow is not connected to an authorized DigiLocker flow on this page. No Aadhaar, OTP, or identity details should be entered here. Lawyer credentials are not verified through this page.</p>
        <Link href="/marketplace" className="mt-6 inline-flex rounded-lg bg-white px-4 py-2 font-semibold text-slate-950">Return to lawyer profiles</Link>
      </section>
    </main>
  );
}
