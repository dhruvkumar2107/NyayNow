import Disclaimer from "../../components/Disclaimer";

export const metadata = {
    title: 'Legal Disclaimer',
    description: 'Legal Disclaimer for NyayNow AI. Understand that AI outputs are for informational purposes only and do not constitute formal legal advice.',
    alternates: {
        canonical: 'https://nyaynow.in/disclaimer',
    },
    openGraph: {
        title: 'Legal Disclaimer | NyayNow',
        description: 'Legal Disclaimer for NyayNow AI.',
        url: 'https://nyaynow.in/disclaimer',
    }
}

export default function DisclaimerPage() {
    return <Disclaimer />;
}
