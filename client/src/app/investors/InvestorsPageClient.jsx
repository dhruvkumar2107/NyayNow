'use client';

import { useEffect, useState } from 'react';

const metricsList = [
  ['registeredUsers', 'Registered accounts'], ['activeUsers30d', 'Active accounts (30d)'],
  ['queriesThisWeek', 'Queries this week'], ['paidAccounts', 'Paid accounts'],
  ['lawyerAccounts', 'Lawyer accounts'], ['passMarkedProofRecords', 'Records marked as passing'],
];

export default function InvestorsPageClient() {
  const [data, setData] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/public-metrics', { signal: controller.signal, cache: 'no-store' }).then(response => response.ok ? response.json() : null).then(setData).catch(() => {});
    return () => controller.abort();
  }, []);

  return <main className="min-h-screen bg-[#070a12] text-slate-200 pt-28 pb-20"><div className="max-w-5xl mx-auto px-6">
    <p className="text-xs uppercase tracking-[0.25em] text-blue-300">Unlisted investor diligence draft · October 2026</p>
    <h1 className="font-serif text-4xl md:text-6xl text-white mt-4">Verified Legal Intelligence for India</h1>
    <p className="text-xl text-slate-300 mt-5 max-w-3xl">NyayNow is building toward a layer that turns Indian legal text into time-aware, source-checkable, vernacular legal workflows. Source receipts and temporal verification are in development.</p>

    <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6"><h2 className="text-2xl text-white font-semibold">Current product evidence</h2><p className="text-sm text-slate-400 mt-2">Database-backed aggregates appear only when the production metrics API is connected. Dashes mean no current measurement is available.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">{metricsList.map(([key, label]) => <div key={key} className="rounded-xl border border-white/10 p-4"><p className="text-xs text-slate-400">{label}</p><p className="text-2xl text-white mt-1 tabular-nums">{data?.available && Number.isSafeInteger(data.metrics?.[key]) ? data.metrics[key].toLocaleString('en-IN') : '—'}</p></div>)}</div>
      <p className="text-xs text-slate-500 mt-4">As of {data?.asOf ? new Date(data.asOf).toLocaleString('en-IN') : '[NEEDED: live metrics timestamp]'}. These database aggregates are not independently audited; records marked as passing do not establish citation entailment or legal-answer accuracy.</p>
    </section>

    <div className="grid md:grid-cols-2 gap-5 mt-8">
      <section className="rounded-2xl border border-white/10 p-6"><h2 className="text-xl text-white font-semibold">Problem context</h2><p className="mt-3 text-slate-400">The National Judicial Data Grid district-court dashboard displayed 51,591,381 pending cases when checked on 17 October 2026. This is a changing district-court snapshot, not a market-size estimate or a count of addressable users. <a className="text-blue-300 underline" href="https://njdg.ecourts.gov.in/njdg_v3/" target="_blank" rel="noreferrer">View the official dashboard</a>.</p><p className="mt-3 text-slate-400">India’s new criminal-code set includes BNS, BNSS, and BSA; India Code records BNS enforcement from 1 July 2024. A maintained, counsel-reviewed transition mapping has not yet been built. <a className="text-blue-300 underline" href="https://www.indiacode.nic.in/handle/123456789/20062" target="_blank" rel="noreferrer">India Code source record</a>.</p><p className="mt-3 text-xs text-slate-500">[NEEDED: current lawyer-to-citizen ratio, legal-aid access evidence, source dates and method.]</p></section>
      <section className="rounded-2xl border border-white/10 p-6"><h2 className="text-xl text-white font-semibold">Business model hypothesis</h2><p className="mt-3 text-slate-400">The proposed monthly tiers are Nyay Pro ₹299, Nyay Gold ₹799, and Nyay Firm ₹2,999. These prices exist in the payment configuration; feature entitlements, annual pricing, service terms, and observed willingness to pay need reconciliation and validation.</p><ul className="mt-3 text-sm text-slate-400 list-disc pl-5 space-y-2"><li>335 Pro accounts × ₹299 = ₹100,165 gross monthly billings.</li><li>126 Gold accounts × ₹799 = ₹100,674 gross monthly billings.</li><li>34 Firm accounts × ₹2,999 = ₹101,966 gross monthly billings.</li></ul><p className="mt-3 text-xs text-slate-500">Arithmetic before discounts, taxes, refunds, payment fees, model costs, and collection. These are not revenue forecasts or actuals.</p></section>
      <section className="rounded-2xl border border-white/10 p-6"><h2 className="text-xl text-white font-semibold">Technical moat under construction</h2><p className="mt-3 text-slate-400">Source identity and passage records, exact-quote checks, HMAC receipt signing, and temporal validity fields have scaffolding in this codebase. There is no approved corpus, ingestion/update process, entailment model, knowledge graph, measured benchmark, or production receipt issuance.</p></section>
      <section className="rounded-2xl border border-white/10 p-6"><h2 className="text-xl text-white font-semibold">Traction, unit economics, and team</h2><p className="mt-3 text-slate-400">[NEEDED: MAU definition and history, 30-day retention, conversion cohorts, MRR/revenue ledger, CAC, query cost by model and task, gross margin, lawyer response time, pilot letters, and weekly growth.]</p><p className="mt-3 text-slate-400">Founder: Dhruv. [NEEDED: verified biography, co-founders, engineering/research/legal team, advisor consent, DSU/AIC-DSU/PR-network relationships.]</p></section>
    </div>

    <section className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-6"><h2 className="text-xl text-white font-semibold">Ask and next milestones</h2><p className="mt-3 text-slate-300">Funding ask: [NEEDED]. Runway: [NEEDED]. Use of funds by milestone: [NEEDED]. No request amount or use-of-funds figure is implied by this page.</p><p className="mt-3 text-slate-400">Suggested sequence: secure counsel-approved source permissions and an advocate-reviewed baseline; run consented design-partner pilots; apply to an eligible grant/incubator call; then approach angels and seed investors with real retention, cost, and quality evidence.</p></section>
    <p className="mt-8 text-xs text-slate-500">This page is unlisted and marked noindex, but it is publicly reachable by anyone with the URL and has no authentication. Do not place confidential information here or circulate it as a complete data room; see <code>docs/investor/</code> for evidence checklist and open items.</p>
  </div></main>;
}
