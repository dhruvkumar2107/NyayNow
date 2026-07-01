'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Check, X, Zap, Scale, Building2, Users, Star, ArrowRight,
  Sparkles, Shield, Clock, FileText, Mic, Brain, Search,
  ChevronDown, ChevronUp, Crown, Gavel, BookOpen, MessageSquare,
  TrendingUp, Lock, Globe, Phone, BadgeCheck, Flame, Infinity
} from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const PLANS = [
  {
    id: 'saathi',
    name: 'Nyay Saathi',
    tagline: 'Legal awareness for every Indian',
    price: { monthly: 0, yearly: 0 },
    priceDisplay: { monthly: 'Free', yearly: 'Free' },
    color: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-500/20',
    accentColor: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/10 text-emerald-400',
    glowColor: 'shadow-emerald-500/10',
    icon: Globe,
    badge: null,
    cta: 'Get Started Free',
    ctaStyle: 'bg-white/10 border border-white/20 text-white hover:bg-white/20',
    description: 'Perfect for citizens, first-time users & anyone exploring their legal rights.',
    features: [
      { label: 'AI Legal Assistant', value: '10 queries/month', included: true },
      { label: 'Nearby Lawyer Finder', value: 'Unlimited', included: true },
      { label: 'Legal SOS Emergency Contacts', value: 'Unlimited', included: true },
      { label: 'Legal Awareness Articles', value: 'Unlimited', included: true },
      { label: 'Precedent Research', value: '3 searches/month', included: true },
      { label: 'Document Drafting', value: '1 draft/month', included: true },
      { label: 'NyayVoice Voice Assistant', value: null, included: false },
      { label: 'Judge AI Outcome Predictor', value: null, included: false },
      { label: 'Case PDF Analysis', value: null, included: false },
      { label: 'BNS Section Converter', value: null, included: false },
      { label: 'Chat History & Export', value: null, included: false },
    ]
  },
  {
    id: 'pro',
    name: 'Nyay Pro',
    tagline: 'Your personal AI lawyer',
    price: { monthly: 299, yearly: 2499 },
    priceDisplay: { monthly: '₹299', yearly: '₹2,499' },
    color: 'from-blue-600/30 to-indigo-600/20',
    borderColor: 'border-blue-500/40',
    accentColor: 'text-blue-400',
    badgeColor: 'bg-blue-500/10 text-blue-400',
    glowColor: 'shadow-blue-500/20',
    icon: Zap,
    badge: 'Most Popular',
    cta: 'Start Pro Plan',
    ctaStyle: 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/30',
    description: 'For tenants, property buyers, employees & law students fighting legal battles.',
    features: [
      { label: 'AI Legal Assistant', value: 'Unlimited', included: true },
      { label: 'Precedent Research (Indian Kanoon)', value: '30 searches/month', included: true },
      { label: 'Document Drafting', value: '10 drafts/month', included: true },
      { label: 'Case PDF Analysis', value: '5 docs/month', included: true },
      { label: 'NyayVoice Voice Assistant', value: '20 min/month', included: true },
      { label: 'BNS Section Converter', value: 'Unlimited', included: true },
      { label: 'FIRAC Case Profile Viewer', value: 'Unlimited', included: true },
      { label: 'Judge AI Outcome Predictor', value: '3 predictions/month', included: true },
      { label: 'Chat History & Export', value: 'Unlimited', included: true },
      { label: 'Courtroom Battle Simulator', value: '3/month', included: true },
      { label: 'Court-Ready Brief Generator', value: null, included: false },
      { label: 'Visual Precedent Citation Map', value: null, included: false },
    ]
  },
  {
    id: 'gold',
    name: 'Nyay Gold',
    tagline: 'The AI associate every advocate needs',
    price: { monthly: 799, yearly: 6999 },
    priceDisplay: { monthly: '₹799', yearly: '₹6,999' },
    color: 'from-amber-500/30 to-yellow-500/10',
    borderColor: 'border-amber-500/40',
    accentColor: 'text-amber-400',
    badgeColor: 'bg-amber-500/10 text-amber-400',
    glowColor: 'shadow-amber-500/20',
    icon: Crown,
    badge: 'Best for Advocates',
    cta: 'Go Gold',
    ctaStyle: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black hover:from-amber-400 hover:to-yellow-400 shadow-xl shadow-amber-500/30',
    description: 'For practising advocates, solo practitioners & junior associates in law firms.',
    features: [
      { label: 'AI Legal Assistant', value: 'Unlimited', included: true },
      { label: 'Precedent Research (Indian Kanoon)', value: 'Unlimited', included: true },
      { label: 'Document Drafting', value: 'Unlimited (all templates)', included: true },
      { label: 'Case PDF Analysis', value: '25 docs/month', included: true },
      { label: 'Judge AI Outcome Predictor', value: 'Unlimited', included: true },
      { label: 'Court-Ready Brief Generator', value: '✨ New', included: true },
      { label: 'Visual Precedent Citation Map', value: '✨ New', included: true },
      { label: 'Case Timeline Generator', value: '✨ New', included: true },
      { label: 'NyayVoice Voice Assistant', value: 'Unlimited', included: true },
      { label: 'Client Case Portal (10 clients)', value: 'Unlimited', included: true },
      { label: 'Moot Court / AI Judge Mode', value: 'Unlimited', included: true },
      { label: 'PDF Report Downloads', value: 'Unlimited', included: true },
    ]
  },
  {
    id: 'firm',
    name: 'Nyay Firm',
    tagline: 'Enterprise legal intelligence',
    price: { monthly: 2999, yearly: 24999 },
    priceDisplay: { monthly: '₹2,999', yearly: '₹24,999' },
    color: 'from-violet-600/30 to-purple-600/20',
    borderColor: 'border-violet-500/40',
    accentColor: 'text-violet-400',
    badgeColor: 'bg-violet-500/10 text-violet-400',
    glowColor: 'shadow-violet-500/20',
    icon: Building2,
    badge: 'For Law Firms',
    cta: 'Contact Sales',
    ctaStyle: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-xl shadow-violet-500/30',
    description: 'For established law firms, corporate legal teams & legal tech organizations.',
    features: [
      { label: 'Everything in Gold', value: 'All included', included: true },
      { label: 'Team Seats', value: '10 users included', included: true },
      { label: 'Contract Heatmap & Redliner', value: '✨ Firm Only', included: true },
      { label: 'AI Witness Cross-Examiner', value: '✨ Firm Only', included: true },
      { label: 'Bulk Document Processing', value: '500 docs/month', included: true },
      { label: 'White-label PDF Reports', value: 'Your firm branding', included: true },
      { label: 'API Access', value: '10,000 calls/month', included: true },
      { label: 'Custom Template Library', value: 'Upload your own', included: true },
      { label: 'Shared Case Workspace', value: 'Team collaboration', included: true },
      { label: 'Dedicated Account Manager', value: 'Included', included: true },
      { label: 'GST/Invoice Billing', value: 'Included', included: true },
      { label: 'SLA-backed 99.9% Uptime', value: 'Guaranteed', included: true },
    ]
  }
]

