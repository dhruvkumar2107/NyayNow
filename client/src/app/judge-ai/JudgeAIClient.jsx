'use client';

import dynamic from 'next/dynamic';

const JudgeAI = dynamic(() => import('../../components/dashboard/lawyer/JudgeAI'), {
    ssr: false,
    loading: () => <div className="h-screen flex items-center justify-center bg-[#020617] text-white">Loading Judge AI...</div>,
});

export default function JudgeAIClient() {
    return <JudgeAI />;
}
