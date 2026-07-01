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
