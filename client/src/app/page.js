import React from "react"
import dynamic from "next/dynamic"

import HeroSection from "../components/home/HeroSection"
import FeatureCards from "../components/home/FeatureCards"
import ChooserCards from "../components/home/ChooserCards"

const TrustSection = dynamic(() => import("../components/home/TrustSection"))
const LegalSOSSection = dynamic(() => import("../components/home/LegalSOSSection").then(mod => mod.LegalSOSSection))

export const metadata = {
    title: 'NyayNow | AI Legal Intelligence & Lawyer Marketplace India',
    description: 'NyayNow is an AI-powered legal assistant and verified lawyer directory in India. Ask plain-language queries, auto-draft rent agreements and contracts, and connect with State Bar KYC verified advocates.',
    alternates: {
        canonical: 'https://nyaynow.in',
    },
    openGraph: {
        title: 'NyayNow | AI Legal Intelligence & Lawyer Marketplace India',
        description: 'AI-powered legal assistant and verified lawyer directory in India. Ask plain-language queries, auto-draft rent agreements, and connect with BCI-verified advocates.',
        url: 'https://nyaynow.in',
        images: [
            {
                url: 'https://nyaynow.in/logo.png',
                width: 512,
                height: 512,
                alt: 'NyayNow Logo'
            }
        ]
    }
}

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0c1220] font-sans text-slate-400 selection:bg-indigo-500/30">
            {/* HERO SECTION */}
            <HeroSection />

            {/* VALUE PROPOSITION FEATURE CARDS */}
            <FeatureCards />

            {/* QUICK ACTION PORTAL */}
            <ChooserCards />

            {/* TRUST, STEP PROCESS & COMPLIANCE */}
            <TrustSection />

            {/* EMERGENCY SOS SECTION */}
            <LegalSOSSection />
        </div>
    )
}