const FAQS = [
  {
    q: 'Can I switch plans anytime?',
    a: 'Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period.'
  },
  {
    q: 'Is there a student discount?',
    a: 'Yes! Law students with a valid college ID get 60% off the Nyay Pro plan — just ₹119/month. Contact us at support@nyaynow.in with your student ID to claim this discount.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major payment methods via Razorpay — UPI, Net Banking, Credit Cards, Debit Cards, and EMI options on cards.'
  },
  {
    q: 'Is my data safe and confidential?',
    a: 'Absolutely. All data is encrypted end-to-end with AES-256. Your legal queries and case data are never shared or sold. We are fully DPDP (India) compliant.'
  },
  {
    q: 'What happens when I exceed my monthly limits on Free?',
    a: 'You will see a prompt to upgrade. Your existing chats and data are preserved. We never delete your data when a limit is reached — we just pause new queries until the next cycle or upgrade.'
  },
  {
    q: 'Can the Firm plan support more than 10 users?',
    a: 'Yes. The Firm plan includes 10 seats and you can add additional seats at ₹499/seat/month. For very large deployments (50+ seats), contact our enterprise sales team for a custom quote.'
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 7-day money-back guarantee on all paid plans. If you are not satisfied, contact us within 7 days of payment for a full refund, no questions asked.'
  }
]

