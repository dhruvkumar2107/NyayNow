import NyayCourtSimulatorClient from './NyayCourtSimulatorClient';
import InDevelopmentNotice from '../../components/InDevelopmentNotice';

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

const ENABLED = process.env.NEXT_PUBLIC_EXPERIMENTAL_COURTROOM_SIMULATION_ENABLED === 'true';

export default function NyayCourtSimulatorPage() {
    if (!ENABLED) {
        return (
            <InDevelopmentNotice
                eyebrow="Experimental simulation in development"
                title="Courtroom practice is not available yet"
            >
                The current simulation does not have a validated legal-source layer or reviewed
                scoring method. It cannot determine case outcomes or issue rulings. Do not submit
                confidential case information.
            </InDevelopmentNotice>
        );
    }
    return <NyayCourtSimulatorClient />;
}
