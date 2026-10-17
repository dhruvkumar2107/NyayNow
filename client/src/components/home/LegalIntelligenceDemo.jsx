'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LegalIntelligenceDemo() {
  const [question, setQuestion] = useState('');
  const [asOfDate, setAsOfDate] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showProof, setShowProof] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(Boolean(question.trim()));
  };

  return <section aria-labelledby="legal-demo-title" className="bg-[#070c19] border-y border-white/10 py-14 md:py-20">
    <div className="max-w-5xl mx-auto px-5 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
        <div><p className="text-xs uppercase tracking-[0.2em] text-blue-300">Interactive product preview</p><h2 id="legal-demo-title" className="font-serif text-3xl md:text-4xl text-white mt-2">Start with what happened and when.</h2></div>
        <Link href="/nyayvoice" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 px-4 text-white hover:bg-white/10">Explore NyayVoice <span className="sr-only">voice assistant</span></Link>
      </div>
      <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-white/10 bg-[#020617] p-5 md:p-7">
        <label htmlFor="legal-demo-question" className="text-sm font-medium text-slate-200">What would you like help understanding?</label>
        <textarea id="legal-demo-question" value={question} onChange={event => setQuestion(event.target.value)} rows={3} maxLength={500} className="w-full resize-y rounded-xl border border-white/15 bg-white/[0.03] p-4 text-white placeholder:text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400" placeholder="Try a non-sensitive example. This preview keeps your text in this browser." />
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <label htmlFor="legal-demo-date" className="text-sm text-slate-300">When did this happen? <input id="legal-demo-date" type="date" value={asOfDate} onChange={event => setAsOfDate(event.target.value)} className="mt-2 block min-h-11 rounded-lg border border-white/15 bg-white/[0.03] px-3 text-white" /></label>
          <button type="submit" className="min-h-11 rounded-lg bg-white px-5 font-semibold text-slate-950 hover:bg-slate-200">Preview the flow</button>
          <p className="text-xs text-slate-500">This preview does not send, save, or analyze your text.</p>
        </div>
      </form>
      {submitted && <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5" aria-live="polite">
        <p className="text-xs uppercase tracking-widest text-amber-300">Preview only · as of {asOfDate || 'date not selected'}</p>
        <p className="mt-3 text-white">A live answer is not shown because the verified source and date-aware answer pipeline is in development.</p>
        <p className="mt-2 text-sm text-slate-400">Your text stays in this browser preview. Do not enter personal details or evidence here.</p>
        <button type="button" aria-expanded={showProof} onClick={() => setShowProof(value => !value)} className="mt-4 min-h-11 rounded-lg border border-white/20 px-4 text-white">{showProof ? 'Hide proof panel status' : 'Open proof panel'}</button>
        {showProof && <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4"><h3 className="font-semibold text-white">Proof panel · in development</h3><p className="mt-2 text-sm text-slate-400">No source passage, law-as-on-date check, or signed receipt is attached to this preview. NyayNow does not label this answer as verified.</p></div>}
      </div>}
    </div>
  </section>;
}
