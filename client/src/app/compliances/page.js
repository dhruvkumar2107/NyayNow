'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, FileCheck, AlertCircle, Info, ArrowLeft, Loader2, CheckCircle2, ListChecks, Download, ExternalLink, Zap } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

export default function ComplianceHubPage() {
    const [activeTab, setActiveTab] = useState('posh')
    const [isLoading, setIsLoading] = useState(false)
    const [checklist, setChecklist] = useState(null)

    const compliances = [
        { id: 'posh', name: 'POSH Act 2013', desc: 'Internal Complaints Committee & Safety' },
        { id: 'dpdp', name: 'DPDP Act 2023', desc: 'Digital Personal Data Protection' },
        { id: 'labour', name: 'Labour Compliance', desc: 'Minimum Wages & Gratuity' },
        { id: 'msme', name: 'MSME Statutory', desc: 'Late Payment Protection & SIDBI' }
    ]

    const generateChecklist = async (category) => {
        setIsLoading(true)
        setChecklist(null)
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/ai/chat`, {
                message: `[COMPLIANCE HUB] Generate a 10-item legal compliance checklist for a mid-sized Indian startup regarding: ${category}. 
                Format each item exactly with keys: "title" (string), "requirement" (string), and "riskLevel" (string: "Low", "Medium", "High"). 
                RETURN ONLY A VALID JSON ARRAY. NO MARKDOWN FORMATTING, NO BACKTICKS, NO EXPLANATORY TEXT. START WITH [ AND END WITH ].`
            })
            
            let text = res.data.response;
            // Clean up potentially bad AI output
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const jsonStart = text.indexOf('[');
            const jsonEnd = text.lastIndexOf(']');
            
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonStr = text.substring(jsonStart, jsonEnd + 1);
                setChecklist(JSON.parse(jsonStr));
            } else {
                setChecklist([{ title: "Compliance Audit", requirement: "AI failed to return valid data format. Raw response: " + text.substring(0, 100), riskLevel: "High" }]);
            }
        } catch (err) {
            console.error(err)
            setChecklist([{ title: "Audit Error", requirement: "Connection to the Audit Engine failed.", riskLevel: "High" }]);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans pt-32">
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15)_0%,transparent_50%)]" />
            </div>

            {/* HEADER */}
            <header className="relative z-10 p-8 flex justify-between items-center border-b border-white/5 backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                        <ShieldCheck size={20} className="text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-[0.2em] uppercase">Compliance<span className="text-blue-500">Hub</span></h1>
                        <p className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase">Enterprise Statutory Shield</p>
                    </div>
                </div>

                <Link href="/client/dashboard" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                    <ArrowLeft size={14} /> Back
                </Link>
            </header>

            <main className="relative z-10 flex-1 flex">
                {/* SIDEBAR */}
                <aside className="w-80 border-r border-white/5 p-8 hidden lg:block">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">Statutory Categories</h3>
                    <nav className="space-y-2">
                        {compliances.map(comp => (
                            <button
                                key={comp.id}
                                onClick={() => { setActiveTab(comp.id); setChecklist(null); }}
                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                                    activeTab === comp.id 
                                    ? 'bg-blue-600/10 border-blue-500/30 text-white' 
                                    : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <div className="font-bold text-sm mb-1">{comp.name}</div>
                                <div className="text-[10px] font-medium opacity-60 leading-tight">{comp.desc}</div>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-20 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                        <Zap size={20} className="text-blue-400 mb-3" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-white mb-2">Automated Audit</h4>
                        <p className="text-[10px] font-medium text-slate-400 mb-4 leading-relaxed">
                            Generate a specialized compliance checklist using neural statutory analysis.
                        </p>
                        <button 
                            onClick={() => generateChecklist(compliances.find(c => c.id === activeTab).name)}
                            disabled={isLoading}
                            className="w-full py-3 bg-white text-[#020617] font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                        >
                            {isLoading ? <Loader2 size={12} className="animate-spin mx-auto" /> : "Run AI Audit"}
                        </button>
                    </div>
                </aside>

                {/* CONTENT AREA */}
                <section className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-[calc(100vh-100px)]">
                    <div className="max-w-4xl">
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">{compliances.find(c => c.id === activeTab).name}</h2>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                Manage and audit your corporate statutory health. Our engine cross-references latest amendments in real-time.
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {checklist ? (
                                <motion.div 
                                    key="checklist"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-4"
                                >
                                    <div className="flex justify-between items-center bg-white/5 p-6 rounded-[32px] border border-white/10 mb-8">
                                        <div className="flex items-center gap-4">
                                            <CheckCircle2 className="text-emerald-500" />
                                            <div>
                                                <div className="text-white font-bold">Audit Complete</div>
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">10 Critical Checkpoints Identified</div>
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                                           <Download size={14} /> Export Report
                                        </button>
                                    </div>

                                    {checklist.map((item, i) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-start gap-6 group hover:border-white/10 transition-all"
                                        >
                                            <div className="mt-1">
                                                <input type="checkbox" className="w-5 h-5 rounded-md border-white/20 bg-transparent" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-white font-bold">{item.title}</h4>
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                                        item.riskLevel === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                        {item.riskLevel} Risk
                                                    </span>
                                                </div>
                                                <p className="text-slate-400 text-sm font-medium leading-relaxed">{item.requirement}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-12 rounded-[48px] border-2 border-dashed border-white/5 text-center flex flex-col items-center justify-center min-h-[400px]"
                                >
                                    <ListChecks size={60} className="text-slate-800 mb-6" />
                                    <h3 className="text-xl font-bold text-slate-600 mb-2 tracking-tight">System Ready for Audit</h3>
                                    <p className="text-slate-600 text-sm font-medium mb-8 max-w-sm">
                                        Select a compliance category and run the AI statutory audit to generate your interactive checklist.
                                    </p>
                                    <button 
                                        onClick={() => generateChecklist(compliances.find(c => c.id === activeTab).name)}
                                        disabled={isLoading}
                                        className="px-10 py-4 bg-white/5 text-white/50 border border-white/10 font-black rounded-3xl text-[10px] uppercase tracking-[.3em] hover:bg-white hover:text-black transition-all"
                                    >
                                        Run Institutional Check
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            </main>
        </div>
    )
}
