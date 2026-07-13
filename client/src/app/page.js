import React from "react"

import HeroSection from "../components/home/HeroSection"
import FeatureCards from "../components/home/FeatureCards"
import ChooserCards from "../components/home/ChooserCards"

import TrustSection from "../components/home/TrustSection"
import LegalSOSSection from "../components/home/LegalSOSSection"

export const metadata = {
    title: 'NyayNow | AI Legal Assistant & Lawyer Marketplace India',
    description: 'NyayNow: India\'s AI legal platform. Free BNS 2024 & IPC answers, contract drafting, Bar Council verified lawyers, eCourts case tracking — Hindi, Tamil & English.',
    keywords: 'free legal advice India, AI legal assistant, BNS 2024, IPC sections, bar council verified lawyers, find lawyer online, legal sos, supreme court judgments, court data, legal help Hindi, NyayNow',
    alternates: {
        canonical: 'https://nyaynow.in',
    },
    openGraph: {
        title: 'NyayNow | AI Legal Assistant & Lawyer Marketplace India',
        description: 'Free BNS 2024 & IPC legal answers, Bar Council verified advocates, contract drafting, Legal SOS, and Supreme Court case tracking in 14 Indian languages.',
        url: 'https://nyaynow.in',
        images: [
            {
                url: 'https://nyaynow.in/logo.png',
                width: 512,
                height: 512,
                alt: 'NyayNow — AI Legal Assistant India'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'NyayNow | Free AI Legal Assistant India',
        description: 'BNS 2024 & IPC answers, Bar Council verified lawyers, Legal SOS & Supreme Court case tracking. Free legal advice in Hindi, Tamil & English.',
        site: '@NyayNow'
    }
}

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0c1220] font-sans text-slate-400 selection:bg-indigo-500/30">
            {/* HERO SECTION */}
            <main id="main-content" role="main" aria-label="NyayNow AI Legal Assistant Homepage">
                <HeroSection />

                {/* VALUE PROPOSITION FEATURE CARDS */}
                <section aria-label="Legal AI Features">
                    <FeatureCards />
                </section>

                {/* QUICK ACTION PORTAL */}
                <section aria-label="Legal Services Quick Access">
                    <ChooserCards />
                </section>

                {/* TRUST, STEP PROCESS & COMPLIANCE */}
                <section aria-label="Trust and Compliance">
                    <TrustSection />
                </section>

                {/* EMERGENCY SOS SECTION */}
                <section aria-label="Legal Emergency SOS">
                    <LegalSOSSection />
                </section>
            </main>
        </div>
    )
}
