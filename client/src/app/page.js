import React from "react"

import HeroSection from "../components/home/HeroSection"
import FeatureCards from "../components/home/FeatureCards"
import ChooserCards from "../components/home/ChooserCards"

import TrustSection from "../components/home/TrustSection"
import LegalSOSSection from "../components/home/LegalSOSSection"

export const metadata = {
    title: 'NyayNow — AI Legal Assistant & Verified Lawyer Marketplace in India | Free Legal Advice',
    description: 'NyayNow: India\'s AI-powered legal assistant. Get free BNS & IPC legal answers, draft contracts, find verified lawyers near you, and track court cases — in Hindi, Tamil & English.',
    keywords: 'free legal advice India, AI legal assistant, BNS IPC sections, find lawyer online, legal help Hindi, court case tracker, draft rent agreement, NyayNow',
    alternates: {
        canonical: 'https://nyaynow.in',
    },
    openGraph: {
        title: 'NyayNow — AI Legal Assistant & Verified Lawyer Marketplace India',
        description: 'India\'s AI-powered legal assistant. Free BNS & IPC legal answers, contract drafting, verified lawyers, and court case tracking in Hindi, Tamil & English.',
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
        title: 'NyayNow — Free AI Legal Assistant India',
        description: 'Free BNS & IPC legal answers in Hindi, Tamil & English. Find verified lawyers, draft contracts, and track court cases instantly.',
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
