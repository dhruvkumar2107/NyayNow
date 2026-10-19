# NyayNow Build Decisions Log

- Extend existing stack (Node/Express + Next.js + FastAPI) per instructions.
- No rewrites; preserve all working features.
- Add audit/docs and security hardenings.
- Trust cleanup implemented in Legal SOS; factual metrics; truthful copy.
- Design system tokens added as requested.
- Audit file created: /docs/AUDIT.md.
- Continuing audit and implementing required changes.
- Created design tokens (Midnight Ivory), theme utils, languages constant (14 languages), AI guidance strip.
- Added data seed files (ipc-bns-map.json, fir-ladder.json) with legalReview flags.
- Cleaned .env.example files with required keys.
- Updated LEGAL_REVIEW.md with verified items.
- Added IPC-to-BNS translator data files + utils; seeded fir-ladder.

## Phase C (2026-10-18)
- FIX: several Phase B files were corrupted by earlier shell (PowerShell) writes — template
  literals lost their backticks, `AIGuidanceStrip.jsx` and `languages.js` began with a
  markdown `#` line, and `Skeleton.jsx`/`Button.jsx`/`GlassCard.jsx` had malformed `className`.
  All file writes are now done through the editor tool, never shell redirection. Reworked:
  Button, GlassCard, Skeleton, AIGuidanceStrip, languages.js.
- IPC-to-BNS: canonical data lives at `client/src/data/ipc-bns-map.json` because the client is
  the Vercel root with `output: 'standalone'` (files outside `client/` are not traced/bundled).
  The same file is mirrored to repo-root `data/ipc-bns-map.json` for the server/API.
  37 seed mappings, every item flagged `pending-counsel-review` with a disclaimer and an
  India Code source link.
- Added public read-only API `GET /api/ipc-bns` (+ `/api/ipc-bns/:ipc`, `/api/ipc-bns/meta/categories`),
  registered in `server/index.js`.
- Added `/ipc-to-bns` page (server component with SEO metadata + JSON-LD ItemList) and
  `IpcToBnsClient` (search + category filter + copy).
- Added `/ipc-to-bns` to `client/src/app/sitemap.js` and the server sitemap in `server/index.js`.
- Legal SOS rebuilt as `PressHoldSOS` (3s press-and-hold, SVG progress ring, offline) plus a
  server-rendered page with tap-to-dial helplines: 112, 1091, 1098, 15100, 1930.
- Verified: `next build` succeeds and emits `/ipc-to-bns`; ESLint clean on new files;
  `require('./server/routes/ipcBns')` loads; lookup IPC 420 -> BNS 318.
- Note: `POST /api/ai/assistant` already uses `verifyTokenOptional` + aiLimiter, so a
  "no-signup first answer" hero widget can reuse it without new backend auth work.

## Phase D (2026-10-18)
- NyayProof: added a Section 63 BSA (Bharatiya Sakshya Adhiniyam, 2023) certificate *draft*
  generator. Template `data/bsa63-certificate.json` (mirrored to `client/src/data/`) with
  Part A (person in charge) and Part B (expert hash) clauses, `legalReview: true`,
  `reviewStatus: pending-counsel-review`, India Code source, and a strong
  "DRAFT - NOT A VALID CERTIFICATE" disclaimer. Client-side only; nothing is stored.
  Page `/nyayproof` (`page.js` server component + `NyayProofClient.jsx`). Added to both
  sitemaps and to the Playwright smoke suite.
- Honesty SSR fix: the "in development / disabled" notices on `/judge-ai` and
  `/nyaycourt-simulator` were rendered only inside `dynamic(..., { ssr: false })` client
  chunks, so they were absent from the server HTML (bad for SEO and for smoke tests).
  Added `client/src/components/InDevelopmentNotice.jsx` (server component) and gated the
  pages at render time on `NEXT_PUBLIC_EXPERIMENTAL_*` env flags. Disabled state now ships
  in SSR HTML; heavy simulator/analysis chunks load only when the flags are enabled.
  Route bundle for both pages dropped ~111 kB -> 1.41 kB in the default (disabled) state.
