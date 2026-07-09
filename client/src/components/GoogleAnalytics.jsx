'use client'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

// Measurement ID — hardcoded fallback if env var is missing
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-QSF042FJXP'

// Helper: push a pageview event to GA4
function sendPageview(url) {
    if (typeof window === 'undefined' || !window.gtag) return
    window.gtag('config', GA_ID, { page_path: url })
}

export default function GoogleAnalytics({ nonce }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Fire a pageview on every client-side route change (SPA navigation)
    useEffect(() => {
        if (!pathname) return
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
        sendPageview(url)
    }, [pathname, searchParams])

    if (!GA_ID) return null

    return (
        <>
            {/* Async load the gtag.js library — nonce required for CSP */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
                nonce={nonce}
            />

            {/* Initialize dataLayer and fire first pageview — nonce whitelists this inline script */}
            <Script
                id="google-analytics-init"
                strategy="afterInteractive"
                nonce={nonce}
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GA_ID}', {
                            page_path: window.location.pathname,
                            send_page_view: true
                        });
                    `
                }}
            />
        </>
    )
}
