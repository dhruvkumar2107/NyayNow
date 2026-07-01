'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scale, ArrowRight, ShieldAlert, Languages, Sparkles, BookOpen, ExternalLink } from 'lucide-react';

export default function BnsSectionClient({ sectionKey, data }) {
  const [activeLang, setActiveLang] = useState('English');

  // Fallback if section not in DB
  const sectionData = data || {
    title: `BNS ${sectionKey?.replace('-', ' ').toUpperCase()}`,
    shortTitle: sectionKey,
    oldIpc: 'Relevant IPC Equivalent',
    offense: 'Offense details under Bharatiya Nyaya Sanhita 2024',
    punishment: 'Refer to official BNS schedule for exact details.',
    faqs: [],
    relatedSections: [],
    keywords: [],
    languages: {
      'English': {
        explanation: `Detailed explanation of BNS ${sectionKey?.replace('-', ' ').toUpperCase()} is being indexed. Consult our AI Assistant for instant queries.`,
        elements: ['Statutory elements of the offense.']
      }
    }
  };

  const langData = sectionData.languages[activeLang] || sectionData.languages['English'];
  const availableLangs = Object.keys(sectionData.languages);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 pt-28 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Breadcrumbs — SEO breadcrumb trail */}
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider">
            <li><Link href="/" className="hover:text-white transition">Home</Link></li>
            <li aria-hidden="true"><span>/</span></li>
            <li><Link href="/bns" className="hover:text-white transition">BNS Directory</Link></li>
            <li aria-hidden="true"><span>/</span></li>
            <li aria-current="page" className="text-blue-400">{sectionData.shortTitle}</li>
          </ol>
        </nav>

        {/* Section Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                <Scale size={12} /> Bharatiya Nyaya Sanhita (BNS) 2024
              </span>

              {/* Language Switcher */}
              <div className="flex items-center gap-2">
                <Languages size={14} className="text-slate-500" />
                <select
                  value={activeLang}
                  onChange={e => setActiveLang(e.target.value)}
                  aria-label="Switch language"
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500/50 transition"
                >
                  {availableLangs.map(l => (
                    <option key={l} value={l} className="bg-slate-950 text-white">{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {/* h1 — critical for on-page SEO */}
              <h1 className="text-3xl md:text-5xl font-serif font-black text-white leading-tight">
                {sectionData.title}
              </h1>
              <p className="text-slate-500 text-sm font-semibold tracking-wider uppercase">
                Formerly equivalent to: <span className="text-white font-bold">{sectionData.oldIpc}</span>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5 text-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Type of Offense</span>
                <p className="text-white font-bold">{sectionData.offense}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Punishment Details</span>
                <p className="text-white font-bold">{sectionData.punishment}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content + Sidebar */}
        <div className="grid md:grid-cols-3 gap-8">

          {/* Main Explanation & Elements */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-white border-b border-white/5 pb-3 mb-4">
                Legal Interpretation {activeLang !== 'English' ? `(${activeLang})` : ''}
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">{langData.explanation}</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-white mb-4">Essential Elements to Prove the Offense</h3>
              <ul className="space-y-3" role="list">
                {langData.elements.map((elem, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-400">
                    <span className="w-6 h-6 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs">{i + 1}</span>
                    <span className="pt-0.5">{elem}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* FAQ Section — Surfaces Google's FAQ rich snippets */}
            {sectionData.faqs?.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white border-b border-white/5 pb-3 mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {sectionData.faqs.map((faq, i) => (
                    <details key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 group cursor-pointer hover:border-blue-500/30 transition">
                      <summary className="font-bold text-white text-sm list-none flex justify-between items-center gap-3">
                        {faq.q}
                        <span className="text-slate-500 text-xs group-open:rotate-180 transition-transform shrink-0">▼</span>
                      </summary>
                      <p className="text-slate-400 text-sm leading-relaxed mt-3 pt-3 border-t border-white/5">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Related Sections — Internal linking boost */}
            {sectionData.relatedSections?.length > 0 && (
              <section>
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-400" /> Related BNS Sections
                </h3>
                <div className="flex flex-wrap gap-3">
                  {sectionData.relatedSections.map(rs => (
                    <Link
                      key={rs.section}
                      href={`/bns/${rs.section}`}
                      className="px-4 py-2 bg-white/5 border border-white/10 hover:border-blue-500/40 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      {rs.label} <ExternalLink size={10} />
                    </Link>
                  ))}
                  <Link
                    href="/research"
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:border-blue-500/40 text-slate-400 text-xs font-bold rounded-xl transition"
                  >
                    Search Case Precedents →
                  </Link>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar: CTA + Disclaimer */}
          <div className="space-y-6">
            {/* AI Conversion CTA */}
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-6 rounded-3xl relative overflow-hidden text-center space-y-4 sticky top-24">
              <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                <Sparkles size={120} />
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-600/20 text-xl">
                ⚖️
              </div>
              <div className="space-y-2">
                <h4 className="font-serif font-black text-white text-base">
                  Facing charges under {sectionData.shortTitle}?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Get instant AI-powered legal guidance. Analyze evidence, evaluate precedents, and draft FIR response notices — in your language.
                </p>
              </div>
              <Link
                href={`/assistant?question=Explain my rights under BNS ${sectionKey?.replace('-', ' ').toUpperCase()} and what defenses are available to me`}
                className="w-full py-3 bg-white text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-blue-500 hover:text-white transition flex items-center justify-center gap-1.5 shadow-lg"
              >
                Consult AI Assistant <ArrowRight size={12} />
              </Link>
              <span className="text-[10px] text-slate-500 block">Free tier: 10 queries/month. No credit card needed.</span>
            </div>

            {/* Bhashini Translator CTA */}
            <div className="bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border border-sky-500/20 p-5 rounded-2xl text-center space-y-3">
              <Languages size={20} className="text-sky-400 mx-auto" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Need this section explained in <strong className="text-white">Telugu, Kannada, Marathi</strong> or 7 other regional languages?
              </p>
              <Link
                href={`/translator?text=${encodeURIComponent(`Explain ${sectionData.shortTitle}: ${sectionData.offense}`)}`}
                className="w-full py-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-white font-bold text-xs rounded-xl transition block"
              >
                Translate with Bhashini →
              </Link>
            </div>

            {/* Disclaimer */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3 text-[10px] text-slate-500 leading-relaxed">
              <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Disclaimer:</strong> This page is for general educational awareness only and does not constitute legal counsel. Consult a qualified advocate before taking legal action.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
