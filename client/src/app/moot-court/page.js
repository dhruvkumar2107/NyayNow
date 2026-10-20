'use client'

import dynamic from 'next/dynamic';
import UpgradeGate from "../../components/UpgradeGate";

const MootCourt = dynamic(() => import("../../../legacy_ignore/pages/MootCourt"), {
    ssr: false,
    loading: () => (
        <div className="h-screen flex items-center justify-center bg-[#0c1220] text-white">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-indigo-300 font-bold uppercase tracking-widest text-xs">Preparing Virtual Courtroom...</p>
            </div>
        </div>
    )
});

export default function MootCourtPage() {
    if (process.env.NEXT_PUBLIC_EXPERIMENTAL_MOOT_COURT_ENABLED !== 'true') {
        return (
            <main className="min-h-screen bg-[#020617] px-6 pb-20 pt-36 text-slate-200">
                <section className="mx-auto max-w-3xl rounded-2xl border border-amber-400/20 bg-amber-400/5 p-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Practice feedback in development</p>
                    <h1 className="mt-4 text-3xl font-bold text-white">Moot court scoring is not available yet</h1>
                    <p className="mt-4 leading-7 text-slate-300">The current scoring method and citation assessment have not been independently evaluated. Do not treat generated scores or feedback as legal accuracy or professional assessment.</p>
                </section>
            </main>
        );
    }
    return (
        <div className="min-h-screen bg-[#020617] pt-20 px-4">
            <div className="max-w-5xl mx-auto">
                <UpgradeGate feature="moot-court">
                    <MootCourt />
                </UpgradeGate>
            </div>
        </div>
    );
}
