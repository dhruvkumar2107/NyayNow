/** @type {import('next').NextConfig} */

// CSP is set dynamically per-request in src/middleware.js (nonce-based).
// Only non-CSP security headers are set here.

const nextConfig = {
    reactStrictMode: true,
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'checkout.razorpay.com',
            },
            {
                protocol: 'https',
                hostname: '*.posthog.com',
            }
        ],
    },
    async redirects() {
        return [
            {
                source: '/courtroom-battle',
                destination: '/nyaycourt-simulator',
                permanent: true,
            },
            {
                source: '/voice-assistant',
                destination: '/nyayvoice',
                permanent: true,
            },
        ]
    },
    async rewrites() {
        let backendUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.VERCEL === '1'
            ? 'https://nyaysathi-main.onrender.com/api'
            : 'http://localhost:4000/api');

        // Ensure backendUrl has /api suffix
        if (backendUrl.endsWith('/api/')) {
            backendUrl = backendUrl.slice(0, -1);
        } else if (!backendUrl.endsWith('/api')) {
            backendUrl = `${backendUrl}/api`;
        }

        // Get the base backend host for /healthz (without /api)
        const backendBaseHost = backendUrl.replace(/\/api$/, '');

        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/:path*`,
            },
            {
                source: '/healthz',
                destination: `${backendBaseHost}/healthz`,
            },
        ]
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(self), microphone=(self), geolocation=(self)',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains; preload',
                    },
                ],
            },
        ]
    },
}

export default nextConfig
