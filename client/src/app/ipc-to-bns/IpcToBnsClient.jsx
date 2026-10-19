'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowRight,
  Copy,
  Check,
  ShieldAlert,
  Scale,
  ExternalLink,
} from 'lucide-react';
import {
  IPC_BNS_MAP,
  IPC_BNS_META,
  IPC_BNS_CATEGORIES,
} from '../../utils/ipcBnsData';

function highlight(text, query) {
  if (!query) return text;
  const q = String(query).trim();
  if (!q) return text;
  const idx = String(text).toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[color-mix(in_srgb,var(--gold)_35%,transparent)] text-[var(--text)] rounded px-0.5">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function ResultCard({ item, query }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `IPC Section ${item.ipc} (${item.ipcTitle}) aligns with BNS Section ${item.bns} (${item.bnsTitle}). NyayNow reference - pending counsel review.`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <article className="mi-glass-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
          {item.category}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy mapping for IPC ${item.ipc}`}
          className="mi-tap mi-focus text-[var(--text-muted)] hover:text-[var(--text)] transition"
        >
          {copied ? <Check size={16} className="text-[var(--emerald)]" /> : <Copy size={16} />}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center rounded-full border border-[var(--gold-hairline)] px-2.5 py-0.5 text-xs font-semibold text-[var(--gold-soft)]">
            IPC {highlight(item.ipc, query)}
          </span>
          <p className="mt-2 text-sm text-[var(--text)] leading-snug">
            {highlight(item.ipcTitle, query)}
          </p>
        </div>

        <ArrowRight
          size={20}
          className="hidden sm:block shrink-0 text-[var(--gold)]"
          aria-hidden="true"
        />

        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--emerald)_22%,transparent)] px-2.5 py-0.5 text-xs font-semibold text-[var(--emerald)]">
            BNS {highlight(item.bns, query)}
          </span>
          <p className="mt-2 text-sm text-[var(--text-muted)] leading-snug">
            {highlight(item.bnsTitle, query)}
          </p>
        </div>
      </div>

      {item.notes ? (
        <p className="text-xs text-[var(--warn)] border-t border-[var(--gold-hairline)] pt-3">
          Note: {item.notes}
        </p>
      ) : null}
    </article>
  );
}

export default function IpcToBnsClient() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return IPC_BNS_MAP.items.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!q) return true;
      return [item.ipc, item.ipcTitle, item.bns, item.bnsTitle, item.category]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [query, category]);

  return (
    <div className="space-y-6">
      <div className="mi-glass-card p-4 flex flex-col gap-3">
        <label htmlFor="ipc-search" className="sr-only">
          Search IPC or BNS section
        </label>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden="true"
          />
          <input
            id="ipc-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a section, e.g. 420, murder, theft..."
            className="mi-focus w-full bg-transparent border border-[var(--gold-hairline)] rounded-[var(--radius-md)] pl-10 pr-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`mi-tap mi-focus rounded-full px-3 py-1.5 text-xs border transition ${
              category === 'all'
                ? 'bg-[var(--gold)] text-[#0B1220] border-[var(--gold)]'
                : 'text-[var(--text-muted)] border-[var(--gold-hairline)] hover:text-[var(--text)]'
            }`}
          >
            All
          </button>
          {IPC_BNS_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`mi-tap mi-focus rounded-full px-3 py-1.5 text-xs border transition ${
                category === c
                  ? 'bg-[var(--gold)] text-[#0B1220] border-[var(--gold)]'
                  : 'text-[var(--text-muted)] border-[var(--gold-hairline)] hover:text-[var(--text)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-[var(--text-muted)]">
        Showing {results.length} of {IPC_BNS_MAP.items.length} mappings
        {query ? ` for "${query}"` : ''}.
      </p>

      {results.length === 0 ? (
        <div className="text-center p-10 mi-glass-card">
          <ShieldAlert size={28} className="mx-auto text-[var(--warn)] mb-3" />
          <h3 className="text-lg font-semibold text-[var(--text)] mb-1">No mapping found</h3>
          <p className="text-[var(--text-muted)]">
            This seed map does not cover that section yet. Check the official
            India Code text and consult an advocate.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((item) => (
            <ResultCard key={`${item.ipc}-${item.bns}-${item.category}`} item={item} query={query} />
          ))}
        </div>
      )}

      <div className="mi-glass-card p-5 text-sm text-[var(--text-muted)] space-y-2">
        <p className="flex items-start gap-2">
          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-[var(--warn)]" />
          <span>{IPC_BNS_META.disclaimer}</span>
        </p>
        <p className="flex items-center gap-2">
          <Scale size={16} className="shrink-0 text-[var(--gold)]" />
          <a
            href={IPC_BNS_META.source?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[var(--text)] inline-flex items-center gap-1"
          >
            {IPC_BNS_META.source?.name}
            <ExternalLink size={12} />
          </a>
        </p>
        <p>
          Need a verified answer?{' '}
          <Link href="/assistant" className="text-[var(--gold-soft)] underline">
            Ask the AI assistant
          </Link>{' '}
          or{' '}
          <Link href="/marketplace" className="text-[var(--gold-soft)] underline">
            consult a verified advocate
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
