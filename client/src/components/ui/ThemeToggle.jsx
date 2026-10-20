'use client';

import React from 'react';

export function ThemeToggle() {
  React.useEffect(() => {
    const stored = localStorage.getItem('nyaynow:theme');
    if (stored) {
      document.documentElement.setAttribute('data-theme', stored);
    }
  }, []);

  function toggle() {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    const nxt = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nxt);
    localStorage.setItem('nyaynow:theme', nxt);
  }

  return (
    <button onClick={toggle} className="mi-tap mi-focus px-3 py-2 rounded-[var(--radius-md)] mi-glass-card text-[var(--text)] text-sm">
      Theme
    </button>
  );
}
