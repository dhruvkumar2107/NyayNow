import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../context/AuthContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })

export const metadata = {
    metadataBase: new URL('https://nyaynow.in'),
    icons: {
        icon: '/logo.png',
        apple: '/logo.png',
    },
    title: {
        default: 'NyayNow | AI Legal Intelligence & Lawyer Marketplace',
        template: '%s | NyayNow'
    },
    description: 'NyayNow: AI-Powered Legal Assistant & Lawyer Marketplace for India. Get instant legal information, draft documents, and connect with expert lawyers.',
    keywords: ['legal assistant', 'AI lawyer', 'Indian law', 'legal information', 'lawyer marketplace', 'legal document drafting', 'NyayNow', 'online legal help India', 'IPC sections', 'Supreme Court judgments', 'free legal advice', 'vakeel online', 'kanoon AI', 'legal chatbot India', 'hire lawyer online'],
    authors: [{ name: 'NyayNow Team' }],
    creator: 'NyayNow',
    publisher: 'NyayNow',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        title: 'NyayNow | AI Legal Intelligence & Lawyer Marketplace',
        description: 'NyayNow: AI-Powered Legal Assistant & Lawyer Marketplace for India. Get instant legal information and connect with expert lawyers.',
        url: 'https://nyaynow.in',
        siteName: 'NyayNow',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'NyayNow — AI Legal Intelligence & Lawyer Marketplace for India',
            },
        ],
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'NyayNow | AI Legal Intelligence',
        description: 'NyayNow: AI-Powered Legal Assistant & Lawyer Marketplace for India.',
        images: ['/og-image.png'],
        creator: '@nyaynow',
    },
    robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
}


import Providers from '../components/Providers'
import AIAssistant from '../components/AIAssistant'
import Navbar from '../components/Navbar'
import EliteCursor from '../components/EliteCursor'
import ScrollProgress from '../components/ScrollProgress'
import CookieConsent from '../components/CookieConsent'
import Footer from '../components/Footer'
import OfflineNotice from '../components/OfflineNotice'

export default function RootLayout({ children }) {
    const schemaMarkup = {
        "@context": "https://schema.org",
        "@type": "LegalService",
        "name": "NyayNow",
        "image": "https://nyaynow.in/logo.png",
        "url": "https://nyaynow.in",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "New Delhi",
            "addressRegion": "Delhi",
            "postalCode": "110001",
            "addressCountry": "IN"
        },
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ],
            "opens": "00:00",
            "closes": "23:59"
        },
        "sameAs": [
            "https://twitter.com/nyaynow",
            "https://www.linkedin.com/company/nyaynow"
        ]
    };

    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
                />
            </head>
            <body className={`${inter.variable} ${jakarta.variable} font-sans relative`}>
                <div className="noise-overlay" />
                <Providers>
                    <EliteCursor />
                    <ScrollProgress />
                    <Navbar />
                    {children}
                    <Footer />
                    <Toaster position="bottom-right" />
                    <AIAssistant />
                    <CookieConsent />
                    <OfflineNotice />
                </Providers>
            </body>
        </html>
    )
}
