'use client';

import dynamic from 'next/dynamic';

const CourtroomBattle = dynamic(() => import('../courtroom-battle/page'), {
    ssr: false,
    loading: () => <div className="h-screen flex items-center justify-center bg-[#020617] text-white">Loading courtroom simulation...</div>,
});

export default function NyayCourtSimulatorClient() {
    return <CourtroomBattle />;
}
