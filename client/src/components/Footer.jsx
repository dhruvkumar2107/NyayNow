'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    Linkedin,
    Instagram,
    ArrowUpRight,
    ShieldCheck,
    Loader2,
    CheckCircle2
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { subscribeNewsletter } from '../api'

const Footer = () => {
    const pathname = usePathname()
    const currentYear = new Date().getFullYear()
    const [email, setEmail] = useState('')
    const [subscription, setSubscription] = useState({ status: 'idle', message: '' })

    const handleSubscribe = async (event) => {
        event.preventDefault()
        const value = email.trim()
        if (!value || subscription.status === 'loading') return

        setSubscription({ status: 'loading', message: '' })
        try {
            const data = await subscribeNewsletter(value)
            setSubscription({
                status: 'success',
                message: data?.message || "You're subscribed. Watch your inbox for NyayNow updates.",
            })
            setEmail('')
        } catch (error) {
            setSubscription({
                status: 'error',
                message: error?.message || 'Could not subscribe right now. Please try again.',
            })
        }
    }

    const isDashboard = pathname?.startsWith('/lawyer') || pathname?.startsWith('/client') || pathname?.startsWith('/admin')
    if (isDashboard) return null

    return (
        <div className="bg-[#020617] border-t border-white/5 text-slate-400 font-sans pt-16 md:pt-32 pb-12 relative overflow-hidden">
            {/* ULTRA-PREMIUM MESH GRADIENT */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] left-[30%] w-[30%] h-[30%] bg-blue-400/5 rounded-full blur-[140px]" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 max-w-[1400px] relative z-10">

                {/* TOP SECTION: BRAND & NEWSLETTER */}
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 mb-16 lg:mb-24">
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
                            <SocialButton icon={<Linkedin size={20} />} label="LinkedIn" href="https://www.linkedin.com/company/nyaynow" />
                            <SocialButton icon={<Instagram size={20} />} label="Instagram" href="https://www.instagram.com/nyaynow.in/" />
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
                                    <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col gap-2">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                                            <input
                                                id="newsletter-email"
                                                name="email"
                                                type="email"
                                                required
                                                autoComplete="email"
                                                maxLength={254}
                                                value={email}
                                                onChange={(event) => setEmail(event.target.value)}
                                                placeholder="you@example.com"
                                                aria-describedby="newsletter-status"
                                                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 text-sm focus:outline-none focus-visible:border-blue-500/50 focus-visible:ring-2 focus-visible:ring-blue-500/30 transition-all w-full md:w-64"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!email.trim() || subscription.status === 'loading'}
                                                className="bg-white text-[#020617] font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300"
                                            >
                                                {subscription.status === 'loading' ? (
                                                    <>
                                                        <Loader2 size={14} className="animate-spin" />
                                                        Joining
                                                    </>
                                                ) : (
                                                    'Join Now'
                                                )}
                                            </button>
                                        </div>
                                        <p
                                            id="newsletter-status"
                                            aria-live="polite"
                                            className={`min-h-4 text-[11px] leading-relaxed ${
                                                subscription.status === 'error'
                                                    ? 'text-red-300'
                                                    : 'text-emerald-300'
                                            }`}
                                        >
                                            {subscription.status === 'success' && (
                                                <CheckCircle2 size={12} className="inline mr-1 -mt-0.5" aria-hidden="true" />
                                            )}
                                            {subscription.message}
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LINKS GRID */}
                <nav aria-label="Footer Navigation" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-12 border-t border-white/5 pt-12 sm:pt-24 mb-16 sm:mb-24">
                    <FooterColumn title="Sitemap">
                        <FooterLink href="/assistant">AI Assistant</FooterLink>
                        <FooterLink href="/marketplace">Find a Lawyer</FooterLink>
                        <FooterLink href="/nyaycourt-simulator">NyayCourt Simulator <Badge color="bg-emerald-500/10 text-emerald-400">New</Badge></FooterLink>
                        <FooterLink href="/nyayvoice">NyayVoice <Badge color="bg-blue-500/10 text-blue-400">Live</Badge></FooterLink>
                        <FooterLink href="/bns">BNS Legal Directory <Badge color="bg-sky-500/10 text-sky-400">SEO</Badge></FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Security & Compliance">
                        <FooterLink href="/security-and-compliance">Security & Compliance</FooterLink>
                        <FooterLink href="/dpdp">DPDP Compliance</FooterLink>
                        <FooterLink href="/methodology">Our Methodology</FooterLink>
                        <FooterLink href="/privacy">Privacy Policy</FooterLink>
                        <FooterLink href="/terms">Terms of Service</FooterLink>
                        <FooterLink href="/disclaimer">Disclaimer</FooterLink>
                        <FooterLink href="/refund">Refund Policy</FooterLink>
                    </FooterColumn>

                    <FooterColumn title="Company">
                        <FooterLink href="/case-studies">Case Studies</FooterLink>
                        <FooterLink href="/about">About Us</FooterLink>
                        <FooterLink href="/career">Careers</FooterLink>
                        <FooterLink href="/contact">Contact Support</FooterLink>
                    </FooterColumn>

                    {/* External authoritative links — boosts SEO trust signals */}
                    <FooterColumn title="Legal Resources">
                        <ExternalFooterLink href="https://main.sci.gov.in" label="Supreme Court of India">Supreme Court of India</ExternalFooterLink>
                        <ExternalFooterLink href="https://ecourts.gov.in" label="eCourts India">eCourts India (NJDG)</ExternalFooterLink>
                        <ExternalFooterLink href="https://www.indiacode.nic.in" label="India Code Legislative Dept">India Code — BNS 2024</ExternalFooterLink>
                        <ExternalFooterLink href="https://www.barcouncilofindia.org" label="Bar Council of India">Bar Council of India</ExternalFooterLink>
                    </FooterColumn>
                </nav>

                {/* GLOBAL LEGAL DISCLAIMER STRIP */}
                <div className="pt-8 pb-8 border-t border-white/5 text-center">
                    <p className="text-[11px] text-slate-500 max-w-3xl mx-auto leading-relaxed">
                        Disclaimer: NyayNow provides AI-generated legal information that may be incomplete or unsupported. It is not professional legal advice. Verify law and drafts against primary sources and consult a qualified advocate before acting.
                    </p>
                </div>

                {/* BOTTOM BAR */}
                <div className="pt-12 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
                        <p>© {currentYear} NyayNow.</p>
                        <div className="hidden md:block w-1 h-1 rounded-full bg-slate-800" />
                        <p>Made with Precision in India</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
                        <div className="flex items-center gap-2 group cursor-default">
                            <ShieldCheck size={14} className="text-slate-500" />
                            <span>Security details</span>
                        </div>
                        <span className="text-slate-700">|</span>
                        <p className="text-slate-500">AI outputs require source verification</p>
                    </div>
                </div>

            </div>
        </div>
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

/* External links to authoritative government legal sources — boosts SEO trust signals */
const ExternalFooterLink = ({ href, label, children }) => (
    <li>
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} (opens in new tab)`}
            className="text-[15px] font-medium text-slate-500 hover:text-white transition-all duration-300 flex items-center group"
        >
            {children}
            <ArrowUpRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 text-blue-500" />
        </a>
    </li>
)

const Badge = ({ children, color, className = "" }) => (
    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest ml-1.5 ${color} ${className}`}>
        {children}
    </span>
)

const SocialButton = ({ icon, label, href }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:bg-blue-600/10 hover:text-blue-400 hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-500 shadow-2xl"
        aria-label={label}
    >
        {icon}
    </a>
)

export default Footer
