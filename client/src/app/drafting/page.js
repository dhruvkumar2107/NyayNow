import dynamic from 'next/dynamic';

export const metadata = {
    title: 'AI Legal Document Drafting | NyayNow',
    description: 'Draft legal notices, agreements, and contracts with AI assistance. Instant, lawyer-reviewed templates for Indian law.',
    alternates: {
        canonical: 'https://nyaynow.in/drafting',
    },
    openGraph: {
        title: 'AI Legal Document Drafting | NyayNow',
        description: 'Draft legal notices, agreements, and contracts with AI assistance. Instant, lawyer-reviewed templates for Indian law.',
        url: 'https://nyaynow.in/drafting',
    }
}

const DraftingLab = dynamic(() => import("../../../legacy_ignore/pages/DraftingLab"), {
    ssr: false,
    loading: () => (
        <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-indigo-300 font-bold uppercase tracking-widest text-xs">Opening Drafting Lab...</p>
            </div>
        </div>
    )
});

export default function DraftingPage() {
    return <DraftingLab />;
}
