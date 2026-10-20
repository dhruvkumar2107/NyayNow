'use client';

import dynamic from 'next/dynamic';

const NyayVoice = dynamic(() => import('../voice-assistant/page'), {
    ssr: false,
    loading: () => <div className="h-screen flex items-center justify-center bg-[#020617] text-white">Loading voice assistant...</div>,
});

export default function NyayVoiceClient() {
    return <NyayVoice />;
}
