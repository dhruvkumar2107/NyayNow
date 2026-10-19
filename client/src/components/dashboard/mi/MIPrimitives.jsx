'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/* ── Animated aurora backdrop ─────────────────────────────────────────── */
export function MIBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[var(--bg)]" />
      <div className="mi-orb-a absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-[var(--gold)]/10 blur-[130px]" />
      <div className="mi-orb-b absolute -right-40 top-1/4 h-[560px] w-[560px] rounded-full bg-[var(--emerald)]/10 blur-[150px]" />
      <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-[var(--gold-soft)]/5 blur-[130px]" />
      <div className="mi-grain absolute inset-0" />
    </div>
  );
}

/* ── Glass panel ──────────────────────────────────────────────────────── */
export function Panel({ title, subtitle, icon, action, children, className = '', hover = true, as: As = 'section' }) {
  return (
    <As
      className={`mi-glass-card relative overflow-hidden p-6 sm:p-7 ${hover ? 'mi-card-hover' : ''} ${className}`}
    >
      {(title || action) && (
        <div className="relative z-10 mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {icon && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--gold)]/10 text-[var(--gold)]">
                {icon}
              </span>
            )}
            <div>
              {title && <h3 className="mi-body font-semibold leading-tight text-[var(--text)]">{title}</h3>}
              {subtitle && (
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action}
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </As>
  );
}

export function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">{eyebrow}</p>
        )}
        <h2 className="mi-body mt-1 text-xl font-semibold text-[var(--text)]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* ── Pills / chips ────────────────────────────────────────────────────── */
const TONES = {
  gold: 'border-[var(--gold-hairline)] bg-[var(--gold)]/10 text-[var(--gold-soft)]',
  emerald: 'border-[color-mix(in_srgb,var(--emerald)_40%,transparent)] bg-[color-mix(in_srgb,var(--emerald)_14%,transparent)] text-[var(--emerald)]',
  warn: 'border-[color-mix(in_srgb,var(--warn)_40%,transparent)] bg-[color-mix(in_srgb,var(--warn)_14%,transparent)] text-[var(--warn)]',
  sos: 'border-[color-mix(in_srgb,var(--sos)_40%,transparent)] bg-[color-mix(in_srgb,var(--sos)_14%,transparent)] text-[var(--sos)]',
  muted: 'border-[var(--gold-hairline)] bg-[var(--surface-2)] text-[var(--text-muted)]',
};

export function Pill({ children, tone = 'gold', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${TONES[tone] || TONES.gold} ${className}`}
    >
      {children}
    </span>
  );
}

/* ── Animated counter ─────────────────────────────────────────────────── */
export function AnimatedNumber({ value = 0, prefix = '', suffix = '', duration = 900, className = '' }) {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (target - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  const shown = Number.isInteger(target) ? Math.round(display) : display.toFixed(1);
  return (
    <span className={className}>
      {prefix}
      {shown.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

/* ── Stat tile ────────────────────────────────────────────────────────── */
export function StatTile({ label, value, sub, icon, tone = 'gold', prefix = '', suffix = '', animate = true }) {
  const toneRing = {
    gold: 'text-[var(--gold)] bg-[var(--gold)]/10 border-[var(--gold-hairline)]',
    emerald: 'text-[var(--emerald)] bg-[color-mix(in_srgb,var(--emerald)_12%,transparent)] border-[color-mix(in_srgb,var(--emerald)_35%,transparent)]',
    warn: 'text-[var(--warn)] bg-[color-mix(in_srgb,var(--warn)_12%,transparent)] border-[color-mix(in_srgb,var(--warn)_35%,transparent)]',
  }[tone];

  return (
    <div className="mi-glass-card mi-card-hover group relative overflow-hidden p-5">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'color-mix(in srgb, var(--gold) 30%, transparent)' }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border ${toneRing}`}>
          {icon}
        </span>
      </div>
      <p className="relative z-10 mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="relative z-10 mt-1 text-3xl font-bold tracking-tight text-[var(--text)]">
        {animate ? <AnimatedNumber value={value} prefix={prefix} suffix={suffix} /> : `${prefix}${value}${suffix}`}
      </p>
      {sub && <p className="relative z-10 mt-1 text-[11px] text-[var(--text-muted)]">{sub}</p>}
    </div>
  );
}

