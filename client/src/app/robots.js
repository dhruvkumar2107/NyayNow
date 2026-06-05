export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/client/dashboard/', '/lawyer/dashboard/', '/meet/', '/messages/', '/settings/'],
        },
        sitemap: 'https://nyaynow.in/sitemap.xml',
    }
}
