# PROVEN VERCEL DEPLOYMENT CONFIG DO NOT EDIT

This project has been patched to fix PostCSS/Autoprefixer failures and Node version mismatches.
**Follow this guide EXACTLY.**

## 1. Vercel Project Settings (Dashboard)

Go to **Settings > General** and ensure:

| Setting | Value |
| :--- | :--- |
| **Framework Preset** | `Vite` |
| **Root Directory** | `client` |
| **Build Command** | `vite build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node.js Version** | **18.x** (Strictly required) |

---

## 2. Deployment Checklist

1.  **Delete any existing lockfile** locally and re-install to confirm:
    ```bash
    cd client
    rm package-lock.json
    npm install
    npm run build
    ```
    *(If this passes locally, it WILL pass on Vercel)*

2.  **Commit everything:**
    - `.nvmrc` (Crucial)
    - `.vercelignore` (Speeds up build)
    - `package.json` (Locked versions)

3.  **Push to GitHub.**

---

## 3. Final Corrected Files

### `package.json` (Strict Locked Versions)
```json
{
  "name": "nyay-sathi-client",
  "version": "1.0.1",
  "private": true,
  "type": "module",
  "engines": {
    "node": "18.x"
  },
  "packageManager": "npm@10.2.4",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "@sentry/react": "8.26.0",
    "axios": "1.6.0",
    "posthog-js": "1.131.4",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-helmet-async": "2.0.5",
    "react-hot-toast": "2.4.1",
    "react-markdown": "9.0.1",
    "react-router-dom": "6.22.3",
    "react-signature-canvas": "1.0.6",
    "remark-gfm": "4.0.0",
    "socket.io-client": "4.7.5"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "4.2.1",
    "autoprefixer": "10.4.19",
    "postcss": "8.4.38",
    "tailwindcss": "3.4.3",
    "vite": "5.2.11",
    "node-releases": "2.0.14"
  }
}
```

### `postcss.config.js` (Robust ESM)
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### `vite.config.js` (Production Optimized)
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:4002",
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    target: 'esnext',
  }
});
```

### `.nvmrc`
```text
18.20.4
```

### `.vercelignore`
```text
.vercel
.output
dist
node_modules
.env
.env.local
.git
.github
.DS_Store
coverage
README.md
```
