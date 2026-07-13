import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { headers } from 'next/headers'
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
    description: 'NyayNow: India\'s AI-powered legal assistant & lawyer marketplace. Free BNS 2024 & IPC answers, contract drafting, eCourts case tracking, and Bar Council verified advocate directory — in 14 Indian languages.',
    keywords: ['legal assistant', 'AI lawyer India', 'BNS 2024', 'IPC sections', 'free legal advice', 'find lawyer online', 'eCourts case tracker', 'legal document drafting', 'NyayNow', 'online legal help India', 'supreme court judgments', 'bar council verified', 'legal sos', 'court data India', 'vakeel online', 'kanoon AI', 'legal chatbot India', 'hire lawyer online'],
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
        description: 'NyayNow: AI-Powered Legal Assistant & Lawyer Marketplace for India. Free BNS 2024 answers, Bar Council verified lawyers, Legal SOS, and Supreme Court data.',
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
import WhatsAppWidget from '../components/WhatsAppWidget'
import Footer from '../components/Footer'
import OfflineNotice from '../components/OfflineNotice'
import GoogleAnalytics from '../components/GoogleAnalytics'
import ServiceWorkerRegistrar from '../components/ServiceWorkerRegistrar'
import ScrollToTop from '../components/ScrollToTop'

export default function RootLayout({ children }) {
    const nonce = headers().get('x-nonce') ?? ''

    const schemaMarkup = [
        {
            "@context": "https://schema.org",
            "@type": "LegalService",
            "name": "NyayNow",
            "description": "AI-Powered Legal Assistant & Lawyer Marketplace for India. Get instant legal information on BNS 2024 & IPC sections, draft documents, and connect with Bar Council verified expert lawyers.",
            "keywords": "legal advice India, BNS 2024, IPC sections, bar council verified lawyers, supreme court data, legal sos, court case tracker, AI legal assistant",
            "image": "https://nyaynow.in/logo.png",
            "url": "https://nyaynow.in",
            "priceRange": "₹0 - ₹999",
            "areaServed": {
                "@type": "Country",
                "name": "India"
            },
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
            "speakable": {
                "@type": "SpeakableSpecification",
                "cssSelector": ["h1", "h2", ".speakable"]
            },
            "sameAs": [
                "https://twitter.com/nyaynow",
                "https://www.linkedin.com/company/nyaynow"
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
                        "text": "NyayNow is an AI-powered legal intelligence platform and Bar Council verified lawyer marketplace in India, providing instant legal information on BNS 2024 & IPC sections, autonomous document drafting, and direct connections to expert advocates."
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
                        "text": "The Lawyer Marketplace allows users to find, filter, and connect with verified legal professionals across various specializations and jurisdictions in India based on Bar Council of India (BCI) compliant directory listings."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What is BNS 2024 and how does NyayNow use it?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "The Bharatiya Nyaya Sanhita (BNS) 2024 replaced the Indian Penal Code (IPC) as India's primary criminal law. NyayNow's AI assistant is grounded strictly in BNS 2024 sections, High Court, and Supreme Court precedents to provide accurate, up-to-date legal information."
                    }
                },
                {
                    "@type": "Question",
                    "name": "How does NyayNow verify lawyers with the Bar Council?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Every advocate on NyayNow is verified through DigiLocker KYC and Bar Council of India (BCI) database matching. This ensures that only licensed, registered legal professionals appear on the platform."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What is the Legal SOS feature?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Legal SOS is NyayNow's emergency legal response system. It instantly classifies a legal crisis, provides rights analysis in 14+ Indian languages (including Hindi and Tamil), auto-drafts a BNS 2024 compliant FIR, and connects users to a nearby verified advocate — all in under 60 seconds."
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
            <body className={`${inter.variable} ${jakarta.variable} font-sans relative`}>
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
                    {children}
                    {/* role="contentinfo" marks the site-wide footer region */}
                    <footer role="contentinfo">
                        <Footer />
                    </footer>
                    <Toaster position="bottom-right" />
                    <AIAssistant />
                    <CookieConsent />
                    <WhatsAppWidget />
                    <OfflineNotice />
                    <ServiceWorkerRegistrar />
                </Providers>
            </body>
        </html>
    )
}
