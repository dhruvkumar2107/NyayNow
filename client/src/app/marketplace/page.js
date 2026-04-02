import React from "react"
import Image from "next/image"
import MarketplaceClient from "../../components/marketplace/MarketplaceClient"

async function getLawyers() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

    // Safety check for build-time fetches to localhost
    if (typeof window === 'undefined' && apiUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
        return []
    }

    try {
        const res = await fetch(`${apiUrl}/api/users?role=lawyer`, { next: { revalidate: 3600 } })
        if (!res.ok) return []
        return res.json()
    } catch (error) {
        if (!apiUrl.includes('localhost')) {
            console.error("Failed to fetch lawyers for SSR", error)
        }
        return []
    }
}

export default async function MarketplacePage() {
    const lawyers = await getLawyers()

    return (
        <div className="min-h-screen bg-[#020617] font-sans text-slate-400 pb-20 selection:bg-indigo-500/30">

            {/* HEADER */}
            <div className="bg-[#0f172a] text-white pt-32 pb-24 relative overflow-hidden text-center border-b border-white/5">
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none">
                    <Image src="/noise.svg" alt="" fill className="object-cover" />
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">The Elite Legal Network</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                        Connect with India's top 1% of legal minds. Verified, vetted, and ready to represent you.
                    </p>
                </div>
            </div>

            {/* CLIENT CONTENT */}
            <MarketplaceClient initialLawyers={lawyers} />

        </div>
    )
}
