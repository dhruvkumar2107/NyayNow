'use client';

import React from 'react';

export function LanguageSwitcher({ languages=[], onChange }) {
  const langs = languages.length ? languages : [{code:'en',name:'English'},{code:'hi',name:'हिन्दी'}];
  const [cur, setCur] = React.useState('en');

  return (
    <select value={cur} onChange={(e)=>{setCur(e.target.value); onChange?.(e.target.value);}} className="mi-tap mi-focus px-3 py-2 rounded-[var(--radius-md)] mi-glass-card text-[var(--text)] bg-transparent border-none">
      {langs.map(l=> <option key={l.code} value={l.code}>{l.name}</option>)}
    </select>
  );
}
