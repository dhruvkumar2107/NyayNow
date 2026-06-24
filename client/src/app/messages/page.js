import dynamic from 'next/dynamic';

const Messages = dynamic(() => import("../../../legacy_ignore/pages/Messages"), {
    ssr: false,
    loading: () => (
        <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-indigo-300 font-bold uppercase tracking-widest text-xs">Establishing Secure Uplink...</p>
            </div>
        </div>
    )
});

export default function MessagesPage() {
    return <Messages />;
}
