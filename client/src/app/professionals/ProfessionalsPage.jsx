'use client'

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import {
  Gavel, Zap, Shield, Brain, BookOpen, FileText, Users,
  BarChart3, MessageSquare, Scale, Mic, Swords, TrendingUp,
  Globe, Lock, CheckCircle, ArrowRight, Star, ChevronRight,
  Video, Bell, Sparkles, Database, Cpu, Building2, Award,
  LayoutDashboard, Clock, RefreshCw, Layers
} from 'lucide-react';

// ─── ANIMATED COUNTER ─────────────────────────────────────
function AnimatedCounter({ value, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(value);
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── FEATURE CARD ─────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, badge, color, delay = 0, href }) {
  const colorMap = {
    indigo: { bg: 'from-indigo-500/20 to-indigo-600/5', border: 'border-indigo-500/20 hover:border-indigo-400/50', icon: 'text-indigo-400', glow: 'hover:shadow-indigo-500/10', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    violet: { bg: 'from-violet-500/20 to-violet-600/5', border: 'border-violet-500/20 hover:border-violet-400/50', icon: 'text-violet-400', glow: 'hover:shadow-violet-500/10', badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
    cyan: { bg: 'from-cyan-500/20 to-cyan-600/5', border: 'border-cyan-500/20 hover:border-cyan-400/50', icon: 'text-cyan-400', glow: 'hover:shadow-cyan-500/10', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    emerald: { bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20 hover:border-emerald-400/50', icon: 'text-emerald-400', glow: 'hover:shadow-emerald-500/10', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    amber: { bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/20 hover:border-amber-400/50', icon: 'text-amber-400', glow: 'hover:shadow-amber-500/10', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    rose: { bg: 'from-rose-500/20 to-rose-600/5', border: 'border-rose-500/20 hover:border-rose-400/50', icon: 'text-rose-400', glow: 'hover:shadow-rose-500/10', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    fuchsia: { bg: 'from-fuchsia-500/20 to-fuchsia-600/5', border: 'border-fuchsia-500/20 hover:border-fuchsia-400/50', icon: 'text-fuchsia-400', glow: 'hover:shadow-fuchsia-500/10', badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' },
    teal: { bg: 'from-teal-500/20 to-teal-600/5', border: 'border-teal-500/20 hover:border-teal-400/50', icon: 'text-teal-400', glow: 'hover:shadow-teal-500/10', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex flex-col bg-gradient-to-br ${c.bg} border ${c.border} rounded-3xl p-7 hover:shadow-2xl ${c.glow} transition-all duration-500 cursor-pointer overflow-hidden`}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      <div className="flex items-start justify-between mb-5">
        <div className={`p-3 bg-white/5 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition duration-500`}>
          <Icon size={24} className={c.icon} />
        </div>
        {badge && (
          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${c.badge}`}>
            {badge}
          </span>
        )}
      </div>

      <h3 className="text-white font-black text-lg tracking-tight mb-2 group-hover:text-white transition">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed flex-1">{description}</p>

      {href && (
        <div className="mt-5 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition duration-300">
          Try it now <ArrowRight size={12} className="group-hover:translate-x-1 transition" />
        </div>
      )}
    </motion.div>
  );
}

// ─── BENTO HERO CARD ──────────────────────────────────────
function BentoCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-[#0d1526] border border-white/5 rounded-3xl overflow-hidden relative group ${className}`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}

// ─── FLOATING PARTICLE ────────────────────────────────────
function Particle({ style }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-indigo-400/30"
      style={style}
      animate={{
        y: [0, -30, 0],
        opacity: [0.3, 0.8, 0.3],
      }}
      transition={{
        duration: Math.random() * 4 + 3,
        repeat: Infinity,
        delay: Math.random() * 2,
      }}
    />
  );
}

// ─── WORKFLOW STEP ────────────────────────────────────────
function WorkflowStep({ number, title, desc, color, delay }) {
  const colors = {
    indigo: 'from-indigo-500 to-violet-500',
    cyan: 'from-cyan-500 to-teal-500',
    emerald: 'from-emerald-500 to-green-500',
    amber: 'from-amber-500 to-orange-500',
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="flex gap-6 group"
    >
      <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0 group-hover:scale-110 transition duration-300`}>
          {number}
        </div>
        <div className="w-0.5 h-full bg-gradient-to-b from-white/10 to-transparent mt-3" />
      </div>
      <div className="pb-10">
        <h4 className="text-white font-black text-xl mb-2 tracking-tight">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

// ─── TESTIMONIAL ──────────────────────────────────────────
function TestimonialCard({ quote, name, role, court, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="bg-[#0d1526] border border-white/5 rounded-3xl p-8 hover:border-indigo-500/20 transition duration-500 group"
    >
      <div className="flex gap-1 mb-5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
        ))}
      </div>
      <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {name[0]}
        </div>
        <div>
          <p className="text-white font-bold text-sm">{name}</p>
          <p className="text-slate-500 text-xs">{role} • {court}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ═══ MAIN COMPONENT ═══════════════════════════════════════
export default function ProfessionalsPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  const [activeFeatureTab, setActiveFeatureTab] = useState('ai');

  const featureTabs = [
    { id: 'ai', label: 'AI Intelligence', icon: Brain },
    { id: 'court', label: 'Courtroom Tools', icon: Gavel },
    { id: 'research', label: 'Legal Research', icon: BookOpen },
    { id: 'clients', label: 'Client Management', icon: Users },
    { id: 'docs', label: 'Document Suite', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const featureDetails = {
    ai: {
      title: 'AI Legal Intelligence Engine',
      subtitle: 'Powered by Gemini 1.5 Pro with real-time legal grounding',
      features: [
        { name: 'Judge AI — Case Outcome Prediction', desc: 'Upload case files and get AI-powered win probability, risk analysis, and strategic recommendations.', icon: Scale },
        { name: 'NyayVoice — Multilingual Assistant', desc: 'Voice-first legal assistant in Hindi, Tamil, Telugu, Kannada, Marathi & English.', icon: Mic },
        { name: 'Devil\'s Advocate Critique', desc: 'AI stress-tests your arguments from the opposition\'s perspective.', icon: Brain },
        { name: 'BNS/IPC Instant Analysis', desc: 'Section-level analysis grounded in BNS 2024 and legacy IPC for all criminal matters.', icon: Zap },
      ]
    },
    court: {
      title: 'Courtroom Simulation Suite',
      subtitle: 'Practice, prepare, and perfect your courtroom strategy',
      features: [
        { name: 'NyayCourt Battle Simulator', desc: 'Real-time adversarial arguments between Prosecution and Defence AI with live scoring.', icon: Swords },
        { name: 'Moot Court VR Practice', desc: 'Full moot court simulation with AI judges giving structured feedback on arguments.', icon: Video },
        { name: 'eCourts Live Integration', desc: 'Real-time case status tracking from eCourts.gov.in directly inside your dashboard.', icon: Globe },
        { name: 'Virtual Courtroom Meetings', desc: 'Encrypted video consultations with clients directly on the platform.', icon: Video },
      ]
    },
    research: {
      title: 'Legal Research Hub',
      subtitle: 'Precedent search powered by real-time web grounding',
      features: [
        { name: 'Grounded Precedent Engine', desc: 'Search thousands of Supreme Court and High Court judgements with AI summarization.', icon: BookOpen },
        { name: 'Live Legal Feed', desc: 'Stay updated with breaking legal news, landmark judgements, and bar council circulars.', icon: Bell },
        { name: 'Section Cross-Reference', desc: 'Instantly cross-reference IPC/BNS sections with supporting case law and punishments.', icon: Database },
        { name: 'AI-Powered Case Intelligence', desc: 'Automatically generate strategy briefs, arguments, and counter-arguments from case documents.', icon: Cpu },
      ]
    },
    clients: {
      title: 'Client CRM & Pipeline',
      subtitle: 'Full-stack practice management for modern law firms',
      features: [
        { name: 'Lead Pool & Case Intake', desc: 'Receive verified client leads directly. Accept and convert in one click.', icon: Users },
        { name: 'Kanban Case Lifecycle Board', desc: 'Visual drag-and-drop pipeline to manage every case stage from intake to closure.', icon: Layers },
        { name: 'Appointment Scheduler', desc: 'Integrated calendar with client-facing booking, reminders, and video links.', icon: Clock },
        { name: 'Connection Network', desc: 'Build your professional network with verified advocates and co-counselors.', icon: Building2 },
      ]
    },
    docs: {
      title: 'AI Document Suite',
      subtitle: 'Generate court-ready documents in seconds',
      features: [
        { name: 'Legal Notice Generator', desc: 'AI-drafted Section 80 notices, demand notices, and RTI applications with auto-filling.', icon: FileText },
        { name: 'AI Drafting Lab', desc: 'Full contract, affidavit, and agreement drafting with clause-by-clause AI guidance.', icon: FileText },
        { name: 'Rent Agreement Builder', desc: 'Generate legally valid rent agreements with digital signatures in minutes.', icon: FileText },
        { name: 'Smart Invoice System', desc: 'Generate, send, and track professional invoices with Razorpay-powered escrow payments.', icon: TrendingUp },
      ]
    },
    analytics: {
      title: 'Performance Analytics',
      subtitle: 'Data-driven insights to grow your practice',
      features: [
        { name: 'Revenue Analytics Dashboard', desc: 'Track earnings, invoice status, payment velocity, and practice revenue trends.', icon: BarChart3 },
        { name: 'Case Workload Monitor', desc: 'Visualize case distribution, stage breakdowns, and time-to-resolution metrics.', icon: TrendingUp },
        { name: 'Client Intelligence Panel', desc: 'Client satisfaction, case outcomes, and relationship health scoring.', icon: Award },
        { name: 'Win/Loss Predictor Accuracy', desc: 'Compare Judge AI predictions against actual outcomes to calibrate your strategy.', icon: CheckCircle },
      ]
    }
  };

  const particles = Array.from({ length: 20 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
  }));

  return (
    <div ref={containerRef} className="min-h-screen bg-[#020617] text-slate-400 font-sans selection:bg-indigo-500/30 overflow-x-hidden">







      {/* ─── INTERACTIVE FEATURE TABS ──────────────────────── */}
      <section className="py-16 md:py-28 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-4">Deep Dive into Features</h2>
            <p className="text-slate-400 text-lg font-light">Explore every capability designed for legal professionals.</p>
          </motion.div>

          {/* Tab navigation - horizontally scrollable on mobile */}
          <div className="flex overflow-x-auto no-scrollbar lg:flex-wrap lg:justify-center gap-3 mb-14 pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
            {featureTabs.map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveFeatureTab(id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
                  activeFeatureTab === id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={14} />
                {label}
              </motion.button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {featureDetails[activeFeatureTab] && (
              <motion.div
                key={activeFeatureTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-black text-white tracking-tight mb-2">{featureDetails[activeFeatureTab].title}</h3>
                  <p className="text-slate-400">{featureDetails[activeFeatureTab].subtitle}</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featureDetails[activeFeatureTab].features.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-[#0d1526] border border-white/5 rounded-3xl p-7 hover:border-indigo-500/20 transition duration-300 group"
                    >
                      <div className="p-3 bg-indigo-500/10 rounded-2xl mb-5 w-fit group-hover:bg-indigo-500/20 transition">
                        <f.icon size={22} className="text-indigo-400" />
                      </div>
                      <h4 className="text-white font-black text-sm mb-2 leading-tight">{f.name}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>



      {/* ─── HOW IT WORKS ──────────────────────────────────── */}
      <section className="py-16 md:py-28 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-10 md:gap-20">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-14"
              >
                <span className="inline-block text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-6">
                  How It Works
                </span>
                <h2 className="text-4xl font-black text-white tracking-tighter mb-4">
                  Up and running in minutes, not months.
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  NyayNow is designed to plug into your existing practice without disruption. From onboarding to first AI analysis — it takes under 10 minutes.
                </p>
              </motion.div>

              <WorkflowStep number="01" color="indigo" delay={0} title="Create Your Profile"
                desc="Sign up, complete your Bar Council verified professional profile, and get your DigiLocker-verified advocate badge." />
              <WorkflowStep number="02" color="cyan" delay={0.1} title="Set Up Your Practice"
                desc="Configure your specializations, fee structure, availability, and connect your eCourts case list for automatic syncing." />
              <WorkflowStep number="03" color="emerald" delay={0.2} title="Receive & Accept Leads"
                desc="Get notified of incoming client leads filtered by your practice area. Accept in one tap and initiate AI case analysis instantly." />
              <WorkflowStep number="04" color="amber" delay={0.3} title="Leverage AI Intelligence"
                desc="Run Judge AI predictions, generate documents, research precedents, and prepare courtroom strategies — all powered by AI." />
            </div>

            <div className="flex flex-col gap-6">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-[#0d1526] border border-white/5 rounded-3xl p-8 flex-1 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Live Dashboard Preview</span>
                  </div>

                  {/* Mock dashboard stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: 'Active Cases', value: '24', color: 'text-indigo-400' },
                      { label: 'Win Rate', value: '78%', color: 'text-emerald-400' },
                      { label: 'Monthly Revenue', value: '₹2.4L', color: 'text-violet-400' },
                      { label: 'Pending Leads', value: '7', color: 'text-amber-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className={`text-2xl font-black ${color} tracking-tight`}>{value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mock case list */}
                  <div className="space-y-3">
                    {[
                      { name: 'Property Dispute — HC Delhi', status: 'Hearing', color: 'text-amber-400 bg-amber-500/10' },
                      { name: 'Criminal Appeal — SC', status: 'Active', color: 'text-emerald-400 bg-emerald-500/10' },
                      { name: 'Arbitration Matter', status: 'Discovery', color: 'text-indigo-400 bg-indigo-500/10' },
                    ].map(({ name, status, color }) => (
                      <div key={name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-xs font-bold text-slate-300">{name}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${color}`}>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Quote block */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-indigo-900/30 to-violet-900/20 border border-indigo-500/20 rounded-3xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-300 text-sm italic leading-relaxed mb-4">
                  "NyayNow's Judge AI accurately predicted the outcome in 4 out of my last 5 matters. The case strategy dossiers are unlike anything I've seen in Indian legal tech."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">R</div>
                  <div>
                    <p className="text-white font-bold text-xs">Adv. Rajesh Sharma</p>
                    <p className="text-slate-500 text-[10px]">Senior Counsel, Delhi High Court</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>





    </div>
  );
}
