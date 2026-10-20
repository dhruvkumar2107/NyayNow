'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Siren, ShieldCheck } from 'lucide-react';

const HOLD_MS = 2500;
const RADIUS = 88;
const CIRC = 2 * Math.PI * RADIUS;

export default function PressHoldSOS({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(0);

  const stopRaf = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    const pct = Math.min(elapsed / HOLD_MS, 1);
    setProgress(pct);
    if (pct >= 1) {
      setDone(true);
      setHolding(false);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 80, 200]);
      }
      onComplete?.();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [onComplete]);

  const start = useCallback(() => {
    if (done) return;
    setHolding(true);
    startRef.current = Date.now();
    stopRaf();
    rafRef.current = requestAnimationFrame(tick);
  }, [done, stopRaf, tick]);

  const cancel = useCallback(() => {
    stopRaf();
    if (!done) {
      setHolding(false);
      setProgress(0);
    }
  }, [done, stopRaf]);

  useEffect(() => () => stopRaf(), [stopRaf]);

  const offset = CIRC * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        type="button"
        aria-label="Press and hold for 3 seconds to activate Legal SOS"
        onPointerDown={(e) => {
          e.preventDefault();
          start();
        }}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            start();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') cancel();
        }}
        onContextMenu={(e) => e.preventDefault()}
        className="mi-focus relative h-56 w-56 select-none touch-none rounded-full outline-none"
      >
        <svg viewBox="0 0 200 200" className="h-56 w-56 -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="color-mix(in srgb, var(--sos) 25%, transparent)"
            strokeWidth="8"
          />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="var(--sos)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            style={{ transition: holding ? 'none' : 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>

        <span
          className={`absolute inset-6 flex flex-col items-center justify-center gap-2 rounded-full text-white shadow-[0_0_40px_rgba(215,38,61,0.45)] transition-transform ${
            holding ? 'scale-95 bg-[var(--sos)]' : done ? 'bg-[var(--emerald)]' : 'bg-[var(--sos)]'
          }`}
        >
          {done ? <ShieldCheck size={44} /> : <Siren size={44} />}
          <span className="text-xl font-black tracking-wider">
            {done ? 'SOS READY' : holding ? 'HOLDING' : 'SOS'}
          </span>
          <span className="text-[11px] opacity-90">
            {done ? 'Numbers below' : 'Press & hold 3s'}
          </span>
        </span>
      </button>

      <p aria-live="polite" className="text-sm text-[var(--text-muted)] text-center max-w-sm">
        {done
          ? 'Emergency helplines are shown below. Tap any number to dial.'
          : 'Keep holding until the ring completes. Works without an internet connection.'}
      </p>
    </div>
  );
}
