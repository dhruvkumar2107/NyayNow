# STAFF+ VERCEL DEPLOYMENT CONFIGURATION (Next.js)

This project uses **Next.js 14**. The previous Vite configurations were incorrect and have been reverted.

## 1. Vercel Dashboard Settings (MANDATORY)

Go to **Settings > General** on Vercel and configure EXACTLY:

| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Framework Preset** | `Next.js` | **IMPORTANT:** Change from Vite to Next.js |
| **Root Directory** | `client` | |
| **Build Command** | `Default` | Should resolve to `next build` |
| **Output Directory** | `Default` | Should resolve to `.next` |
| **Install Command** | `npm install` | |
| **Node.js Version** | **20.x or 18.x** | Vercel stable versions. |

---

## 2. Local Verification

Execute these steps locally to ensure the build succeeds:

```bash
cd client
rm -rf .next dist node_modules package-lock.json
npm install
npm run build
```

---

**STATUS: READY TO DEPLOY**
Push to GitHub to trigger Vercel. After pushing, update the Vercel Dashboard settings.
