import NearbyClient from './NearbyClient';

export const metadata = {
    title: 'Nearby Legal Assets Radar',
    description: 'Locate nearby police stations, judicial courts, and legal advocates in real-time. Navigate local legal support across India.',
    alternates: {
        canonical: 'https://nyaynow.in/nearby',
    },
    openGraph: {
        title: 'Nearby Legal Assets Radar | NyayNow',
        description: 'Locate nearby police stations, judicial courts, and legal advocates in real-time.',
        url: 'https://nyaynow.in/nearby',
    }
}

export default function NearbyPage() {
    return <NearbyClient />;
}
