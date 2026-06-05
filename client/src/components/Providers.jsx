'use client'

import React, { useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import posthog from 'posthog-js'
import * as Sentry from '@sentry/react'
import { AuthProvider } from '../context/AuthContext'
import { LanguageProvider } from '../context/LanguageContext'

export default function Providers({ children }) {
    useEffect(() => {
        // Sentry Initialization
        const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
        if (SENTRY_DSN) {
            Sentry.init({
                dsn: SENTRY_DSN,
                integrations: [
                    Sentry.browserTracingIntegration(),
                    Sentry.replayIntegration(),
                ],
                tracesSampleRate: 1.0,
                replaysSessionSampleRate: 0.1,
                replaysOnErrorSampleRate: 1.0,
            })
        }

        // PostHog Initialization
        const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
        if (POSTHOG_KEY && POSTHOG_KEY.startsWith('phc_')) {
            posthog.init(POSTHOG_KEY, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
                loaded: (ph) => {
                    if (process.env.NODE_ENV === 'development') ph.opt_out_capturing()
                },
            })
        }
    }, [])

    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
            <AuthProvider>
                <LanguageProvider>
                    {children}
                </LanguageProvider>
            </AuthProvider>
        </GoogleOAuthProvider>
    )
}
