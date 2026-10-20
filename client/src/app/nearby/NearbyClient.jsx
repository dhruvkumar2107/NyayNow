'use client';

import dynamic from 'next/dynamic';

const Nearby = dynamic(() => import('../../../legacy_ignore/pages/Nearby'), {
    ssr: false,
    loading: () => <div className="min-h-screen flex items-center justify-center bg-[#0c1220] text-white">Loading map...</div>,
});

export default function NearbyClient() {
    return <Nearby />;
}
