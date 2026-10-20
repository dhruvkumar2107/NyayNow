import React from "react"

import HeroSection from "../components/home/HeroSection"
import FeatureCards from "../components/home/FeatureCards"
import ChooserCards from "../components/home/ChooserCards"

import TrustSection from "../components/home/TrustSection"
import LegalSOSSection from "../components/home/LegalSOSSection"
import LegalIntelligenceDemo from "../components/home/LegalIntelligenceDemo"
import LiveMetrics from "../components/home/LiveMetrics"

export const metadata = {
    title: 'NyayNow | AI Legal Assistant & Lawyer Marketplace India',
    description: 'NyayNow provides AI-assisted legal information, document workflows, and a lawyer marketplace for India. Verify citations and seek advocate review before acting.',
    keywords: 'legal information India, AI legal assistant, BNS, Indian law, find lawyer online, legal document drafting, legal research, NyayNow',
    alternates: {
        canonical: 'https://nyaynow.in',
    },
    openGraph: {
        title: 'NyayNow | AI Legal Assistant & Lawyer Marketplace India',
        description: 'AI-assisted legal information, document workflows, and a lawyer marketplace for India.',
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
        title: 'NyayNow | AI Legal Information and Lawyer Marketplace India',
        description: 'AI-assisted legal information, document workflows, and a lawyer marketplace for India.',
        site: '@NyayNow'
    }
}

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0c1220] font-sans text-slate-400 selection:bg-indigo-500/30">
            {/* HERO SECTION */}
            <main id="main-content" role="main" aria-label="NyayNow AI Legal Assistant Homepage">
                <HeroSection />
                <LegalIntelligenceDemo />
                <LiveMetrics />

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
