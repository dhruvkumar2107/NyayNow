import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./styles.css";

import { GoogleOAuthProvider } from '@react-oauth/google';
import posthog from 'posthog-js';
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from "@sentry/react";

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Initialize PostHog (Analytics)
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
if (POSTHOG_KEY && POSTHOG_KEY.startsWith('phc_')) {
  posthog.init(POSTHOG_KEY, {
    api_host: 'https://app.posthog.com',
    loaded: (posthog) => {
      if (import.meta.env.DEV) posthog.opt_out_capturing();
    },
  });
} else {
  console.info("ℹ️ PostHog: Skipping initialization (No valid API key found)");
}

console.log("Rendering Main entry point");
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) console.warn("⚠️ VITE_GOOGLE_CLIENT_ID is missing in .env");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);