/* ── Sparkline (area) ─────────────────────────────────────────────────── */
export function Sparkline({ data = [], stroke = 'var(--gold)', height = 56, className = '' }) {
  const values = data.length ? data : [0, 0];
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 100;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * w;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x},${y.toFixed(2)}`;
  });
  const line = points.join(' ');
  const area = `0,${height} ${line} ${w},${height}`;
  const id = `mi-spark-${Math.abs(values.length * 7 + Math.round(max))}`;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className={`h-14 w-full ${className}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Progress ring ────────────────────────────────────────────────────── */
export function ProgressRing({ value = 0, size = 84, stroke = 8, label, tone = 'var(--gold)' }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (clamped / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gold-hairline)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.2,0.8,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-[var(--text)]">{Math.round(clamped)}%</span>
        {label && <span className="text-[9px] uppercase tracking-widest text-[var(--text-muted)]">{label}</span>}
      </div>
    </div>
  );
}

/* ── Sidebar nav item ─────────────────────────────────────────────────── */
export function SidebarItem({ icon, label, to, active, onClick, count, badge, locked, onLocked, gold }) {
  const router = useRouter();
  const handleClick = () => {
    if (locked && onLocked) return onLocked();
    if (onClick) onClick();
    if (to) router.push(to);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`mi-focus group flex w-full items-center justify-between rounded-[var(--radius-sm)] border px-3.5 py-2.5 text-left text-[13px] font-medium transition-all duration-200 ${
        active
          ? 'border-[var(--gold-hairline)] bg-[var(--gold)]/10 text-[var(--text)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--gold)_18%,transparent)]'
          : 'border-transparent text-[var(--text-muted)] hover:border-[var(--gold-hairline)] hover:bg-[var(--surface-2)]/60 hover:text-[var(--text)]'
      }`}
    >
      <span className="flex items-center gap-3">
        <span className={`transition-colors ${active ? 'text-[var(--gold)]' : 'text-[var(--text-muted)] group-hover:text-[var(--gold)]'}`}>
          {icon}
        </span>
        {label}
      </span>
      <span className="flex items-center gap-2">
        {locked && <span className="text-[11px] text-[var(--text-muted)]">🔒</span>}
        {count !== undefined && count > 0 && (
          <span className="rounded-md border border-[var(--gold-hairline)] bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--gold-soft)]">
            {count}
          </span>
        )}
        {badge && <Pill tone={badge === 'Trial' ? 'warn' : 'emerald'}>{badge}</Pill>}
      </span>
    </button>
  );
}

/* ── Buttons ──────────────────────────────────────────────────────────── */
export function GoldButton({ children, onClick, className = '', type = 'button', disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`mi-tap mi-focus relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[var(--radius-md)] bg-[var(--gold)] px-4 py-2.5 text-sm font-semibold text-[#0B1220] transition hover:brightness-110 disabled:opacity-40 ${className}`}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      <span className="mi-sheen pointer-events-none absolute inset-0 opacity-40" />
    </button>
  );
}

export function GhostButton({ children, onClick, className = '', type = 'button', to }) {
  const router = useRouter();
  return (
    <button
      type={type}
      onClick={() => {
        if (onClick) onClick();
        if (to) router.push(to);
      }}
      className={`mi-tap mi-focus inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--gold-hairline)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)] ${className}`}
    >
      {children}
    </button>
  );
}

/* ── Avatar ───────────────────────────────────────────────────────────── */
export function Avatar({ name, size = 40 }) {
  const initial = (name?.[0] || '?').toUpperCase();
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full border border-[var(--gold-hairline)] bg-gradient-to-br from-[var(--gold)]/30 to-[var(--emerald)]/20 font-bold text-[var(--text)]"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </span>
  );
}

/* ── Empty state ──────────────────────────────────────────────────────── */
export function EmptySlot({ icon = '✦', title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--gold-hairline)] px-6 py-14 text-center">
      <div className="text-2xl opacity-60">{icon}</div>
      <p className="mt-3 text-sm font-medium text-[var(--text)]">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}
