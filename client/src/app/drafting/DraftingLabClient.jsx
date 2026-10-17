'use client';

import dynamic from 'next/dynamic';

const DraftingLab = dynamic(() => import('../../../legacy_ignore/pages/DraftingLab'), {
    ssr: false,
    loading: () => <div className="h-screen flex items-center justify-center bg-[#020617] text-white">Loading Drafting Lab...</div>,
});

export default function DraftingLabClient() {
    return <DraftingLab />;
}
