import Agreements from "../../../legacy_ignore/pages/Agreements";

export const metadata = {
    title: 'Agreement Review & Document Workspace | NyayNow',
    description: 'Review agreement text or PDFs with AI and save account-linked review records. This is not an encrypted evidence vault or forensic authentication service.',
    alternates: {
        canonical: 'https://nyaynow.in/agreements',
    },
    openGraph: {
        title: 'Agreement Review & Document Workspace | NyayNow',
        description: 'Review agreement text or PDFs with AI and save account-linked review records. This is not an encrypted evidence vault or forensic authentication service.',
        url: 'https://nyaynow.in/agreements',
    }
};

export default function AgreementsPage() {
    return <Agreements />;
}

