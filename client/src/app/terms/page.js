import TermsOfService from "../../components/TermsOfService";

export const metadata = {
    title: 'Terms of Service',
    description: 'Terms of Service for NyayNow. Understand our platform usage, limitation of liability, and attorney-client relationship disclaimer.',
    alternates: {
        canonical: 'https://nyaynow.in/terms',
    },
}

export default function TermsPage() {
    return <TermsOfService />;
}
