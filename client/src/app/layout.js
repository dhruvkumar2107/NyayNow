import { headers } from 'next/headers'
import './globals.css'
import { AuthProvider } from '../context/AuthContext'
import { Toaster } from 'react-hot-toast'

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
    description: 'NyayNow provides AI-assisted legal information, document workflows, and a lawyer marketplace for India. Verify AI-generated citations and consult a qualified advocate before acting.',
    keywords: ['legal assistant', 'legal technology India', 'BNS', 'Indian legal information', 'find lawyer online', 'legal document drafting', 'NyayNow', 'online legal help India', 'legal research', 'legal chatbot India'],
    authors: [{ name: 'NyayNow Team' }],
    creator: 'NyayNow',
    publisher: 'NyayNow',
    formatDetection: {
        email: false,
        address: false,
        telephone: true,
    },
    manifest: '/manifest.json',
    alternates: {
        canonical: 'https://nyaynow.in',
        languages: {
            'en-IN': 'https://nyaynow.in',
        },
    },
    openGraph: {
        title: 'NyayNow | AI Legal Intelligence & Lawyer Marketplace',
        description: 'AI-assisted legal information, document workflows, and a lawyer marketplace for India.',
        url: 'https://nyaynow.in',
        siteName: 'NyayNow',
        // opengraph-image.jsx in this directory auto-generates the OG image
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'NyayNow | AI Legal Intelligence',
        description: 'NyayNow: AI-Powered Legal Assistant & Lawyer Marketplace for India.',
        creator: '@nyaynow',
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
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
import GoogleAnalytics from '../components/GoogleAnalytics'
import ServiceWorkerRegistrar from '../components/ServiceWorkerRegistrar'
import ScrollToTop from '../components/ScrollToTop'

export default async function RootLayout({ children }) {
    const nonce = (await headers()).get('x-nonce') ?? ''

    const schemaMarkup = [
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "NyayNow",
            "description": "AI-assisted legal information, document workflows, and a lawyer marketplace for India.",
            "keywords": "legal information India, Indian law, lawyer marketplace, AI legal assistant, document drafting",
            "image": "https://nyaynow.in/logo.png",
            "url": "https://nyaynow.in",
            "speakable": {
                "@type": "SpeakableSpecification",
                "cssSelector": ["h1", "h2", ".speakable"]
            },
            "sameAs": [
                "https://twitter.com/nyaynow",
                "https://www.linkedin.com/company/nyaynow",
                "https://www.instagram.com/nyaynow.in/"
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "NyayNow",
            "url": "https://nyaynow.in",
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://nyaynow.in/marketplace?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://nyaynow.in" },
                { "@type": "ListItem", "position": 2, "name": "AI Legal Assistant", "item": "https://nyaynow.in/assistant" },
                { "@type": "ListItem", "position": 3, "name": "Lawyer Marketplace", "item": "https://nyaynow.in/marketplace" },
                { "@type": "ListItem", "position": 4, "name": "BNS 2024", "item": "https://nyaynow.in/bns" },
                { "@type": "ListItem", "position": 5, "name": "Legal SOS", "item": "https://nyaynow.in/legal-sos" }
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "What is NyayNow?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "NyayNow provides AI-assisted legal information, document workflows, and a lawyer marketplace for India."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Does NyayNow provide formal legal advice?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "No. NyayNow provides legal information and educational tools. Use of the AI tools does not create an attorney-client relationship, and users are encouraged to consult registered advocates for official legal advice."
                    }
                },
                {
                    "@type": "Question",
                    "name": "How does the Lawyer Marketplace work?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "The Lawyer Marketplace lets users browse lawyer profiles and review the details and verification status shown on each profile."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What is BNS 2024 and how does NyayNow use it?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "NyayNow offers AI-assisted legal information. Generated answers can be inaccurate or incomplete; users should verify citations against primary sources and consult a qualified advocate."
                    }
                },
                {
                    "@type": "Question",
                        "name": "How should I use AI-generated legal information?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Treat AI responses as an informational starting point. Verify the source material and ask a qualified advocate before making legal decisions."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What is the Legal SOS feature?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "For immediate danger, contact local emergency services. NyayNow's legal information tools do not replace emergency responders or an advocate."
                    }
                }
            ]
        }
    ];

    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://res.cloudinary.com" />
                <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
                <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
                <script
                    nonce={nonce}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026') }}
                />
            </head>
            <body className="font-sans relative">
                {/* Skip to main content — critical for ARIA / screen reader accessibility */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-bold focus:text-sm"
                >
                    Skip to main content
                </a>

                <GoogleAnalytics nonce={nonce} />
                <div className="noise-overlay" />
                <Providers>
                    <ScrollToTop />
                    <EliteCursor />
                    <ScrollProgress />
                    {/* role="banner" marks the site-wide header/nav region */}
                    <header role="banner">
                        <Navbar />
                    </header>
                    <div id="main-content" tabIndex={-1} className="outline-none">
                        {children}
                    </div>
                    {/* role="contentinfo" marks the site-wide footer region */}
                    <footer role="contentinfo">
                        <Footer />
                    </footer>
                    <Toaster
                        position="top-right"
                        containerStyle={{ top: "5.5rem", right: "1rem" }}
                    />
                    <AIAssistant />
                    <CookieConsent />
                    <OfflineNotice />
                    <ServiceWorkerRegistrar />
                </Providers>
            </body>
        </html>
    )
}
