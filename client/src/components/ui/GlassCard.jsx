'use client';

import React from 'react';

export function GlassCard({ className = '', children, ...props }) {
  return (
    <div className={`mi-glass-card relative mi-grain p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default GlassCard;
