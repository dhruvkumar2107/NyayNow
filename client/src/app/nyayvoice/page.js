import NyayVoiceClient from './NyayVoiceClient';

export const metadata = {
    title: 'NyayVoice — Multilingual AI Legal Voice Assistant',
    description: 'Use voice input for AI-assisted legal information. Language availability and transcription quality vary; verify before relying.',
    alternates: {
        canonical: 'https://nyaynow.in/nyayvoice',
    },
    openGraph: {
        title: 'NyayVoice — Multilingual AI Legal Voice Assistant | NyayNow',
        description: 'Use voice input for AI-assisted legal information. Language availability and transcription quality vary; verify before relying.',
        url: 'https://nyaynow.in/nyayvoice',
    }
}

export default function NyayVoicePage() {
    return <NyayVoiceClient />;
}
