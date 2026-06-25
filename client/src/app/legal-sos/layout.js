export const metadata = {
    title: 'Legal SOS | India\'s First Emergency Legal AI - NyayNow',
    description: 'Get instant legal rights, Article 22 protections, and an AI-drafted FIR in under 60 seconds. Free emergency legal assistance for every Indian citizen.',
    openGraph: {
        title: 'Legal SOS | Emergency Legal AI Assistant',
        description: 'Arrested? Facing fraud? Activate Legal SOS for instant legal rights and FIR drafting.',
        url: 'https://nyaynow.in/legal-sos',
        type: 'website',
        images: ['/logo.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Legal SOS | Emergency Legal AI',
        description: 'Instant legal help for Indians in crisis. Free and confidential.',
        images: ['/logo.png'],
    }
}

export default function LegalSOSLayout({ children }) {
    return <>{children}</>
}
