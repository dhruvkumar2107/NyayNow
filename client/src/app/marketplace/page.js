import React from "react"
import Image from "next/image"
import MarketplaceClient from "../../components/marketplace/MarketplaceClient"
import { API_BASE } from "../../config"

export const metadata = {
    title: 'Find Verified Lawyers in India | NyayNow Marketplace',
    description: 'Browse and connect with verified lawyers across India. Filter by specialization, city, and experience. Book consultations online.',
    alternates: { canonical: 'https://nyaynow.in/marketplace' },
    openGraph: {
        title: 'Find Verified Lawyers in India | NyayNow',
        description: 'Browse and connect with verified lawyers across India.',
        url: 'https://nyaynow.in/marketplace',
    },
}

async function getLawyers() {
    // Safety check for build-time fetches to localhost
    if (typeof window === 'undefined' && API_BASE.includes('localhost')) {
        return []
    }

    try {
        const res = await fetch(`${API_BASE}/lawyers?all=true`, { next: { revalidate: 3600 } })
        if (!res.ok) return []
        return await res.json()
    } catch (error) {
        if (!API_BASE.includes('localhost')) {
            console.error("Failed to fetch lawyers for SSR", error)
        }
        return []
    }
}


export default async function MarketplacePage() {
    const lawyers = await getLawyers()

    return (
        <div className="min-h-screen bg-[#000000] font-sans text-slate-400 pb-20 selection:bg-indigo-500/30 relative">
            {/* BACKGROUND EFFECTS */}
            <div className="absolute inset-0 pointer-events-none mesh-gradient" />
            <div className="absolute inset-0 pointer-events-none pattern-grid-fine opacity-20" />
            <div className="absolute inset-0 pointer-events-none pattern-noise" />

            {/* HEADER */}
            <div className="relative z-10 bg-glass-strong text-white pt-32 pb-24 overflow-hidden text-center border-b border-white/5">
                <div className="container mx-auto px-6 relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gradient-premium"
                    >
                        The Elite Legal Network
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl text-slate-400 max-w-2xl mx-auto mb-10"
                    >
                        Connect with India's top 1% of legal minds. Verified, vetted, and ready to represent you.
                    </motion.p>
                </div>
            </div>

            {/* CLIENT CONTENT */}
            <MarketplaceClient initialLawyers={lawyers} />

        </div>
    )
}
