import dynamic from 'next/dynamic';

export const metadata = {
    title: 'NyayCourt Simulator — AI Trial Simulation | NyayNow',
    description: 'Simulate a full courtroom trial with AI legal agents arguing both sides of your case. Powered by Indian law and real judicial precedents.',
    alternates: {
        canonical: 'https://nyaynow.in/nyaycourt-simulator',
    },
    openGraph: {
        title: 'NyayCourt Simulator — AI Trial Simulation | NyayNow',
        description: 'Simulate a full courtroom trial with AI legal agents arguing both sides of your case. Powered by Indian law and real judicial precedents.',
        url: 'https://nyaynow.in/nyaycourt-simulator',
    }
}

const CourtroomBattle = dynamic(() => import('../courtroom-battle/page'), {
    ssr: false,
    loading: () => (
        <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-blue-300 font-bold uppercase tracking-widest text-xs">Convening the High Court...</p>
            </div>
        </div>
    )
});

export default function NyayCourtSimulatorPage() {
    return <CourtroomBattle />;
}
