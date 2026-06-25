'use client'

import React from "react"
import dynamic from "next/dynamic"

import HeroSection from "../components/home/HeroSection"
import ChooserCards from "../components/home/ChooserCards"

const TrustSection = dynamic(() => import("../components/home/TrustSection"))
const LegalSOSSection = dynamic(() => import("../components/home/LegalSOSSection").then(mod => mod.LegalSOSSection))

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0c1220] font-sans text-slate-400 selection:bg-indigo-500/30">
            {/* HERO SECTION */}
            <HeroSection />

            {/* QUICK ACTION PORTAL */}
            <ChooserCards />

            {/* TRUST, STEP PROCESS & COMPLIANCE */}
            <TrustSection />

            {/* EMERGENCY SOS SECTION */}
            <LegalSOSSection />
        </div>
    )
}
