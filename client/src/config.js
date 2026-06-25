const fallbackBackend = typeof process !== 'undefined' && process.env.VERCEL === '1'
    ? 'https://nyaysathi-main.onrender.com/api'
    : 'http://localhost:4000/api';

export const API_BASE = typeof window !== 'undefined' ? "/api" : (process.env.NEXT_PUBLIC_API_URL || fallbackBackend);
export const API_HOST = typeof window !== 'undefined' ? "" : API_BASE.replace(/\/api$/, '');


