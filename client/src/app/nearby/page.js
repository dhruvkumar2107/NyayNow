import dynamic from 'next/dynamic';

const Nearby = dynamic(() => import("../../../legacy_ignore/pages/Nearby"), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-[#0c1220] font-sans pb-20 flex items-center justify-center text-white">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <h2 className="text-2xl font-bold mt-6 tracking-widest uppercase">Initializing Radar</h2>
                <p className="text-indigo-400 font-mono text-sm mt-2">Loading Map Engine...</p>
            </div>
        </div>
    )
});

export default function NearbyPage() {
    return <Nearby />;
}
