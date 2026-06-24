import dynamic from 'next/dynamic';

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
    return <MootCourt />;
}
