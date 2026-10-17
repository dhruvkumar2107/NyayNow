import NyayCourtSimulatorClient from './NyayCourtSimulatorClient';

export const metadata = {
    title: 'Courtroom practice simulation — in development | NyayNow',
    description: 'The courtroom simulation is disabled while source verification and scoring evaluation remain in development.',
    alternates: {
        canonical: 'https://nyaynow.in/nyaycourt-simulator',
    },
    openGraph: {
        title: 'Courtroom practice simulation — in development | NyayNow',
        description: 'The courtroom simulation is disabled while source verification and scoring evaluation remain in development.',
        url: 'https://nyaynow.in/nyaycourt-simulator',
    }
}

export default function NyayCourtSimulatorPage() {
    return <NyayCourtSimulatorClient />;
}
