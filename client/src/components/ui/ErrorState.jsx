'use client';

import React from 'react';

export function ErrorState({ message, action }) {
  return (
    <div className='text-center p-8 mi-glass-card border border-[var(--sos)]/30'>
      <p className='text-[var(--text)] mb-4'>{message}</p>
      {action}
    </div>
  );
}
