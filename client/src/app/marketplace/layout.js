export const metadata = {
    title: 'Lawyer Directory | Find Verified Advocates - NyayNow',
    description: 'Browse and connect with verified lawyers across India on NyayNow. Filter by specialization, location, and experience to find the right advocate for your case.',
    openGraph: {
        title: 'NyayNow Lawyer Directory',
        description: 'Connect with verified advocates across India. Browse listings by specialization, experience, and court jurisdiction.',
        url: 'https://nyaynow.com/marketplace',
        type: 'website',
        images: ['/logo.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'NyayNow Lawyer Marketplace',
        description: 'Find verified legal experts across India.',
        images: ['/logo.png'],
    }
}

export default function MarketplaceLayout({ children }) {
    return <>{children}</>
}
