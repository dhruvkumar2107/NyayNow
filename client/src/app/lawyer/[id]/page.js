import React from "react"
import LawyerProfileClient from "../../../components/lawyer/LawyerProfileClient"

async function getLawyer(id) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

    // Safety check for build-time fetches to localhost
    if (typeof window === 'undefined' && apiUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
        return null
    }

    try {
        const res = await fetch(`${apiUrl}/api/users/public/${id}`, { next: { revalidate: 3600 } })
        if (!res.ok) return null
        return res.json()
    } catch (error) {
        if (!apiUrl.includes('localhost')) {
            console.error("Error fetching lawyer:", error)
        }
        return null
    }
}

export async function generateMetadata({ params }) {
    const lawyer = await getLawyer(params.id)
    if (!lawyer) return { title: "Lawyer Not Found | NyayNow" }

    return {
        title: `${lawyer.name} | Verified Lawyer on NyayNow`,
        description: `Consult with ${lawyer.name}, a legal expert specializing in ${lawyer.specialization || 'law'}. Book an appointment on NyayNow.`,
        openGraph: {
            title: `${lawyer.name} | Verified Lawyer Profile`,
            description: `Connect with ${lawyer.name} on NyayNow.`,
            images: lawyer.profileImage ? [{ url: lawyer.profileImage }] : [],
        },
    }
}

export default async function LawyerProfilePage({ params }) {
    const lawyer = await getLawyer(params.id)

    if (!lawyer) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white pt-20">
                <h1 className="text-3xl font-bold">Lawyer Not Found</h1>
                <p className="text-slate-400 mt-4">The profile you are looking for does not exist or has been removed.</p>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-[#020617] pt-20">
            <LawyerProfileClient initialLawyer={lawyer} lawyerId={params.id} />
        </main>
    )
}