- Stale smoke test: `next.config.mjs` permanently redirects `/courtroom-battle` ->
  `/nyaycourt-simulator`, but the test navigated to the redirected URL. Pointed the test at
  the canonical route and removed the redirected `/courtroom-battle` from both sitemaps
  (sitemaps must list 200, canonical URLs only).
- Verified: `next build` succeeds; ESLint clean on all changed/new files;
  `node --check` clean on `server/index.js`; full Playwright suite 23/23 pass.

## Phase D2 (2026-10-18)
- Extracted CORS origin allowlist logic from `server/index.js` into
  `server/utils/corsConfig.js` (`buildAllowedOrigins`, `inspectOriginConfig`,
  `logOriginConfig`). Startup now logs the resolved allowlist and warns (non-throwing)
  about insecure `http://` origins, wildcards, duplicates, scheme-less entries, and a
  production run with neither `CLIENT_URL` nor `ALLOWED_ORIGINS` set.
- Added `server/tests/corsConfig.test.js` (9 tests) as a regression guard. Server Jest
  suite for the changed area: 16/16 pass (`corsConfig` + `ipcBns`).

## Phase E/F - Dashboards in Midnight Ivory (2026-10-18)
- Introduced a shared Midnight Ivory dashboard kit
  (`client/src/components/dashboard/mi/MIPrimitives.jsx`): `MIBackdrop`, `Panel`,
  `SectionHeading`, `Pill` (gold/emerald/warn/sos/muted), `AnimatedNumber`, `StatTile`,
  `Sparkline`, `ProgressRing`, `SidebarItem`, `GoldButton`, `GhostButton`, `Avatar`,
  `EmptySlot`. Added supporting keyframes/utilities to `globals.css`
  (`mi-float-a/b`, `mi-sheen`, `mi-rise`, `.mi-orb-a/b`, `.mi-scroll`, `.mi-hairline`,
  `.mi-card-hover`) with a `prefers-reduced-motion` guard.
- Rebuilt all three dashboards on MI tokens with no logic changes:
  - `ClientDashboard.jsx`: fixed left sidebar, bento grid, Getting Started checklist,
    active-case hero, Legal Pulse feed, financial overview, schedule/readiness rings,
    new-case + instant-consult modals, paywall. All hooks/handlers/socket/plan-gating
    preserved verbatim.
  - `LawyerDashboard.jsx`: counsel-OS sidebar (Command Center / Communication / AI
    Practice Suite / Finance), stat tiles, revenue area chart (gold gradient), case
    lifecycle Kanban, lead pool, CRM, notices, research hub, ECourts, calendar, agenda,
    pulse timeline, invoice modal. All dynamic imports, recharts, socket handlers and
    toasts preserved.
  - `AdminDashboard.jsx` + `DashboardLayout.jsx`: MI glass layout, verification queue,
    lawyer/client registries, feature matrix editor, audit logs, platform-health stats.
- Restyled `PremiumLoader.jsx` from indigo `#020617` to MI tokens.
- Verified: `next build` succeeds (all three dashboards compile); ESLint clean on changed
  files (one pre-existing `exhaustive-deps` warning on `LawyerDashboard`); Playwright
  smoke suite passes (timeouts on untouched public routes observed under full parallelism
  are cold dev-server compile flakes, pass at `--workers=1`).
- Note: MI shells previously wrapped legacy sub-widgets (`LegalReels`, `KanbanBoard`,
  `CalendarWidget`, `ClientCRM`, confession booth) that retained slate/indigo styling;
  these were reskinned to MI tokens in the follow-up below.

## Phase G - Payments hardening (2026-10-18)
- Fixed a real webhook defect: the Razorpay webhook route declared `express.raw()`, but the
  global `app.use(express.json())` in `server/index.js` parses the body before routes are
  mounted, so `express.raw` was a no-op and HMAC was computed over a re-serialized object
  (never matching -> the handler always fell into its catch and ACKed 200). Now the global
  JSON parser captures the exact bytes via `express.json({ verify: (req,res,buf) => req.rawBody = buf })`
  and `server/routes/payments.js` HMACs `req.rawBody`. Rejects with 400 when no capturable
  raw body is present.
- Switched signature comparisons to constant-time (`crypto.timingSafeEqual`) in both the
  webhook (`payments.js`) and `paymentService.verifySignature` (with a length guard, and a
  false return when `RZP_KEY_SECRET` is unset or the signature is not a string).
