'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Shield, Star, ArrowRight, Lock, RefreshCw, Headphones, ChevronDown, Sparkles, Building2, Users2, Globe, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '../../src/context/AuthContext';

const Pricing = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'
  const [openFaq, setOpenFaq] = useState(null);

  const _envBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  const API_BASE = _envBase.endsWith('/api') ? _envBase : `${_envBase}/api`;

  const loadScript = (src) => {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (plan, price) => {
    try {
      if (price === 'Free' || price === 0 || price === '₹0') {
        if (!user) window.location.href = '/register';
        else toast.success("You're already on the free plan!");
        return;
      }
      if (!user) {
        toast.error("Please log in to upgrade your plan.");
        setTimeout(() => window.location.href = '/login', 1200);
        return;
      }

      toast.loading(`Initiating ${plan} Plan upgrade...`, { id: 'upgrade-toast' });

      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) {
        toast.error("Razorpay SDK failed to load. Check your connection.", { id: 'upgrade-toast' });
        return;
      }

      console.log("DEBUG: handleUpgrade input:", { plan, price });
      
      const priceStr = String(price || "");
      const amount_rupees = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
      
      let mappedPlan = plan?.toLowerCase();
      if (mappedPlan === "pro") mappedPlan = "pro";
      if (mappedPlan === "firm") mappedPlan = "firm";

      console.log("DEBUG: Final payload:", { amount_rupees, plan: mappedPlan });

      if (amount_rupees <= 0) {
        throw new Error("Invalid price detected. Please refresh and try again.");
      }

      const token = localStorage.getItem("token");
      const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ amount_rupees, plan: mappedPlan, billingCycle })
      });

      if (!orderRes.ok) {
        const errText = await orderRes.text();
        console.error("Server Error Response:", errText);
        throw new Error(`Failed to create order: ${orderRes.status} ${errText}`);
      }
      
      const orderData = await orderRes.json();

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NyayNow",
        description: `Upgrade to ${plan} (${billingCycle})`,
        order_id: orderData.orderId,
        handler: async function (response) {
          toast.loading("Verifying payment...", { id: "upgrade-toast" });
          try {
            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: mappedPlan,
                amount: amount_rupees
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast.success(`Successfully upgraded to ${plan}!`, { id: "upgrade-toast", duration: 5000 });
              setTimeout(() => window.location.reload(), 2000);
            } else {
              toast.error("Payment verification failed", { id: "upgrade-toast" });
            }
          } catch (err) {
            console.error("Verification Error:", err);
            toast.error("Error during verification", { id: "upgrade-toast" });
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#6366f1"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        toast.error("Payment Failed: " + response.error.description, { id: "upgrade-toast" });
      });
      paymentObject.open();
      toast.dismiss('upgrade-toast');
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to initiate payment", { id: "upgrade-toast" });
    }
  };

  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      tagline: "Essential legal help for every Indian citizen, forever.",
      features: [
        '5 AI Legal Q&A queries per day',
        'Basic Lawyer Directory Search',
        'Basic document drafting preview',
        'Immediate Legal SOS (Emergency Mode)',
        'Data not used for AI model training'
      ],
      cta: 'Get Started Free',
      color: 'slate',
      icon: Shield,
      highlight: false,
      popular: false,
    },
    {
      name: "Pro",
      price: billingCycle === 'monthly' ? "₹499" : "₹4,990",
      period: billingCycle === 'monthly' ? "month" : "year",
      savings: billingCycle === 'annual' ? "Save 17% (2 months free)" : null,
      tagline: "Unlimited AI capabilities for individuals and professionals.",
      features: [
        'Unlimited AI Legal Assistant Queries',
        'Judge AI outcome prediction (10/mo)',
        'Draft Notice / Agreements Generator',
        'Grounded Precedent Research Engine',
        'NyayVoice (Multilingual voice assistant)',
        'Case status tracker & calendar sync',
        'Email customer support'
      ],
      cta: 'Start Pro',
      color: 'indigo',
      icon: Zap,
      highlight: true,
      popular: true,
    },
    {
      name: "Firm",
      price: billingCycle === 'monthly' ? "₹4,999" : "₹49,990",
      period: billingCycle === 'monthly' ? "month" : "year",
      savings: billingCycle === 'annual' ? "Save 17% (2 months free)" : null,
      tagline: "Complete legal intelligence and pipeline CRM for firms.",
      features: [
        'Everything in Pro (Unlimited)',
        'Moot Court Trial Simulator (VR)',
        'Devil\'s Advocate critique model',
        'Unlimited Judge AI Strategy Dossiers',
        'Multi-user account (up to 5 users)',
        'Practice Console CRM for client tracking',
        'Dedicated 24/7 account support'
      ],
      cta: 'Go Firm',
      color: 'amber',
      icon: Star,
      highlight: false,
      popular: false,
    },
  ];

  const faqs = [
    {
      q: "Is there really a free plan with no credit card?",
      a: "Yes, absolutely. Basic access to NyayNow — including AI legal information, marketplace directory, and Legal SOS — is completely free for every Indian citizen. No payment credentials required."
    },
    {
      q: "What is the difference between Monthly and Annual billing?",
      a: "Our annual plans are charged upfront for 12 months at a discounted rate, giving you 2 months free (saving 17%). Monthly plans are charged every month and can be canceled anytime."
    },
    {
      q: "Can I cancel my subscription or change plans?",
      a: "Yes. You can upgrade, downgrade, or cancel your subscription at any time directly through your account dashboard settings. If you cancel, your premium benefits will remain active until the end of your billing cycle."
    },
    {
      q: "Is my case data secure and confidential?",
      a: "Absolutely. All documents, uploads, and AI queries are encrypted using industry-standard AES-256 protocols. Furthermore, we explicitly guarantee under our DPDP 2023 compliance that your data is never used to train our AI models."
    },
    {
      q: "How does the Razorpay billing work?",
      a: "We route all payments through Razorpay, India's most secure and compliant payment gateway. You can pay using UPI (GPay, PhonePe, Paytm), NetBanking, Credit/Debit cards, or wallet systems."
    },
  ];

  const colorMap = {
    slate: {
      glow: 'from-slate-500/10 to-slate-600/5',
      border: 'border-white/10 hover:border-white/20',
      iconBg: 'bg-slate-700/50',
      checkBg: 'bg-slate-600/50',
      btn: 'bg-white/10 hover:bg-white/15 text-white border border-white/10',
      price: 'text-white',
      tag: 'text-slate-400',
    },
    indigo: {
      glow: 'from-indigo-500/20 to-violet-500/10',
      border: 'border-indigo-500/50 hover:border-indigo-400',
      iconBg: 'bg-indigo-500/20',
      checkBg: 'bg-indigo-500',
      btn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-300',
      price: 'text-white',
      tag: 'text-indigo-300',
    },
    amber: {
      glow: 'from-amber-500/15 to-orange-500/5',
      border: 'border-amber-500/30 hover:border-amber-400/50',
      iconBg: 'bg-amber-500/15',
      checkBg: 'bg-amber-500/50',
      btn: 'bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black hover:from-amber-300 hover:to-amber-500 shadow-lg shadow-amber-500/20',
      price: 'text-amber-300',
      tag: 'text-amber-400/70',
    },
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-400 font-sans selection:bg-indigo-500/30">

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-500/8 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-6"
          >
            <Sparkles size={12} className="text-indigo-400" />
            Simple, Transparent Pricing
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6"
          >
            Powering India's <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-extrabold">
              Legal Future.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
          >
            No hidden costs. No complicated tiers. Professional legal intelligence and case automation accessible to everyone.
          </motion.p>

          {/* BILLING CYCLE TOGGLE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="relative inline-flex bg-white/5 border border-white/10 p-1.5 rounded-2xl shadow-inner gap-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`relative px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 capitalize ${billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`relative px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 capitalize flex items-center gap-2 ${billingCycle === 'annual'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                Annual
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded ${billingCycle === 'annual' ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  Save 17%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING CARDS ─────────────────────────────────── */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, idx) => {
              const c = colorMap[plan.color];
              const Icon = plan.icon;
              const currentPrice = plan.price;

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative group flex flex-col rounded-[32px] border ${c.border} bg-gradient-to-b ${c.glow} backdrop-blur-xl p-8 transition-all duration-500 ${plan.popular ? 'shadow-[0_0_60px_-10px_rgba(99,102,241,0.3)] md:-translate-y-3' : 'hover:-translate-y-2 hover:shadow-xl'}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="px-5 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-indigo-500/30 flex items-center gap-1.5">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-2xl ${c.iconBg} flex items-center justify-center mb-6`}>
                    <Icon size={22} className={plan.color === 'amber' ? 'text-amber-400' : plan.color === 'indigo' ? 'text-indigo-400' : 'text-slate-400'} />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className={`text-xs mb-6 font-medium ${c.tag}`}>{plan.tagline}</p>

                  <div className="mb-4 flex items-end gap-1.5">
                    <span className={`text-5xl font-bold ${c.price}`}>{currentPrice}</span>
                    {plan.period && (
                      <span className="text-slate-500 text-sm pb-1.5">/{plan.period}</span>
                    )}
                  </div>

                  {plan.savings && (
                    <div className="mb-4 text-emerald-400 text-xs font-bold bg-emerald-500/5 border border-emerald-500/10 rounded-lg py-1 px-2.5 inline-block self-start">
                      {plan.savings}
                    </div>
                  )}

                  <div className="h-px bg-white/5 my-6" />

                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full ${c.checkBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check size={11} className="text-white" strokeWidth={3} />
                        </div>
                        <span className="text-sm text-slate-300 font-medium leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.name, currentPrice)}
                    className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 ${c.btn}`}
                  >
                    {plan.cta}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white font-serif mb-4">Compare Features</h2>
            <p className="text-slate-400">Choose the optimal plan for your legal needs.</p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#030712] shadow-2xl">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-6 text-sm font-bold text-white uppercase tracking-wider">Feature</th>
                  <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-wider text-center">Free</th>
                  <th className="p-6 text-sm font-bold text-indigo-400 uppercase tracking-wider text-center">Pro</th>
                  <th className="p-6 text-sm font-bold text-amber-400 uppercase tracking-wider text-center">Firm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: "Daily AI Queries", free: "5 queries", pro: "Unlimited", firm: "Unlimited" },
                  { name: "AI Drafting Lab", free: "Preview only", pro: "10 drafts/mo", firm: "Unlimited" },
                  { name: "Judge AI Prediction", free: "1 trial", pro: "10/mo", firm: "Unlimited" },
                  { name: "VR Moot Court Simulator", free: "✕", pro: "✕", firm: "Unlimited" },
                  { name: "Devil's Advocate Critic", free: "✕", pro: "✕", firm: "Unlimited" },
                  { name: "Multi-Language (NyayVoice)", free: "Basic", pro: "Full support", firm: "Full support" },
                  { name: "Case Tracker Sync", free: "✕", pro: "✓", firm: "✓" },
                  { name: "Team Accounts", free: "✕", pro: "✕", firm: "Up to 5 users" },
                  { name: "White-Label Client CRM", free: "✕", pro: "✕", firm: "✓" },
                  { name: "Customer Support", free: "Forum", pro: "Priority Email", firm: "24/7 Dedicated" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 text-sm font-medium text-slate-300">{row.name}</td>
                    <td className="p-6 text-sm text-slate-500 text-center">{row.free}</td>
                    <td className="p-6 text-sm text-indigo-300 font-bold text-center">{row.pro}</td>
                    <td className="p-6 text-sm text-amber-300 font-bold text-center">{row.firm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 flex flex-col items-center">
            <HelpCircle size={40} className="text-indigo-500 mb-4" />
            <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400">Answers to common questions about subscriptions and payments.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-7 py-5 flex items-center justify-between text-left group"
                >
                  <span className={`font-semibold text-base transition-colors ${openFaq === i ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 ml-4"
                  >
                    <ChevronDown size={18} className={openFaq === i ? 'text-indigo-400' : 'text-slate-400'} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-7 pb-6 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST BADGES ───────────────────────────────────── */}
      <section className="py-12 border-t border-white/5 bg-[#030712]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { icon: Lock, text: "Secured by Razorpay" },
              { icon: RefreshCw, text: "Cancel Subscription Anytime" },
              { icon: Headphones, text: "Dedicated Support Team" },
              { icon: Shield, text: "DPDP 2023 Compliant" }
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <Icon size={14} className="text-indigo-500/80" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
