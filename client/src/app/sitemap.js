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

    const routes = [
        "",
        "/marketplace",
        "/legal-sos",
        "/about",
        "/contact",
        "/pricing",
        "/privacy",
        "/terms",
        "/disclaimer",
        "/refund",
        "/assistant",
        "/drafting",
        "/judge-ai",
        "/research",
        "/ecourts"
    ]

    const staticUrls = routes.map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" || route === "/marketplace" ? 'daily' : 'monthly',
        priority: route === "" ? 1.0 : route === "/marketplace" ? 0.9 : 0.7,
    }))

    return [...staticUrls, ...lawyerUrls]
}
