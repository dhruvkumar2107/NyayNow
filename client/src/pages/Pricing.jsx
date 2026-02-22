import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Shield, Star, ArrowRight, Lock, RefreshCw, Headphones, ChevronDown, Sparkles, Building2, Users2, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Pricing = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [userType, setUserType] = useState('client');
  const [openFaq, setOpenFaq] = useState(null);

  const handleUpgrade = (plan, price) => {
    if (price === 'Free') {
      if (!user) window.location.href = '/register';
      else toast.success("You're already on the free plan!");
      return;
    }
    if (!user) {
      toast.error("Please log in to upgrade your plan.");
      setTimeout(() => window.location.href = '/login', 1200);
      return;
    }
    toast.loading(`Initiating ${plan} Plan upgrade...`, { duration: 2000 });
    setTimeout(() => {
      toast.success("Payment integration coming soon! Email nyaynow.in@gmail.com for early access.", { duration: 6000 });
    }, 2100);
  };

  const clientPlans = [
    {
      name: "Basic",
      price: { monthly: "Free", yearly: "Free" },
      period: "",
      savings: null,
      tagline: "Essential legal help for every Indian citizen, forever.",
      features: [
        '5 AI Legal Q&A per day',
        'Lawyer Marketplace Access',
        'Basic Document Templates',
        'Community Forum Access',
        'Legal SOS (Emergency)',
      ],
      cta: 'Get Started Free',
      color: 'slate',
      icon: Shield,
      highlight: false,
      popular: false,
    },
    {
      name: "Pro",
      price: { monthly: "₹499", yearly: "₹399" },
      period: "/mo",
      savings: "Save ₹1,200/yr",
      tagline: "Unlimited AI power for individuals and families.",
      features: [
        'Unlimited AI Legal Chat',
        'Document Drafting (10/mo)',
        'Legal Research Access',
        'Priority Support (24hrs)',
        'FIR Draft Generator',
        'Emergency Legal SOS',
        'NyayVoice (10 languages)',
      ],
      cta: 'Start Pro — Free Trial',
      color: 'indigo',
      icon: Zap,
      highlight: true,
      popular: true,
    },
    {
      name: "Premium",
      price: { monthly: "₹1,499", yearly: "₹1,199" },
      period: "/mo",
      savings: "Save ₹3,600/yr",
      tagline: "Complete legal protection for families and businesses.",
      features: [
        'Everything in Pro',
        '1 Lawyer Consultation/mo',
        'Agreement Review & Analysis',
        'Dedicated Case Manager',
        'NyayCourt Battle Simulator',
        'DevilsAdvocate AI',
        'Priority HD Video Calls',
      ],
      cta: 'Go Premium',
      color: 'amber',
      icon: Star,
      highlight: false,
      popular: false,
    },
  ];

  const lawyerPlans = [
    {
      name: "Starter",
      price: { monthly: "Free", yearly: "Free" },
      period: "",
      savings: null,
      tagline: "Build your digital presence and start getting clients.",
      features: [
        'Basic Profile Listing',
        'Accept Client Inquiries',
        '5 AI Research Queries/day',
        'Access to Legal Forum',
        'Case File Analyzer (3/mo)',
      ],
      cta: 'Create Profile Free',
      color: 'slate',
      icon: Shield,
      highlight: false,
      popular: false,
    },
    {
      name: "Professional",
      price: { monthly: "₹1,999", yearly: "₹1,599" },
      period: "/mo",
      savings: "Save ₹4,800/yr",
      tagline: "Grow your practice with AI tools and verified leads.",
      features: [
        'Verified Badge ✓',
        '10 Qualified Leads/mo',
        'Unlimited AI Research',
        'Case Management Dashboard',
        'Client CRM Access',
        'Priority Listing in Search',
        'NyayCourt Simulator',
      ],
      cta: 'Start Growing',
      color: 'indigo',
      icon: Zap,
      highlight: true,
      popular: true,
    },
    {
      name: "Elite",
      price: { monthly: "₹4,999", yearly: "₹3,999" },
      period: "/mo",
      savings: "Save ₹12,000/yr",
      tagline: "Dominate your legal niche with unlimited AI power.",
      features: [
        'Top Search Placement',
        'Unlimited Qualified Leads',
        'AI Paralegal Assistant',
        'Moot Court VR Access',
        'Dedicated Account Manager',
        'White-label Client Portal',
        'Analytics Dashboard',
      ],
      cta: 'Become Elite',
      color: 'amber',
      icon: Star,
      highlight: false,
      popular: false,
    },
  ];

  const plans = userType === 'client' ? clientPlans : lawyerPlans;

  const faqs = [
    {
      q: "Is there really a free plan with no credit card?",
      a: "Yes, absolutely. Basic access to NyayNow — including AI legal Q&A, marketplace access, and Legal SOS — is completely free for every Indian citizen, forever. No credit card required, no trial expiry."
    },
    {
      q: "Can I switch between plans anytime?",
      a: "Yes. You can upgrade, downgrade, or cancel your plan at any time from your account settings. If you cancel, you'll retain access until the end of your current billing period."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major UPI apps (GPay, PhonePe, Paytm), credit/debit cards (Visa, Mastercard, RuPay), net banking, and EMI options via Razorpay — India's most trusted payment gateway."
    },
    {
      q: "Is my legal data secure and confidential?",
      a: "Absolutely. All data is encrypted end-to-end using AES-256. We are PDPA compliant and do not share your legal queries, documents, or case details with any third party, ever."
    },
    {
      q: "Do you offer plans for law firms and government bodies?",
      a: "Yes! We offer custom enterprise plans with dedicated infrastructure, volume pricing, API access, and SLA guarantees. Contact us at nyaynow.in@gmail.com for a tailored quote."
    },
  ];

  const colorMap = {
    slate: {
      glow: 'from-slate-500/10 to-slate-600/5',
      border: 'border-white/10 hover:border-white/20',
      badge: '',
      iconBg: 'bg-slate-700/50',
      checkBg: 'bg-slate-600/50',
      btn: 'bg-white/10 hover:bg-white/15 text-white border border-white/10',
      price: 'text-white',
      tag: 'text-slate-400',
    },
    indigo: {
      glow: 'from-indigo-500/20 to-violet-500/10',
      border: 'border-indigo-500/50',
      badge: 'Most Popular',
      iconBg: 'bg-indigo-500/20',
      checkBg: 'bg-indigo-500',
      btn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30',
      price: 'text-white',
      tag: 'text-indigo-300',
    },
    amber: {
      glow: 'from-amber-500/15 to-orange-500/5',
      border: 'border-amber-500/30 hover:border-amber-400/50',
      badge: '',
      iconBg: 'bg-amber-500/15',
      checkBg: 'bg-amber-500/50',
      btn: 'bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black hover:from-amber-300 hover:to-amber-500 shadow-lg shadow-amber-500/20',
      price: 'text-amber-300',
      tag: 'text-amber-400/70',
    },
  };

  return (
    <div className="min-h-screen bg-[#0c1220] text-slate-400 font-sans selection:bg-indigo-500/30">
      <Navbar />

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 overflow-hidden text-center">
        {/* Background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-500/8 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-6"
          >
            <Sparkles size={12} className="text-amber-400" />
            Simple, Honest Pricing
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-5xl md:text-7xl font-serif font-bold text-white leading-[1.05] mb-6"
          >
            Invest in your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-500">
              legal future.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
          >
            No hidden fees. No complicated tiers. Whether you seek justice or deliver it — there's a plan built for you.
          </motion.p>

          {/* USER TYPE TOGGLE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="relative inline-flex bg-[#0f172a] border border-white/10 p-1.5 rounded-2xl shadow-inner gap-1">
              {['client', 'lawyer'].map((type) => (
                <button
                  key={type}
                  onClick={() => setUserType(type)}
                  className={`relative px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 capitalize flex items-center gap-2 ${userType === type
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {type === 'client' ? <Users2 size={16} /> : <Building2 size={16} />}
                  For {type === 'client' ? 'Individuals' : 'Lawyers'}
                </button>
              ))}
            </div>
          </motion.div>

          {/* BILLING TOGGLE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <span className={`text-sm font-bold transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
            <button
              onClick={() => setBillingCycle(c => c === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-7 bg-[#0f172a] border border-white/10 rounded-full transition-all"
            >
              <motion.div
                animate={{ x: billingCycle === 'yearly' ? 26 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-5 h-5 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50"
              />
            </button>
            <span className={`text-sm font-bold transition-colors flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500'}`}>
              Annual
              <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black">Save 20%</span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING CARDS ─────────────────────────────────── */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={userType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-3 gap-6 items-start"
            >
              {plans.map((plan, idx) => {
                const c = colorMap[plan.color];
                const Icon = plan.icon;
                const currentPrice = plan.price[billingCycle];

                return (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative group flex flex-col rounded-3xl border ${c.border} bg-gradient-to-b ${c.glow} backdrop-blur-xl p-8 transition-all duration-500 ${plan.popular ? 'shadow-[0_0_60px_-10px_rgba(99,102,241,0.4)] md:-translate-y-3' : 'hover:-translate-y-2 hover:shadow-xl'}`}
                  >
                    {/* Popular badge */}
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="px-5 py-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-500/30 flex items-center gap-1.5">
                          <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          Most Popular
                        </div>
                      </div>
                    )}

                    {/* Icon + name */}
                    <div className={`w-12 h-12 rounded-2xl ${c.iconBg} flex items-center justify-center mb-5`}>
                      <Icon size={22} className={plan.color === 'amber' ? 'text-amber-400' : plan.color === 'indigo' ? 'text-indigo-400' : 'text-slate-400'} />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className={`text-sm mb-6 ${c.tag}`}>{plan.tagline}</p>

                    {/* Price */}
                    <div className="mb-1 flex items-end gap-1.5">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={currentPrice}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={`text-5xl font-serif font-bold ${c.price}`}
                        >
                          {currentPrice}
                        </motion.span>
                      </AnimatePresence>
                      {plan.period && (
                        <span className="text-slate-500 text-sm pb-2">{plan.period}</span>
                      )}
                    </div>

                    {billingCycle === 'yearly' && plan.savings && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-5 inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full"
                      >
                        🎉 {plan.savings}
                      </motion.div>
                    )}
                    {!(billingCycle === 'yearly' && plan.savings) && <div className="mb-5" />}

                    {/* Divider */}
                    <div className="h-px bg-white/5 mb-6" />

                    {/* Feature list */}
                    <ul className="space-y-3.5 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full ${c.checkBg} flex items-center justify-center flex-shrink-0`}>
                            <Check size={11} className="text-white" strokeWidth={3} />
                          </div>
                          <span className="text-sm text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleUpgrade(plan.name, currentPrice)}
                      className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 ${c.btn}`}
                    >
                      {plan.cta}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* TRUST ROW */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-8 mt-14 pt-10 border-t border-white/5"
          >
            {[
              { icon: Lock, text: "Secured by Razorpay" },
              { icon: RefreshCw, text: "Cancel Anytime" },
              { icon: Headphones, text: "24/7 Live Support" },
              { icon: Shield, text: "PDPA Compliant" },
              { icon: Globe, text: "Available in 10 Languages" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-slate-500 text-sm font-semibold hover:text-slate-300 transition">
                <Icon size={16} className="text-indigo-400/70" />
                {text}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-serif font-bold text-white mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
            <p className="text-slate-400">Everything you need to know about NyayNow pricing.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-7 py-5 flex items-center justify-between text-left group"
                >
                  <span className={`font-semibold text-sm transition-colors ${openFaq === i ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 ml-4"
                  >
                    <ChevronDown size={18} className={openFaq === i ? 'text-indigo-400' : 'text-slate-500'} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-7 pb-6 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ENTERPRISE CTA ─────────────────────────────────── */}
      <section className="py-12 px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0f172a] via-indigo-950/30 to-[#0f172a] p-0"
          >
            {/* Background glows */}
            <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-indigo-500/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[200px] bg-violet-500/10 blur-[80px] pointer-events-none" />
            {/* Top separator line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            <div className="relative z-10 p-12 md:p-16 flex flex-col md:flex-row items-center gap-10 justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-5">
                  <Building2 size={12} />
                  Enterprise & Government
                </div>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
                  Need a custom plan?<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">We'll build it for you.</span>
                </h3>
                <p className="text-slate-400 max-w-lg text-base leading-relaxed">
                  Custom API access, dedicated infrastructure, volume pricing, white-labeling, and SLA guarantees for law firms, banks, courts, and government bodies.
                </p>
              </div>

              <div className="flex flex-col gap-4 text-center flex-shrink-0">
                <Link
                  to="/contact"
                  className="group px-10 py-5 bg-white text-slate-900 font-bold rounded-2xl hover:bg-amber-50 transition-all duration-300 shadow-2xl flex items-center gap-3 whitespace-nowrap active:scale-95"
                >
                  Contact Sales
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-slate-600 text-xs">Response within 4 business hours</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
