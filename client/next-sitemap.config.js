/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://nyaynow.in',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/admin*', '/dashboard*', '/messages*', '/settings*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/messages', '/settings'],
      },
    ],
  },
}

export default config
