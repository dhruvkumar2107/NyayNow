'use client';

import React from 'react';

export function EmptyState({ title, description, action }) {
  return (
    <div className='text-center p-8 mi-glass-card'>
      <h3 className='text-lg font-semibold text-[var(--text)] mb-2'>{title}</h3>
      <p className='text-[var(--text-muted)] mb-4'>{description}</p>
      {action}
    </div>
  );
}
