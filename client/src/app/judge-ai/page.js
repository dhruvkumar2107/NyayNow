import JudgeAIClient from './JudgeAIClient';
import InDevelopmentNotice from '../../components/InDevelopmentNotice';

export const metadata = {
    title: 'Case analysis research — in development | NyayNow',
    description: 'Case outcome prediction is disabled while evaluation and calibration research is in development.',
    alternates: {
        canonical: 'https://nyaynow.in/judge-ai',
    },
    openGraph: {
        title: 'Case analysis research — in development | NyayNow',
        description: 'Outcome prediction is disabled pending evaluation and calibration research.',
        url: 'https://nyaynow.in/judge-ai',
    }
}

const ENABLED = process.env.NEXT_PUBLIC_EXPERIMENTAL_CASE_ANALYSIS_ENABLED === 'true';

export default function JudgeAIPage() {
    if (!ENABLED) {
        return (
            <InDevelopmentNotice eyebrow="In development" title="Outcome prediction is disabled">
                We have not validated or calibrated court outcome predictions. This feature will
                remain unavailable until prospective legal review and evaluation are complete.
            </InDevelopmentNotice>
        );
    }
    return <JudgeAIClient />;
}
