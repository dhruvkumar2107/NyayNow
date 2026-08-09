// Client-side: use relative path (Next.js rewrites will proxy)
// Server-side: use full backend URL for SSR
const isServer = typeof window === 'undefined';
const fallbackBackend = 'https://nyaysathi-main.onrender.com/api';

export const API_BASE = isServer ? fallbackBackend : "/api";
export const API_HOST = isServer ? fallbackBackend.replace(/\/api$/, '') : "";


