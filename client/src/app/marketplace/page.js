'use client'

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import MarketplaceClient from "../../components/marketplace/MarketplaceClient"
import { API_BASE } from "../../config"

export default function MarketplacePage() {
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

            {/* TEST - Simple content */}
            <div className="container mx-auto px-6 py-20">
                <div className="bg-glass rounded-2xl p-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Marketplace Loading...</h2>
                    <p className="text-slate-400">Lawyers directory will appear here</p>
                </div>
            </div>

        </div>
    )
}
