async function getLawyers() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    // Skip fetching during build if on localhost (backend won't be there)
    if (typeof window === 'undefined' && apiUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
        return []
    }
    try {
        const res = await fetch(`${apiUrl}/api/lawyers?all=true`, { cache: 'no-store' })
        if (!res.ok) return []
        return res.json()
    } catch (error) {
        // Only log error if not in a known build-time failure scenario
        if (!apiUrl.includes('localhost')) {
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
