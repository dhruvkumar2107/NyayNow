'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Scale, AlertTriangle, ArrowUpRight, Gauge, Globe, Zap, ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

export default function CourtAnalyticsPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans">
             <div className="absolute inset-0 pointer-events-none overflow-hidden h-[1000px]">
                <div className="absolute top-0 right-0 w-[60%] h-[1000px] bg-blue-600/5 rounded-full blur-[140px]" />
                <div className="absolute -top-[10%] left-0 w-[40%] h-[1000px] bg-indigo-500/5 rounded-full blur-[120px]" />
            </div>

            {/* HEADER */}
            <header className="relative z-10 p-8 flex justify-between items-center border-b border-white/5 backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                        <BarChart3 size={20} className="text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-[0.2em] uppercase">Court<span className="text-blue-500">Analytics</span></h1>
                        <p className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase">Live Judicial Data Streams</p>
                    </div>
                </div>

                <Link href="/client/dashboard" className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowLeft size={14} /> Back
                </Link>
            </header>

            <main className="relative z-10 flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
                {/* HERO STATS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard 
                        icon={<Gauge className="text-blue-500" size={20} />} 
                        label="System Win Rate" 
                        value="82.4%" 
                        trend="+4.2%" 
                        description="Across corporate litigation"
                    />
                    <StatCard 
                        icon={<TrendingUp className="text-emerald-500" size={20} />} 
                        label="Avg. Case Duration" 
                        value="14 Mo." 
                        trend="-2.1 Mo." 
                        description="Optimized through mediation"
                    />
                    <StatCard 
                        icon={<Users className="text-amber-500" size={20} />} 
                        label="Matter Throughput" 
                        value="1,240" 
                        trend="+15%" 
                        description="Monthly active proceedings"
                    />
                    <StatCard 
                        icon={<Globe className="text-blue-400" size={20} />} 
                        label="Global Benchmark" 
                        value="Top 5%" 
                        trend="Stable" 
                        description="Efficiency score vs. Industry"
                    />
                </div>

                {/* VISUAL DASHBOARD GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                    {/* CHART 1: LITIGATION TRENDS */}
                    <div className="lg:col-span-8 p-10 rounded-[48px] bg-white/5 border border-white/10 backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8">
                            <Zap size={20} className="text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight mb-8">Litigation Frequency & Risk Matrix</h3>
                        <div className="h-64 flex items-end gap-3 md:gap-6 px-4">
                            {[60, 40, 80, 20, 95, 70, 50, 85, 30, 90, 45, 75].map((h, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.05, duration: 1 }}
                                    className="flex-1 rounded-t-xl bg-gradient-to-t from-blue-600 to-indigo-500 relative group/bar"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 text-[10px] font-black text-white bg-[#020617] px-2 py-1 rounded-md border border-white/10 transition-all">
                                        {h}%
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 border-t border-white/5 pt-6">
                            <span>Jan</span>
                            <span>Jun</span>
                            <span>Dec</span>
                        </div>
                    </div>

                    {/* RISK INDEX */}
                    <div className="lg:col-span-4 p-10 rounded-[48px] bg-red-600/5 border border-red-500/10 backdrop-blur-3xl">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <AlertTriangle className="text-red-500" /> Systemic Risk Index
                        </h3>
                        <div className="space-y-6">
                            <RiskItem label="BNS Section 163 Compliance" value={15} color="bg-emerald-500" />
                            <RiskItem label="Labour Law Penalties" value={45} color="bg-amber-500" />
                            <RiskItem label="IP Infringement Liability" value={85} color="bg-red-500" />
                            <RiskItem label="Tax Statutory Defaults" value={30} color="bg-blue-500" />
                        </div>
                        <div className="mt-12 p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Overall Hazard Level</p>
                            <p className="text-2xl font-black text-red-500">STABLE-MODERATE</p>
                        </div>
                    </div>
                </div>

                {/* BOTTOM TOOLS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ToolAction icon={<Scale />} title="Benchmarking Console" desc="Compare case strategy against historical bench rulings." />
                    <ToolAction icon={<Shield />} title="Vulnerability Audit" desc="AI-driven scanning for statutory loopholes." />
                    <ToolAction icon={<BarChart3 />} title="Projection Engine" desc="Predict future legal spend based on current patterns." />
                </div>
            </main>
        </div>
    )
}

function StatCard({ icon, label, value, trend, description }) {
    return (
        <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-3xl group hover:border-blue-500/30 transition-all duration-500">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">{label}</p>
            <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-black text-white">{value}</span>
                <span className={`text-[10px] font-black ${trend.startsWith('+') ? 'text-emerald-500' : trend === 'Stable' ? 'text-blue-400' : 'text-red-500'}`}>
                    {trend}
                </span>
            </div>
            <p className="text-[10px] font-medium text-slate-600 italic">{description}</p>
        </div>
    )
}

function RiskItem({ label, value, color }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    )
}

function ToolAction({ icon, title, desc }) {
    return (
        <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 flex items-start gap-6 group hover:bg-white/[0.08] transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    {title} <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}
