export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/client/',
                '/lawyer/dashboard/',
                '/meet/',
                '/messages/',
                '/settings/',
                '/calendar/',
                '/analytics/',
                '/payment/',
                '/setup-profile/',
                '/digilocker-verify/',
                '/verification-pending/',
            ],
        },
        sitemap: 'https://nyaynow.in/sitemap.xml',
        host: 'https://nyaynow.in',
    }
}
