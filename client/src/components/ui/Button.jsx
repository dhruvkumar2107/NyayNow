'use client';

import React from 'react';

const base = 'mi-tap mi-focus inline-flex items-center justify-center gap-2 font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary: 'bg-[var(--gold)] text-[#0B1220] hover:brightness-110 shadow-[0_4px_24px_rgba(201,162,75,0.4)]',
  secondary: 'mi-glass-card text-[var(--text)] hover:brightness-105',
  danger: 'bg-[var(--sos)] text-white hover:brightness-110 shadow-[0_4px_24px_rgba(215,38,61,0.35)]',
  ghost: 'text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--surface)_70%,transparent)]'
};

const sizes = {
  sm: 'px-3 py-2 text-sm rounded-[var(--radius-sm)]',
  md: 'px-4 py-2.5 text-base rounded-[var(--radius-md)]',
  lg: 'px-5 py-3 text-lg rounded-[var(--radius-lg)]'
};

export default function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    />
  );
}
