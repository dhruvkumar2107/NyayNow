import Pricing from "../../../legacy_ignore/pages/Pricing";

export const metadata = {
    title: 'Pricing Plans & Subscriptions',
    description: 'Explore NyayNow subscription plans: Free, Pro, and Firm. Get access to AI legal assistance, document drafting, and lawyer marketplace integrations.',
    alternates: {
        canonical: 'https://nyaynow.in/pricing',
    },
    openGraph: {
        title: 'Pricing Plans & Subscriptions | NyayNow',
        description: 'Explore NyayNow subscription plans: Free, Pro, and Firm.',
        url: 'https://nyaynow.in/pricing',
    }
}

export default function PricingPage() {
    return <Pricing />;
}
