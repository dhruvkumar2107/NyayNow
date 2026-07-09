import dynamic from 'next/dynamic';

export const metadata = {
    title: 'AI Legal Document Drafting — 50+ Indian Law Agreements | NyayNow',
    description: 'Draft any Indian legal document instantly: rental agreements, NDAs, sale deeds, wills, FIRs, legal notices, employment contracts, POA and more — AI-powered, jurisdiction-aware, in English & Hindi.',
    keywords: 'legal document drafting India, rental agreement draft, NDA India, FIR draft, legal notice format, employment contract India, will draft India, sale deed format, leave and license agreement, AI contract drafting',
    alternates: {
        canonical: 'https://nyaynow.in/drafting',
    },
    openGraph: {
        title: 'AI Legal Document Drafting — 50+ Indian Documents | NyayNow',
        description: 'Draft rental agreements, NDAs, wills, FIRs, legal notices and 50+ Indian legal documents in minutes. Jurisdiction-aware AI in English & Hindi.',
        url: 'https://nyaynow.in/drafting',
        images: [{ url: 'https://nyaynow.in/logo.png', width: 512, height: 512 }]
    }
}

const DraftingLab = dynamic(() => import("../../../legacy_ignore/pages/DraftingLab"), {
    ssr: false,
    loading: () => (
        <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="text-center">
                    <p className="text-white font-bold text-sm">Loading Drafting Lab</p>
                    <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mt-1">50+ Indian Legal Documents</p>
                </div>
            </div>
        </div>
    )
});

export default function DraftingPage() {
    return <DraftingLab />;
}