const TESTIMONIALS = [
  {
    name: 'Adv. Priya Sharma',
    role: 'Senior Advocate, Delhi High Court',
    plan: 'Nyay Gold',
    planColor: 'text-amber-400',
    text: 'NyayNow Gold has replaced my legal research assistant. The Indian Kanoon integration and FIRAC breakdowns save me 4-5 hours per case. At ₹799/month, it pays for itself in one brief.',
    rating: 5
  },
  {
    name: 'Rahul Verma',
    role: 'Tenant, Pune',
    plan: 'Nyay Pro',
    planColor: 'text-blue-400',
    text: 'My landlord was illegally withholding my deposit. The AI Assistant explained exactly which section of Transfer of Property Act applies and even drafted my legal notice. Saved ₹8,000 in lawyer fees.',
    rating: 5
  },
  {
    name: 'Nikhil & Associates',
    role: 'Law Firm, Mumbai',
    plan: 'Nyay Firm',
    planColor: 'text-violet-400',
    text: 'We onboarded our entire 8-person team. The white-label PDF reports with our firm\'s branding and the shared case workspace have genuinely transformed our client workflow.',
    rating: 5
  }
]

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly')
  const [openFaq, setOpenFaq] = useState(null)
  const [loading, setLoading] = useState(null)
  const router = useRouter()

  const handleSubscribe = async (planId) => {
    if (planId === 'saathi') {
      router.push('/register')
      return
    }
    if (planId === 'firm') {
      window.location.href = 'mailto:enterprise@nyaynow.in?subject=Nyay Firm Plan Enquiry'
      return
    }
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login?redirect=/pricing')
      return
    }
    setLoading(planId)
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/create-subscription`,
        { plan: planId, billing },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.subscriptionId && window.Razorpay) {
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RZP_KEY_ID,
          subscription_id: data.subscriptionId,
          name: 'NyayNow',
          description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
          handler: () => { router.push('/assistant?upgrade=success') }
        })
        rzp.open()
      }
    } catch (err) {
      if (err?.response?.status === 401) router.push('/login?redirect=/pricing')
    } finally {
      setLoading(null)
    }
  }

  const savings = (plan) => {
    if (!plan.price.monthly || !plan.price.yearly) return null
    const annualIfMonthly = plan.price.monthly * 12
    const saved = annualIfMonthly - plan.price.yearly
    const pct = Math.round((saved / annualIfMonthly) * 100)
    return { saved, pct }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 overflow-x-hidden font-sans">
      {/* HERO */}
      <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
          <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px]" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
            <Sparkles size={12} />
            Transparent Pricing — No Hidden Fees
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
            Legal Intelligence,{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
              Your Price
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            From ₹0 for citizens to ₹2,999 for law firms. Every plan is backed by the full power of{' '}
            <span className="text-white font-semibold">Indian Kanoon database</span> and{' '}
            <span className="text-white font-semibold">Gemini AI</span>.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${billing === 'monthly' ? 'bg-white text-[#020617] shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${billing === 'yearly' ? 'bg-white text-[#020617] shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Yearly
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
                Save 30%
              </span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* PRICING CARDS */}
      <section className="px-4 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon
            const sv = savings(plan)
            const isPopular = plan.badge === 'Most Popular'
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className={`relative flex flex-col rounded-3xl border ${plan.borderColor} bg-gradient-to-b ${plan.color} backdrop-blur-xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${plan.glowColor} ${isPopular ? 'ring-2 ring-blue-500/50' : ''}`}
              >
                {/* Popular ribbon */}
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${plan.badgeColor} border border-current/30 whitespace-nowrap`}>
                    {plan.badge === 'Most Popular' && <Flame size={10} className="inline mr-1" />}
                    {plan.badge === 'Best for Advocates' && <Crown size={10} className="inline mr-1" />}
                    {plan.badge === 'For Law Firms' && <Building2 size={10} className="inline mr-1" />}
                    {plan.badge}
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6 pt-2">
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 ${plan.accentColor}`}>
                    <Icon size={22} />
                  </div>
                  <h2 className="text-xl font-black text-white mb-1">{plan.name}</h2>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white">
                      {plan.priceDisplay[billing]}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-slate-500 text-sm mb-1.5 font-medium">
                        /{billing === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>
                  {billing === 'yearly' && sv && (
                    <p className="text-xs text-emerald-400 font-bold mt-1">
                      🎉 Save ₹{sv.saved.toLocaleString()} ({sv.pct}% off)
                    </p>
                  )}
                  {billing === 'monthly' && plan.price.monthly > 0 && (
                    <p className="text-xs text-slate-600 mt-1">
                      Switch to yearly → save {savings(plan)?.pct}%
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 active:scale-95 mb-6 ${plan.ctaStyle} ${loading === plan.id ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {loading === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {plan.cta}
                      <ArrowRight size={14} />
                    </span>
                  )}
                </button>

                {/* Divider */}
                <div className="border-t border-white/5 mb-6" />

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${f.included ? `bg-gradient-to-br ${plan.color} border ${plan.borderColor}` : 'bg-white/5 border border-white/5'}`}>
                        {f.included
                          ? <Check size={10} className={plan.accentColor} strokeWidth={3} />
                          : <X size={10} className="text-slate-700" strokeWidth={3} />
                        }
                      </div>
                      <div className="flex-1">
                        <span className={`text-xs ${f.included ? 'text-slate-300' : 'text-slate-600'} font-medium`}>
                          {f.label}
                        </span>
                        {f.value && f.included && (
                          <span className={`block text-[10px] font-black ${plan.accentColor} mt-0.5`}>
                            {f.value}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* SPECIAL OFFERS STRIP */}
      <section className="px-4 pb-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: BookOpen,
              title: 'Law Student Discount',
              description: '60% off Nyay Pro — just ₹119/month with a valid college ID.',
              color: 'text-blue-400',
              bg: 'bg-blue-500/5 border-blue-500/20',
              cta: 'Claim Discount',
              href: 'mailto:support@nyaynow.in?subject=Student Discount Claim'
            },
            {
              icon: BadgeCheck,
              title: 'Legal Aid NGOs — Free Gold',
              description: 'Verified legal aid clinics and NGOs get Nyay Gold completely free.',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/5 border-emerald-500/20',
              cta: 'Apply Now',
              href: 'mailto:support@nyaynow.in?subject=NGO Free Plan Application'
            },
            {
              icon: Users,
              title: 'Bar Council Licensing',
              description: 'Bulk licensing for Bar Associations at ₹399/advocate/month.',
              color: 'text-amber-400',
              bg: 'bg-amber-500/5 border-amber-500/20',
              cta: 'Talk to Us',
              href: 'mailto:enterprise@nyaynow.in?subject=Bar Council Licensing'
            }
          ].map((offer, i) => {
            const Icon = offer.icon
            return (
              <a
                key={i}
                href={offer.href}
                className={`flex flex-col gap-4 p-6 rounded-3xl border ${offer.bg} hover:-translate-y-1 transition-all duration-300 group`}
              >
                <div className={`w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${offer.color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className={`font-black text-white text-base mb-1 ${offer.color}`}>{offer.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{offer.description}</p>
                </div>
                <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1 ${offer.color}`}>
                  {offer.cta} <ArrowRight size={12} />
                </span>
              </a>
            )
          })}
        </motion.div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="px-4 pb-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-black text-white mb-3">Why Upgrade?</h2>
          <p className="text-slate-500 text-lg">The numbers make the decision for you.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              plan: 'Nyay Pro — ₹299/month',
              color: 'text-blue-400',
              border: 'border-blue-500/20',
              bg: 'bg-blue-500/5',
              icon: TrendingUp,
              stat: '₹9,000+',
              label: 'saved in lawyer consultation fees monthly',
              detail: 'One consultation with a lawyer in Tier-1 cities costs ₹2,000–₹5,000. Pro users save this every time they use the AI.'
            },
            {
              plan: 'Nyay Gold — ₹799/month',
              color: 'text-amber-400',
              border: 'border-amber-500/20',
              bg: 'bg-amber-500/5',
              icon: Clock,
              stat: '15+ hours',
              label: 'of legal research time saved per case',
              detail: 'At ₹500/hr for a junior associate, that\'s ₹7,500 in time saved per case. Gold pays for itself in the very first brief.'
            },
            {
              plan: 'Nyay Firm — ₹2,999/month',
              color: 'text-violet-400',
              border: 'border-violet-500/20',
              bg: 'bg-violet-500/5',
              icon: Building2,
              stat: '₹20,000+',
              label: 'vs. one junior associate\'s monthly salary',
              detail: 'Replace or augment a full-time legal intern with Firm. 10 team seats + unlimited everything for 85% less cost.'
            }
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-8 rounded-3xl border ${item.border} ${item.bg}`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${item.color} mb-6`}>
                  <Icon size={22} />
                </div>
                <div className={`text-4xl font-black ${item.color} mb-1`}>{item.stat}</div>
                <div className="text-white font-bold text-base mb-3">{item.label}</div>
                <p className="text-slate-500 text-sm leading-relaxed">{item.detail}</p>
                <div className={`mt-4 text-xs font-black ${item.color} uppercase tracking-wider`}>{item.plan}</div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 pb-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-black text-white mb-3">Trusted by Legal Professionals</h2>
          <p className="text-slate-500 text-lg">Real results from real users across India.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-3xl bg-white/[0.03] border border-white/5"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, si) => (
                  <Star key={si} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs">{t.role}</div>
                  <div className={`text-[10px] font-black uppercase tracking-wider mt-0.5 ${t.planColor}`}>{t.plan}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-24 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-black text-white mb-3">Frequently Asked Questions</h2>
          <p className="text-slate-500">Still have doubts? We have you covered.</p>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-bold text-white text-sm pr-4">{faq.q}</span>
                <div className="flex-shrink-0 text-slate-500">
                  {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="px-4 pb-32 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative p-1 rounded-[40px] bg-gradient-to-b from-blue-500/30 to-violet-500/20"
        >
          <div className="bg-[#020617] rounded-[38px] px-8 py-16 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[80px]" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
                <Shield size={12} /> 7-Day Money-Back Guarantee
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Start free. Upgrade when ready.
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                No credit card required. Cancel anytime. Every paid plan comes with a full 7-day refund guarantee.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-2xl bg-white text-[#020617] font-black text-sm uppercase tracking-wider hover:bg-blue-500 hover:text-white transition-all duration-500 shadow-xl flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} /> Get Started Free
                </Link>
                <Link
                  href="/assistant"
                  className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-wider hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Try the AI First <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
