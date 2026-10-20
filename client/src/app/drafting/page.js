export const metadata = {
    title: 'AI-Assisted Legal Document Drafts | NyayNow',
    description: 'Create editable AI-assisted document drafts. Coverage, language quality, and legal requirements vary; have an advocate verify before use.',
    keywords: 'legal document drafting India, rental agreement draft, NDA India, FIR draft, legal notice format, employment contract India, will draft India, sale deed format, leave and license agreement, AI contract drafting',
    alternates: {
        canonical: 'https://nyaynow.in/drafting',
    },
    openGraph: {
        title: 'AI-Assisted Legal Document Drafts | NyayNow',
        description: 'Create editable legal document drafts for human review. Verify facts and applicable law before use.',
        url: 'https://nyaynow.in/drafting',
        images: [{ url: 'https://nyaynow.in/logo.png', width: 512, height: 512 }]
    }
}

export default function DraftingPage() {
    return <DraftingLabClient />;
}
import DraftingLabClient from './DraftingLabClient';

