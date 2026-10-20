export const metadata = {
    title: 'Legal SOS | India\'s First Emergency Legal AI - NyayNow',
    description: 'Find legal information and available help through NyayNow. For immediate danger, contact local emergency services directly.',
    openGraph: {
        title: 'Legal SOS | Emergency Legal AI Assistant',
        description: 'Use an AI-assisted legal information workflow and prepare a lawyer-reviewable complaint draft. For immediate danger call 112.',
        url: 'https://nyaynow.in/legal-sos',
        type: 'website',
        images: ['/logo.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Legal SOS | Emergency Legal AI',
        description: 'Legal information tool, not emergency dispatch or a filed complaint. For immediate danger call 112; NALSA legal-aid helpline 15100.',
        images: ['/logo.png'],
    }
}

export default function LegalSOSLayout({ children }) {
    return <>{children}</>
}