- Added `server/tests/paymentSignature.test.js` (7 tests): signature accept/tamper/no-secret
  cases plus a raw-body capture + valid/invalid webhook HMAC flow. Full non-DB server suite
  green (see note below on the pre-existing DB-dependent `otp.test.js`).
- No secrets are exposed client-side (only the public Razorpay key *ID*, by design).

## Phase H - AI quality telemetry (2026-10-18)
- Added `server/utils/aiQualitySignals.js`: `assessAiResponse(data)` computes content-free
  signals from an AI response body — `hasDisclaimer`, `citationLikeCount`, `hasOutcomeClaim`.
  It never validates citation accuracy and never stores response text.
- Wired it into `server/middleware/aiAudit.js` so the audit log now records the three
  aggregate signals per AI response (`aiHasDisclaimer`, `aiCitationCount`, `aiOutcomeClaim`)
  alongside the existing metadata. Content is still never written to the audit log; these
  flags give operators visibility into disclaimer coverage and outcome-guarantee leakage.
- Added `server/tests/aiQualitySignals.test.js` (5 tests). This is telemetry only — it is
  NOT marketed as, and must not be described as, an accuracy or hallucination metric. See
  `docs/adr/ADR-0001-source-proof-records.md`.

## Phase E/F2 + G2 - Dashboard reskin, webhook dedup, plan unification (2026-10-18)
### Legacy dashboard sub-widgets reskinned to Midnight Ivory
- `KanbanBoard.jsx`, `CalendarWidget.jsx`, `LegalReels.jsx`, `lawyer/ClientCRM.jsx`,
  `client/TrustTimeline.jsx` (also fixed the invalid lowercase `divItem` component ->
  `StepDot`), `client/LegalConfessionBooth.jsx` (also removed non-purgeable dynamic
  `bg-${catColor}-500` classes that Tailwind never generates), and `BookingModal.jsx`
  (Razorpay checkout theme now MI gold `#C9A24B`). Logic/handlers preserved; neutralized
  unverifiable "Neural Database / Encryption P0 / Neural Link" copy to plain labels.
- Verified: `next build` succeeds; ESLint 0 errors (4 pre-existing `exhaustive-deps` warnings).

### Payment webhook idempotency
- Added `server/models/WebhookEvent.js` (unique `key`) and `server/utils/webhookDedup.js`
  (`buildWebhookDedupKey`: provider payment id -> subscription id + event -> event id).
  `server/routes/payments.js` now records each event and returns `{ duplicate: true }` on
  replays. Dedup store failures are logged and processing continues (never drops events).
- Added a DB-level replay guard: `Payment.paymentId` is now `unique: true`. NOTE: on an
  existing deployment, verify no duplicate/blank `paymentId` rows before deploy, or index
  creation will fail.
- Added `server/tests/webhookDedup.test.js` (5 tests).

### Single-source plan catalogue
- Added `server/config/plans.js` as the one source of truth: `SUBSCRIPTION_PLANS`
  (pro/gold/firm), `LISTING_CONFIG`, `CREDIT_PACKS`, `PLAN_PRICES_PAISE`, and
  `normalizePlanId`. `routes/subscriptions.js` now imports the catalogues instead of
  redefining them; `services/paymentService.js` re-exports `PLAN_PRICES_PAISE` from it.
- Resolved the drift: legacy one-time names map to canonical tiers (`silver -> pro`,
  `diamond -> firm`) and legacy env overrides `RZP_AMOUNT_SILVER`/`RZP_AMOUNT_DIAMOND` are
  still honored (new `RZP_AMOUNT_PRO`/`RZP_AMOUNT_FIRM` take precedence). Behaviour change:
  a one-time purchase of `gold`/`diamond` now prices at the canonical monthly rate
  (₹799 / ₹2999) instead of the old ₹599 / ₹999. Current client flow uses the subscription
  route for plans, so practical impact is limited — but treat as a billing change.
- Added `server/tests/plans.test.js` (5 tests).
- Server Jest (non-DB) suite for the changed areas: 22/22 pass
  (`plans`, `webhookDedup`, `paymentSignature`, `aiQualitySignals`).



