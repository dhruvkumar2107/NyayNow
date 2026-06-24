import dynamic from 'next/dynamic';

export const metadata = {
    title: 'NyayVoice — Multilingual AI Legal Voice Assistant | NyayNow',
    description: 'Ask legal questions in your native Indian language by voice. NyayVoice supports Hindi, Tamil, Telugu, Bengali, and 11 more languages with instant AI responses.',
    alternates: {
        canonical: 'https://nyaynow.in/nyayvoice',
    },
    openGraph: {
        title: 'NyayVoice — Multilingual AI Legal Voice Assistant | NyayNow',
        description: 'Ask legal questions in your native Indian language by voice. NyayVoice supports Hindi, Tamil, Telugu, Bengali, and 11 more languages.',
        url: 'https://nyaynow.in/nyayvoice',
    }
}

const NyayVoice = dynamic(() => import('../voice-assistant/page'), {
    ssr: false,
    loading: () => (
        <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-blue-300 font-bold uppercase tracking-widest text-xs">Initializing Voice Engine...</p>
            </div>
        </div>
    )
});

export default function NyayVoicePage() {
    return <NyayVoice />;
}
