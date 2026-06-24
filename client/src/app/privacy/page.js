import PrivacyPolicy from "../../components/PrivacyPolicy";

export const metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy and data protection terms for NyayNow. Learn how we secure your case files and user data in compliance with the DPDP Act 2023.',
    alternates: {
        canonical: 'https://nyaynow.in/privacy',
    },
    openGraph: {
        title: 'Privacy Policy | NyayNow',
        description: 'Privacy Policy and data protection terms for NyayNow.',
        url: 'https://nyaynow.in/privacy',
    }
}

export default function PrivacyPage() {
    return <PrivacyPolicy />;
}
