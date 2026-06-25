'use client'
import Script from 'next/script'
import { useState, useEffect } from 'react'

export default function GoogleAnalytics({ gaId }) {
    const [hasConsent, setHasConsent] = useState(false)

    useEffect(() => {
        if (localStorage.getItem('cookie-consent') === 'accepted') {
            setHasConsent(true)
        }
        const onConsent = () => setHasConsent(true)
        window.addEventListener('cookieConsentAccepted', onConsent)
        return () => window.removeEventListener('cookieConsentAccepted', onConsent)
    }, [])

    if (!gaId || !hasConsent) return null

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{page_path:window.location.pathname});`}
            </Script>
        </>
    )
}
