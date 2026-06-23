# How to Get Your API Keys

This guide explains how to get the free API keys for the startup features (Sentry & PostHog).

## 1. PostHog (for Analytics)
*Tracks user visits, clicks, and behavior.*

1.  Go to [us.posthog.com/signup](https://us.posthog.com/signup).
2.  Sign up (Free tier is generous).
3.  Create a new "Project" (name it `NyayNow`).
4.  Select "Web / React" if asked (or just skip).
5.  Go to **Project Settings** (gear icon on the left sidebar).
6.  Scroll down to **"Project API Key"**.
7.  Copy the key (starts with `phc_...`).
8.  **This is your `VITE_POSTHOG_KEY`.**

## 2. Sentry (for Error Tracking)
*Notifications when your app crashes.*

1.  Go to [sentry.io/signup](https://sentry.io/signup).
2.  Create an account (Free Developer plan).
3.  Click **"Create Project"**.
4.  Choose **"React"** (for Frontend) or **"Node.js"** (for Backend). **Create one for each if used in both.**
5.  Give it a name (e.g., `nyaynow-client`).
6.  Skip the setup wizard and go to **Settings** -> **Client Keys (DSN)**.
7.  Copy the **DSN** URL (looks like `https://example@o123.ingest.sentry.io/456`).
8.  **This is your `VITE_SENTRY_DSN` (for client) or `SENTRY_DSN` (for server).**

## 3. Cloudinary (for Image Uploads)
*Stores verified ID cards and profile pics.*

1.  Go to [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free).
2.  Sign up.
3.  On the **Dashboard**, you will see:
    *   **Cloud Name** -> `CLOUDINARY_CLOUD_NAME`
    *   **API Key** -> `CLOUDINARY_API_KEY`
    *   **API Secret** -> `CLOUDINARY_API_SECRET`

---

## Where to Put Them?
Add these keys to your **Netlify** (for VITE_ vars) and **Render** (for Server vars) dashboards as env variables.
