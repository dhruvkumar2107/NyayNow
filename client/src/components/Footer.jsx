'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
    Twitter,
    Linkedin,
    Instagram,
    Github,
    Mail,
    ArrowUpRight,
    ShieldCheck,
    Lock,
    Globe,
    Zap,
    Scale
} from 'lucide-react'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-[#020617] border-t border-white/5 text-slate-400 font-sans pt-32 pb-12 relative overflow-hidden">
            {/* ULTRA-PREMIUM MESH GRADIENT */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] left-[30%] w-[30%] h-[30%] bg-blue-400/5 rounded-full blur-[140px]" />
            </div>

            <div className="container mx-auto px-6 max-w-[1400px] relative z-10">

                {/* TOP SECTION: BRAND & NEWSLETTER */}
                <div className="grid lg:grid-cols-12 gap-16 mb-24">
                    <div className="lg:col-span-5">
                        <Link href="/" className="inline-flex items-center gap-3 mb-8 group" aria-label="NyayNow Home">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 blur-[20px] opacity-0 group-hover:opacity-40 transition-all duration-700"></div>
                                <div className="relative w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                                    <Image src="/logo.png" alt="NyayNow Logo" width={32} height={32} className="object-contain" />
                                </div>
                            </div>
                            <span className="text-3xl font-bold text-white tracking-tighter group-hover:text-blue-400 transition-colors">NyayNow</span>
                        </Link>
                        <p className="text-slate-400 text-xl leading-relaxed mb-10 max-w-md font-medium tracking-tight">
                            The operating system for the <span className="text-white">Indian Justice System</span>. Democratizing legal intelligence through institutional-grade AI.
                        </p>
                        <div className="flex gap-4">
                            <SocialButton icon={<Twitter size={20} />} label="Twitter" />
                            <SocialButton icon={<Linkedin size={20} />} label="LinkedIn" />
                            <SocialButton icon={<Instagram size={20} />} label="Instagram" />
                            <SocialButton icon={<Github size={20} />} label="Github" />
                        </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col justify-center">
                        <div className="relative p-1 rounded-[32px] bg-gradient-to-b from-white/10 to-transparent">
                            <div className="bg-[#030712] rounded-[30px] p-8 md:p-12 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/10 transition-colors duration-1000" />

                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                    <div className="flex-1">
                                        <h4 className="text-2xl font-bold text-white mb-3 tracking-tight">Stay ahead of the curve.</h4>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                            Weekly insights on Supreme Court judgments and <br className="hidden md:block" /> revolutionary AI features delivered to your inbox.
                                        </p>
                                    </div>
                                    <form className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="email"
                                            placeholder="admiralty@nyaynow.in"
                                            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500/50 transition-all w-full md:w-64"
                                        />
                                        <button className="bg-white text-[#020617] font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all duration-500 shadow-xl active:scale-95">
                                            Join Now
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LINKS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 border-t border-white/5 pt-24 mb-24">
                    <FooterColumn title="Intelligence">
                        <FooterLink href="/assistant">Legal Assistant</FooterLink>
                        <FooterLink href="/judge-ai">Judge AI</FooterLink>
                        <FooterLink href="/voice-assistant">NyayVoice</FooterLink>
                        <FooterLink href="/moot-court">Simulation VR</FooterLink>
                        <FooterLink href="/research">Precedent Engine</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Enterprise">
                        <FooterLink href="/drafting">Drafting Lab</FooterLink>
                        <FooterLink href="/agreements">Risk Audit</FooterLink>
                        <FooterLink href="/compliances">Compliance Hub</FooterLink>
                        <FooterLink href="/ecourts">Court Analytics</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Network">
                        {/* <FooterLink href="/marketplace">Elite Directory</FooterLink> */}
                        {/* <FooterLink href="/lawyer/dashboard">For Advocates</FooterLink> */}
                        <FooterLink href="/client/dashboard">For Citizens</FooterLink>
                        <FooterLink href="/career">For Students</FooterLink>
                        <FooterLink href="/judiciary">For Judiciary</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Foundation">
                        <FooterLink href="/about">Our Vision</FooterLink>
                        <FooterLink href="/careers">Careers <Badge color="bg-white/5 text-slate-500">8 Open Roles</Badge></FooterLink>
                        <FooterLink href="/press">Media Kit</FooterLink>
                        <FooterLink href="/contact">Support</FooterLink>
                        <FooterLink href="/partners">Integrations</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Compliance">
                        <FooterLink href="/terms">Protocol</FooterLink>
                        <FooterLink href="/privacy">Privacy Matrix</FooterLink>
                        <FooterLink href="/contact">Grievance Redressal</FooterLink>
                        <FooterLink href="/security">Security Shell</FooterLink>
                    </FooterColumn>
                </div>

                {/* BOTTOM BAR */}
                <div className="pt-12 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
                        <p>© {currentYear} NyayNow Legal Tech Pvt Ltd.</p>
                        <div className="hidden md:block w-1 h-1 rounded-full bg-slate-800" />
                        <p>Made with Precision in India</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
                        <div className="flex items-center gap-2 group cursor-default">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="group-hover:text-emerald-500 transition-colors">Systems Secure</span>
                        </div>
                        <Link href="/status" className="hover:text-white transition-colors">Infrastructure</Link>
                        <Link href="/security" className="hover:text-white transition-colors">Architecture</Link>
                        <Link href="/roadmap" className="hover:text-white transition-colors">Deployment</Link>
                    </div>
                </div>

            </div>
        </footer>
    )
}

const FooterColumn = ({ title, children }) => (
    <div className="flex flex-col gap-6">
        <h3 className="font-black text-white uppercase tracking-[0.3em] text-[10px]">{title}</h3>
        <ul className="flex flex-col gap-4">
            {children}
        </ul>
    </div>
)

const FooterLink = ({ href, children }) => (
    <li>
        <Link href={href} className="text-[15px] font-medium text-slate-500 hover:text-white transition-all duration-300 flex items-center group">
            {children}
            <ArrowUpRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 text-blue-500" />
        </Link>
    </li>
)

const Badge = ({ children, color, className = "" }) => (
    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest ml-1.5 ${color} ${className}`}>
        {children}
    </span>
)

const SocialButton = ({ icon, label }) => (
    <button
        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:bg-blue-600/10 hover:text-blue-400 hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-500 shadow-2xl"
        aria-label={label}
    >
        {icon}
    </button>
)

export default Footer
