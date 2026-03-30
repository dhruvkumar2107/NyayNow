import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../context/AuthContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })

export const metadata = {
    metadataBase: new URL('https://nyaynow.in'),
    title: {
        default: 'NyayNow | AI Legal Intelligence & Lawyer Marketplace',
        template: '%s | NyayNow'
    },
    description: 'NyayNow: AI-Powered Legal Assistant & Lawyer Marketplace for India. Get instant legal advice, draft documents, and connect with expert lawyers.',
    keywords: ['legal assistant', 'AI lawyer', 'Indian law', 'legal advice', 'lawyer marketplace', 'legal document drafting'],
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
        description: 'NyayNow: AI-Powered Legal Assistant & Lawyer Marketplace for India. Get instant legal advice and connect with expert lawyers.',
        url: 'https://nyaynow.in',
        siteName: 'NyayNow',
        images: [
            {
                url: '/logo.png',
                width: 1200,
                height: 630,
                alt: 'NyayNow Legal AI',
            },
        ],
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'NyayNow | AI Legal Intelligence',
        description: 'NyayNow: AI-Powered Legal Assistant & Lawyer Marketplace for India.',
        images: ['/logo.png'],
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

export default function RootLayout({ children }) {
    return (
        <html lang="en">
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
                </Providers>
            </body>
        </html>
    )
}
