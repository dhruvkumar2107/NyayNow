import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Gavel,
  Mic,
  Users,
  FileText,
  Search,
  Briefcase,
  Zap,
  Shield,
  Scale,
  Sparkles
} from "lucide-react";


export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0c1220] font-sans text-slate-400 selection:bg-indigo-500/30">
      {/* ══════════════════════════════════════════════════════
          NEW HERO ENTRANCE — "JUSTICE SHOULDN'T BE A LUXURY"
      ══════════════════════════════════════════════════════ */}
      <section className="relative pt-40 pb-32 lg:pt-56 lg:pb-48 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-[#0c1220] to-[#0c1220] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-gold-400 text-[10px] font-black uppercase tracking-[0.25em] mb-10 backdrop-blur-xl shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-gold-500 animate-pulse shadow-[0_0_10px_#fbbf24]" />
            Free for Every Indian Citizen
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-serif font-black text-white mb-6 leading-[0.95] tracking-tight"
          >
            Justice shouldn't
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-yellow-500 to-amber-600">
              be a luxury.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed tracking-wide"
          >
            NyayNow puts the full power of the Indian legal system in your pocket. <br className="hidden md:block" />
            Designed for the <span className="text-white font-bold">1.4 billion</span> who deserve access to justice.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Link
              to={!user ? "/register" : (user.role === "lawyer" ? "/lawyer/dashboard" : "/client/dashboard")}
              className="group relative w-full sm:w-auto px-12 py-5 rounded-2xl text-midnight-950 font-black text-lg bg-gradient-to-r from-gold-400 to-yellow-600 hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] transition-all duration-300 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                ✦ {!user ? "Get Started Free" : "Enter Command Center"}
              </span>
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>
            <Link
              to="/legal-sos"
              className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-base text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/40 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shadow-sm"
            >
              🚨 Legal SOS
            </Link>
            {!user && (
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-5 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors duration-300 flex items-center justify-center underline underline-offset-4"
              >
                Member Login
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TRUST BAR — MARQUEE STYLE
      ══════════════════════════════════════════════════════ */}
      <section className="py-10 border-y border-white/5 bg-[#0a0f1d] flex flex-col items-center justify-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Trusted by the Indian Legal Community</p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-30 grayscale hover:opacity-60 transition-all duration-700">
          <span className="font-serif italic text-xl md:text-2xl text-white tracking-[0.3em]">SUPREME COURT</span>
          <span className="font-serif italic text-xl md:text-2xl text-white tracking-[0.3em]">HIGH COURTS</span>
          <span className="font-serif italic text-xl md:text-2xl text-white tracking-[0.3em]">LEGAL AID</span>
          <span className="font-serif italic text-xl md:text-2xl text-white tracking-[0.3em]">NALSAR</span>
          <span className="font-serif italic text-xl md:text-2xl text-white tracking-[0.3em]">NLSIU</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MILESTONE STATS section
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { val: "100K+", label: "Legal Queries", color: "text-indigo-400" },
              { val: "50,000+", label: "Lawyers Joined", color: "text-violet-400" },
              { val: "₹0", label: "Paid for Counsel", color: "text-emerald-400" },
              { val: "14", label: "Languages", color: "text-amber-400" }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`text-4xl md:text-6xl font-black mb-2 ${stat.color} tracking-tighter`}>{stat.val}</div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          LEGAL SOS — CENTERPIECE NOVELTY SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-0 overflow-hidden">
        {/* Full-bleed dark red gradient band */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-[#0c1220] to-[#0c1220]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/10 to-transparent" />

        <div className="max-w-[1200px] mx-auto px-6 py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT: Text & CTA */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-red-50 border border-red-200 mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span className="text-red-700 font-black text-xs tracking-[0.2em] uppercase">India's First Emergency Legal AI</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-serif font-black text-white mb-5 leading-[1.1]">
                Legal emergency? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
                  60 seconds.
                </span>{" "}
                Not 60 days.
              </h2>

              <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
                Arrested at midnight? Cheated by a business partner? Police refusing to register your FIR?
                <br /><br />
                <span className="text-white font-semibold">Hit SOS.</span> Get your fundamental rights, an AI-drafted FIR, and connect with a verified lawyer — instantly.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 mb-10">
                {[
                  { value: '60s', label: 'FIR Generated' },
                  { value: '10+', label: 'Indian Languages' },
                  { value: '100%', label: 'Free to Use' },
                ].map(({ value, label }) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-3xl font-black text-white">{value}</span>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-0.5">{label}</span>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/legal-sos"
                  className="group relative flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-base tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden active:scale-95"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/50" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                  </span>
                  🚨 Activate Legal SOS
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>
                <a
                  href="tel:112"
                  className="flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-base hover:bg-white/10 transition active:scale-95 shadow-sm"
                >
                  📞 Call Police: 112
                </a>
              </div>
            </motion.div>

            {/* RIGHT: Feature cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="space-y-4"
            >
              {[
                {
                  step: '01',
                  icon: '📋',
                  title: 'Describe Your Emergency',
                  desc: 'Type what happened in plain language. Our AI classifies it instantly — arrest, fraud, violence, or any legal crisis.',
                  color: 'from-red-500/10 to-rose-500/5',
                  border: 'border-red-500/20',
                  tag: 'Step 1',
                  tagColor: 'bg-red-500/20 text-red-400',
                },
                {
                  step: '02',
                  icon: '⚖️',
                  title: 'Know Your Rights Instantly',
                  desc: 'Get your fundamental rights under the Indian Constitution in plain language — Article 22, bail rights, right to legal counsel, and more.',
                  color: 'from-amber-500/10 to-orange-500/5',
                  border: 'border-amber-500/20',
                  tag: 'Step 2',
                  tagColor: 'bg-amber-500/20 text-amber-400',
                },
                {
                  step: '03',
                  icon: '📄',
                  title: 'AI-Drafted FIR in 30 Seconds',
                  desc: 'A legally formatted FIR — ready to print, copy, or share with a lawyer. Generated under the correct BNS/IPC sections.',
                  color: 'from-indigo-500/10 to-blue-500/5',
                  border: 'border-indigo-500/20',
                  tag: 'Step 3',
                  tagColor: 'bg-indigo-500/20 text-indigo-400',
                },
              ].map(({ step, icon, title, desc, color, border, tag, tagColor }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className={`relative flex items-start gap-5 p-6 rounded-2xl bg-white/5 border ${border} hover:scale-[1.02] transition-transform duration-300 shadow-sm`}
                >
                  <div className="text-3xl flex-shrink-0 mt-0.5">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-bold text-base">{title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${tagColor}`}>{tag}</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}

              {/* Bottom disclaimer */}
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-emerald-500 text-lg">🔒</span>
                <p className="text-slate-400 text-xs leading-relaxed">
                  All SOS submissions are <span className="text-white font-semibold">confidential</span>. No data is stored permanently without your consent.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          NYAYCOURT BATTLE — FLAGSHIP NOVELTY SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-0 overflow-hidden">
        {/* Majestic court-room dark panel bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-[#0c1220] to-[#0c1220]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.08),_transparent_65%)]" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-200/5 via-amber-400/20 to-amber-200/5" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-200/20 to-transparent" />

        <div className="max-w-[1200px] mx-auto px-6 py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT: The 3 AI Personas */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-2 lg:order-1"
            >
              {/* Court room avatar display */}
              <div className="relative">
                {/* Center judge */}
                <div className="flex justify-center mb-3 relative">
                  <motion.div
                    animate={{ boxShadow: ['0 0 20px rgba(239,68,68,0.2)', '0 0 40px rgba(239,68,68,0.5)', '0 0 20px rgba(239,68,68,0.2)'] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-28 h-28 rounded-3xl bg-gradient-to-br from-red-500/20 to-rose-900/20 border border-red-500/30 flex flex-col items-center justify-center relative z-10"
                  >
                    <span className="text-5xl">⚖️</span>
                    <p className="text-red-400 font-black text-[10px] uppercase tracking-widest mt-1">THE BENCH</p>
                  </motion.div>
                </div>
                {/* Plaintiff & defense side by side */}
                <div className="flex gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 rounded-2xl bg-amber-500/5 border border-amber-500/20 p-5 text-center"
                  >
                    <div className="text-4xl mb-2">👨‍⚖️</div>
                    <p className="text-amber-300 font-bold text-sm">Adv. Vikram Anand</p>
                    <p className="text-amber-600 text-[10px] font-black uppercase tracking-widest">Prosecution</p>
                    <div className="mt-3 space-y-1.5">
                      {['BNS Sections', 'SC Precedents', 'Evidence Law'].map(tag => (
                        <div key={tag} className="text-[10px] text-amber-400/70 bg-amber-500/10 rounded-lg py-0.5 px-2">{tag}</div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex-1 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 p-5 text-center"
                  >
                    <div className="text-4xl mb-2">👩‍⚖️</div>
                    <p className="text-indigo-300 font-bold text-sm">Adv. Priya Rathore</p>
                    <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Defense</p>
                    <div className="mt-3 space-y-1.5">
                      {['Fundamental Rights', 'Bail Lex', 'Procedure Law'].map(tag => (
                        <div key={tag} className="text-[10px] text-indigo-400/70 bg-indigo-500/10 rounded-lg py-0.5 px-2">{tag}</div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* VS divider */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#020617] border border-white/10 flex items-center justify-center">
                  <span className="text-slate-500 font-serif font-black text-sm">vs</span>
                </div>

                {/* Connecting lines */}
                <div className="absolute top-28 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-red-500/30 to-transparent" />
              </div>

              {/* Trial progress animation */}
              <div className="mt-6 bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <p className="text-slate-600 text-[10px] uppercase tracking-widest font-black mb-3">5-Round Trial Sequence</p>
                <div className="flex items-center gap-1">
                  {['Opening', 'Rebuttal', 'Judge Q', 'Response', 'Closing', 'Verdict'].map((step, i) => (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center gap-1 flex-1">
                        <div className={`w-full h-1.5 rounded-full ${i < 5 ? 'bg-violet-500/40' : 'bg-amber-500/60'
                          }`} />
                        <p className="text-[9px] text-slate-600 font-bold text-center leading-tight">{step}</p>
                      </div>
                      {i < 5 && <div className="w-1.5 h-1.5 rounded-full bg-white/10 flex-shrink-0 mb-3" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Copy & CTA */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/25 mb-6">
                <span className="text-amber-400 font-black text-xs tracking-[0.2em] uppercase">⚖️ World's First</span>
                <span className="w-px h-3 bg-amber-500/30" />
                <span className="text-amber-400/70 text-xs font-bold">AI Multi-Agent Trial</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-serif font-black text-white mb-5 leading-[1.1]">
                Your case. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
                  A real AI trial.
                </span>{' '}
                Full verdict.
              </h2>

              <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
                Describe your legal situation. Three specialized AI personas — a senior plaintiff advocate, a legendary defense lawyer, and a Supreme Court judge — argue it live. 5 round debate. Then the AI delivers its final judgment.
              </p>

              <div className="flex flex-wrap gap-6 mb-10">
                {[
                  { value: '3', label: 'AI Legal Minds' },
                  { value: '5', label: 'Trial Rounds' },
                  { value: '100%', label: 'Indian Law' },
                ].map(({ value, label }) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-3xl font-black text-white">{value}</span>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-0.5">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/courtroom-battle"
                  className="group relative flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-black text-base tracking-wide shadow-[0_0_50px_rgba(245,158,11,0.35)] hover:shadow-[0_0_80px_rgba(245,158,11,0.55)] transition-all duration-300 overflow-hidden active:scale-95"
                >
                  ⚖️ Start AI Trial Now
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>
                <Link
                  to="/courtroom-battle"
                  className="flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-bold text-base hover:bg-white/10 transition active:scale-95"
                >
                  See how it works →
                </Link>
              </div>

              <p className="text-slate-600 text-xs mt-5">
                Powered by Gemini AI · Indian law (BNS/IPC) · Real SC case citations · Instant verdict
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- AI COMPARISON SECTION (PREMIUM) --- */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">

          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-serif font-bold text-white mb-4"
            >
              Two Minds. One Purpose.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 max-w-2xl mx-auto text-lg"
            >
              Choose the right intelligence for your legal battle.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">

            {/* LEFT CARD: JUDGE AI (WIN) */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-600 rounded-3xl blur opacity-5 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative h-full bg-[#0d1526]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden hover:border-red-500/30 transition-all duration-500 shadow-xl flex flex-col items-center text-center">

                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/[0.03] rounded-full blur-[100px] pointer-events-none"></div>

                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-4xl shadow-lg mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative z-10 text-white">
                  ⚖️
                </div>

                <h3 className="text-3xl font-serif font-bold text-white mb-2">Judge AI</h3>
                <p className="text-red-600 font-bold uppercase tracking-widest text-xs mb-8">The Strategist</p>

                <div className="text-lg text-slate-300 leading-relaxed mb-8 font-light">
                  "Use Judge AI to <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 font-black text-2xl">WIN</span> a case."
                </div>

                <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8">
                  Predict win probability, identify risks, and formulate a ruthless winning strategy.
                </p>

                <Link to="/judge-ai" className="px-8 py-3 rounded-xl bg-red-50 text-red-600 border border-red-100 font-bold hover:bg-red-600 hover:text-white transition-all uppercase tracking-wider text-sm mt-auto">
                  Launch Strategist
                </Link>
              </div>
            </motion.div>

            {/* RIGHT CARD: AI ASSISTANT (UNDERSTAND) */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-5 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative h-full bg-[#0d1526]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden hover:border-cyan-500/30 transition-all duration-500 shadow-xl flex flex-col items-center text-center">

                <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/[0.03] rounded-full blur-[100px] pointer-events-none"></div>

                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-4xl shadow-lg mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 relative z-10 text-white">
                  🧠
                </div>

                <h3 className="text-3xl font-serif font-bold text-white mb-2">AI Assistant</h3>
                <p className="text-cyan-600 font-bold uppercase tracking-widest text-xs mb-8">The Consultant</p>

                <div className="text-lg text-slate-300 leading-relaxed mb-8 font-light">
                  "Use AI Assistant to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 font-black text-2xl">UNDERSTAND</span> the law."
                </div>

                <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8">
                  Get instant legal opinions, research complex topics, and draft notices conversationally.
                </p>

                <Link to="/assistant" className="px-8 py-3 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 font-bold hover:bg-cyan-600 hover:text-white transition-all uppercase tracking-wider text-sm mt-auto">
                  Start Consultation
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURE BENTO GRID — PREMIUM DISPLAY
      ══════════════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden bg-black/10 border-y border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif font-black text-white mb-4">Elite Capabilities.</h2>
            <p className="text-slate-400 text-lg">The world's most advanced legal operating system.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[180px]">
            {/* LARGE FEATURE: MOOT COURT */}
            <BentoCard
              title="Moot Court VR"
              desc="Experience the raw intensity of a real courtroom without leaving your home. NyayNow's Moot Court VR is a groundbreaking simulation environment designed for students, legal professionals, and anyone wishing to master the art of advocacy. Practice your oral arguments against a ruthless, adaptive AI Judge that listens to every word, analyzes your logic for inconsistencies, and provides instant, professional feedback on your speech, legal reasoning, and emotional delivery. Our proprietary AI simulates various judicial temperaments—from the patient and inquiring to the sharp and demanding—ensuring you're prepared for any bench response. This immersive environment tracks your vocal modulation, use of precedents, and argumentative structure in real-time. Whether you're a student preparing for a national moot competition or a seasoned practitioner refining a complex special leave petition, this module provides the high-stakes practice you need to master the art of persuasion and sharpen your litigation edge in a safe yet demanding environment. Step into the virtual dock today and transform your courtroom presence."
              icon={<Scale className="text-white" size={20} />}
              color="from-indigo-500 via-purple-500 to-pink-500"
              href="/moot-court"
              badge="Flagship"
              className="md:col-span-8 md:row-span-2"
              isLarge={true}
            />
            {/* NYAY VOICE */}
            <BentoCard
              title="NyayVoice"
              desc="Break the language barrier with our multilingual AI assistant. Speak naturally in Hindi, Tamil, or any of 10+ Indian languages to get instant legal guidance and simplified explanations."
              icon={<Mic className="text-white" size={18} />}
              color="from-violet-600 via-indigo-600 to-purple-600"
              href="/voice-assistant"
              className="md:col-span-4"
            />
            {/* ELITE NETWORK */}
            <BentoCard
              title="Elite Network"
              desc="Gain direct access to the top 1% of India's legal minds. Our verified network connects you with expert advocates and legal consultants for high-stakes litigation and specialized advisory."
              icon={<Users className="text-white" size={18} />}
              color="from-amber-400 via-orange-500 to-red-500"
              href="/marketplace"
              badge="Exclusive"
              className="md:col-span-4"
            />
            {/* DRAFTING */}
            <BentoCard
              title="Drafting Lab"
              desc="Generate ironclad contracts, notices, and agreements in seconds. Our AI-powered lab uses standard legal templates to ensure every document is compliant with current Indian laws."
              icon={<FileText className="text-white" size={18} />}
              color="from-emerald-500 via-green-500 to-teal-500"
              href="/drafting"
              className="md:col-span-4"
            />
            {/* RESEARCH */}
            <BentoCard
              title="Deep Research"
              desc="Find winning precedents with advanced semantic search. Access a massive database of past case laws and legal judgments, with AI highlighting the most relevant points for your case."
              icon={<Search className="text-white" size={18} />}
              color="from-blue-500 via-cyan-500 to-indigo-500"
              href="/research"
              className="md:col-span-4"
            />
            {/* CAREER HUB */}
            <BentoCard
              title="Career Hub"
              desc="Launch your legal career with NyayNow. Explore exclusive internships, mentorship programs from senior advocates, and skill-building tasks designed for young legal professionals."
              icon={<Briefcase className="text-white" size={18} />}
              color="from-rose-500 via-pink-500 to-orange-500"
              href="/career"
              className="md:col-span-4"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          REMOVED OLD JUSTICE SECTION (MOVED TO TOP)
      ══════════════════════════════════════════════════════ */}

      <Footer />
    </div>
  );
}

function BentoCard({ title, desc, icon, color, href, badge, className, isLarge }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative group bg-white/5 border border-white/10 rounded-[24px] ${isLarge ? 'p-8 md:p-12' : 'p-5'} overflow-hidden hover:border-indigo-500/20 transition-all shadow-sm hover:shadow-xl flex flex-col ${className}`}
      onClick={() => window.location.href = href}
    >
      {/* Mesh Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`} />

      {/* Animated Aura */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${color} blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-700`} />

      {badge && (
        <span className={`absolute ${isLarge ? 'top-8 right-8' : 'top-5 right-5'} px-3 py-1 bg-white/5 border border-white/10 rounded-full ${isLarge ? 'text-[10px]' : 'text-[8px]'} font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-400 transition-colors`}>
          {badge}
        </span>
      )}

      {/* Floating Icon Container */}
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={`${isLarge ? 'w-16 h-16 rounded-2xl' : 'w-10 h-10 rounded-xl'} bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${isLarge ? 'mb-8' : 'mb-3'} relative z-10`}
      >
        <div className={`absolute inset-0 ${isLarge ? 'rounded-2xl' : 'rounded-xl'} bg-white/20 blur-sm scale-90 opacity-0 group-hover:opacity-100 transition-opacity`} />
        {React.cloneElement(icon, { size: isLarge ? 32 : 20 })}
      </motion.div>

      <div className="relative z-10">
        <h3 className={`${isLarge ? 'text-2xl' : 'text-lg'} font-display font-bold text-white mb-2 group-hover:text-indigo-400 transition-all duration-300`}>
          {title}
        </h3>
        <p className={`text-slate-400 ${isLarge ? 'text-sm' : 'text-[12px]'} leading-relaxed ${isLarge ? '' : 'max-w-sm'} group-hover:text-slate-200 transition-colors`}>
          {desc}
        </p>
      </div>

      <div className="mt-auto pt-2 relative z-10">
        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-indigo-600 transition-all">
          Explore Module
          <motion.span
            className="inline-block"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >→</motion.span>
        </span>
      </div>

      {/* Border Glow */}
      <div className={`absolute inset-0 border border-white/5 rounded-[24px] group-hover:border-indigo-500/10 transition-colors pointer-events-none`} />
    </motion.div>
  );
}

function UnicornCard({ title, desc, icon, color, href, badge, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -15, rotateX: 5, scale: 1.02 }}
      className="relative group cursor-pointer"
      onClick={() => window.location.href = href}
    >
      {/* GLOW EFFECT */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-500 group-hover:blur-md`}></div>

      {/* CARD CONTENT */}
      <div className="relative h-full bg-[#0f172a] border border-white/5 rounded-2xl p-8 flex flex-col items-start overflow-hidden hover:border-white/10 transition-all shadow-xl">

        {badge && (
          <span className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold uppercase rounded-full shadow-sm tracking-wider">
            {badge}
          </span>
        )}

        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl shadow-lg mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10 text-white`}>
          {icon}
        </div>

        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>

        <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow border-l-2 border-white/5 pl-4 group-hover:border-indigo-500/50 transition-colors font-normal">
          {desc}
        </p>

        <div className="mt-auto w-full pt-4 border-t border-white/5 flex items-center justify-between text-sm font-bold text-slate-500 opacity-80 group-hover:opacity-100 transition-opacity uppercase tracking-wider text-xs">
          <span>Explore Module</span>
          <span className="group-hover:translate-x-2 transition-transform bg-white/5 rounded-full w-8 h-8 flex items-center justify-center border border-white/10 text-white">→</span>
        </div>
      </div>
    </motion.div>
  );
}
