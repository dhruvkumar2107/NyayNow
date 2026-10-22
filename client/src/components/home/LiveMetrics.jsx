'use client';

import { useEffect, useState } from 'react';

const labels = [
  ['registeredUsers', 'Registered accounts'],
  ['queriesThisWeek', 'Queries this week'],
  ['passMarkedProofRecords', 'Records marked as passing'],
];

export default function LiveMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [asOf, setAsOf] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/public-metrics', { signal: controller.signal, cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data?.available && data.metrics) {
          setMetrics(data.metrics);
          setAsOf(data.asOf);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return <section aria-label="Live product metrics" className="bg-[#020617] py-8">
    <div className="max-w-5xl mx-auto px-5 sm:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {labels.map(([key, label]) => <div key={key} className="rounded-xl border border-white/10 px-4 py-4 text-center">
          <p className="text-2xl font-semibold text-white tabular-nums">{Number.isSafeInteger(metrics?.[key]) ? metrics[key].toLocaleString('en-IN') : '—'}</p>
          <p className="mt-1 text-xs text-slate-400">{label}</p>
        </div>)}
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">{asOf ? `Metrics as of ${new Date(asOf).toLocaleString('en-IN')}.` : 'Live metrics are temporarily unavailable; no estimates are shown.'} These aggregates are not independently audited; passing-record counts do not measure answer accuracy.</p>
    </div>
  </section>;
}
