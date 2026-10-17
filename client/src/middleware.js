import { NextResponse } from 'next/server'

export function middleware(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'unsafe-eval'",
    "https://checkout.razorpay.com",
    "https://cdn.razorpay.com",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://accounts.google.com/gsi/client",
    "https://translate.google.com",
    "https://translate.googleapis.com",
    "https://*.googleapis.com",
    "https://*.google.com"
  ].join(' ')

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://translate.googleapis.com https://*.googleapis.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://ui-avatars.com https://randomuser.me https://unpkg.com https://www.google-analytics.com https://*.basemaps.cartocdn.com https://basemaps.cartocdn.com https://translate.google.com https://translate.googleapis.com https://www.google.com https://images.unsplash.com https://www.transparenttextures.com https://fonts.gstatic.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.sentry.io https://*.posthog.com https://*.algolia.net https://*.algolianet.com https://api.razorpay.com https://lumberjack.razorpay.com https://www.google-analytics.com wss://nyaynow.in wss://*.nyaynow.in https://nyaynow.in https://www.nyaynow.in https://accounts.google.com/gsi/ https://nyaysathi-main.onrender.com https://translate.googleapis.com https://*.googleapis.com",
    "frame-src https://checkout.razorpay.com https://api.razorpay.com https://accounts.google.com/gsi/ https://*.google.com https://*.googleapis.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.ico$|.*\\.svg$|.*\\.webp$|.*\\.avif$|sw\\.js$|manifest\\.json$).*)',
  ],
}
