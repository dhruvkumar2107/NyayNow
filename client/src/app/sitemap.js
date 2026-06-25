import { API_BASE } from "../config"

async function getLawyers() {
    // Skip fetching during build if on localhost (backend won't be there)
    if (typeof window === 'undefined' && API_BASE.includes('localhost')) {
        return []
    }
    try {
        const res = await fetch(`${API_BASE}/lawyers?all=true`, { cache: 'no-store' })
        if (!res.ok) return []
        return await res.json()
    } catch (error) {
        // Only log error if not in a known build-time failure scenario
        if (!API_BASE.includes('localhost')) {
            console.error("Error fetching lawyers for sitemap:", error)
        }
        return []
    }
}


export default async function sitemap() {
    const baseUrl = 'https://nyaynow.in'
    const lawyersResult = await getLawyers()
    const lawyers = Array.isArray(lawyersResult) ? lawyersResult : (Array.isArray(lawyersResult?.lawyers) ? lawyersResult.lawyers : [])

    const lawyerUrls = lawyers.map((lawyer) => ({
        url: `${baseUrl}/lawyer/${lawyer._id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }))

    const staticRoutes = [
        { path: "",                        freq: 'daily',   priority: 1.0 },
        { path: "/marketplace",            freq: 'daily',   priority: 0.9 },
        { path: "/legal-sos",              freq: 'weekly',  priority: 0.8 },
        { path: "/assistant",              freq: 'weekly',  priority: 0.8 },
        { path: "/professionals",          freq: 'weekly',  priority: 0.8 },
        { path: "/judge-ai",               freq: 'weekly',  priority: 0.8 },
        { path: "/blog",                   freq: 'daily',   priority: 0.8 },
        { path: "/research",               freq: 'weekly',  priority: 0.7 },
        { path: "/drafting",               freq: 'weekly',  priority: 0.7 },
        { path: "/courtroom-battle",       freq: 'weekly',  priority: 0.7 },
        { path: "/nyaycourt-simulator",    freq: 'weekly',  priority: 0.7 },
        { path: "/nyayvoice",              freq: 'weekly',  priority: 0.7 },
        { path: "/judge-pro",              freq: 'weekly',  priority: 0.7 },
        { path: "/moot-court",             freq: 'weekly',  priority: 0.7 },
        { path: "/ecourts",               freq: 'weekly',  priority: 0.7 },
        { path: "/case-studies",           freq: 'monthly', priority: 0.6 },
        { path: "/about",                  freq: 'monthly', priority: 0.6 },
        { path: "/pricing",                freq: 'monthly', priority: 0.6 },
        { path: "/contact",                freq: 'monthly', priority: 0.6 },
        { path: "/career",                 freq: 'monthly', priority: 0.6 },
        { path: "/help",                   freq: 'monthly', priority: 0.6 },
        { path: "/rent-agreement",         freq: 'monthly', priority: 0.6 },
        { path: "/compliances",            freq: 'monthly', priority: 0.6 },
        { path: "/security-and-compliance",freq: 'monthly', priority: 0.5 },
        { path: "/methodology",            freq: 'monthly', priority: 0.5 },
        { path: "/dpdp",                   freq: 'monthly', priority: 0.5 },
        { path: "/privacy",                freq: 'monthly', priority: 0.5 },
        { path: "/terms",                  freq: 'monthly', priority: 0.5 },
        { path: "/disclaimer",             freq: 'monthly', priority: 0.5 },
        { path: "/refund",                 freq: 'monthly', priority: 0.5 },
    ]

    const staticUrls = staticRoutes.map(({ path, freq, priority }) => ({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: freq,
        priority,
    }))

    return [...staticUrls, ...lawyerUrls]
}
