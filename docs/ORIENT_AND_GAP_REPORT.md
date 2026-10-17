# W0 — Repository orientation and gap report

## Architecture summary (30 lines)

1. The repository is a monorepo, but has no `.git` directory in the supplied workspace; workstream branches and PRs cannot be created here.
2. Web client: Next.js App Router, React 19, `client/src/app`, deployed configuration is not proven to be Vercel-only.
3. API: Express/Node in `server/index.js`, with route modules under `server/routes`.
4. Data store: MongoDB via Mongoose; user, case, payment, chat, appointment, lawyer, and other workflow models under `server/models`.
5. AI: Gemini through `server/utils/aiUtils.js`; selected routes call Indian Kanoon API when configured; source/licence status is not recorded in the app.
6. Python: a separate FastAPI service exists under `python service`; it is not the main assistant request path.
7. Search/maps/payments/uploads/messaging have integrations or adapters for Algolia, eCourts, Razorpay, Cloudinary, Twilio, Bhashini, DocuSign, and email; each requires environment credentials.
8. Next.js static route generation succeeds; `client/Dockerfile` now uses standalone Next output.
9. Deployment configuration includes `render.yaml` and Compose; no Vercel config or proof of current production settings was found.
10. CI has backend-test/build and browser-test GitHub Actions workflows; the local workspace cannot report their hosted status.
11. Backend test runner is Jest; tests exist in `server/tests`; Playwright config and load-test scripts also exist.
12. `User` holds account/profile, subscription, listing, and credential-status fields; other workflow data is split across dedicated models.
13. `ChatHistory` stores role/text/timestamps and user linkage; it does not store source passage IDs, as-of dates, or verification receipts.
14. `CasePrediction` stores win probability and confidence fields without calibration/evaluation metadata.
15. `AuditLog`/`AdminAuditLog` exist, but the inspected source does not prove PII-safe retention or immutable audit guarantees.
16. Several AI workflows still need prompt and output review to ensure they do not invent legal cases or statutory provisions when sources are unavailable.
17. Several routes can fall back to generative search; that is not equivalent to a permissioned, versioned corpus.
18. The Indian Kanoon token is optional; an API token alone does not establish commercial reuse rights or permitted persistent storage.
19. New `SourceDoc`, `Passage`, and `ProofReceipt` schemas and a deterministic exact-quote/temporal verifier are scaffolding only.
20. Proof receipts remain off unless explicitly enabled with a signing secret; no ingestion pipeline or corpus is bundled.
21. `/api/public-metrics` now reports database-derived aggregates or returns unavailable; it does not fabricate defaults.
22. Public website route inventory contains 64 paths, including three routes added in this run.
23. Public claims about customer impact, security certification, advocate verification, AI accuracy, and court outcomes require evidence.
24. Pricing currently configures Pro ₹299, Gold ₹799, and Firm ₹2,999 monthly in client and backend; annual amounts/features require reconciliation.
25. Privacy deletion code exists, but its cascade coverage and external provider deletion behavior need verification.
26. SOS calls generative endpoints and can produce an unfiled complaint draft; it is not emergency dispatch, complaint filing, or verified legal advice.
27. Law-as-on-date mappings, a statute/judgment knowledge graph, entailment verification, benchmark data, and calibrated evaluation are not present.
28. There is no live WhatsApp Business webhook consent/triage service evidenced; existing Twilio WhatsApp behavior is separate and credential-dependent.
29. No signed pilots, measured traction, CAC, retention, query cost, paid conversion, MRR, cap table, fundraising ask, legal opinion, or data licence were found.
30. The user-facing language promises more than the current system can prove; this run narrows copy and creates tracked implementation and diligence work.

## Public routes found

`/`, `/about`, `/admin`, `/agreements`, `/analytics`, `/analyze`, `/assistant`, `/blog`, `/bns`, `/bns/[section]`, `/calendar`, `/career`, `/case-studies`, `/client/dashboard`, `/compliances`, `/contact`, `/courtroom-battle`, `/devils-advocate`, `/digilocker-verify`, `/disclaimer`, `/dpdp`, `/drafting`, `/ecourts`, `/forgot-password`, `/help`, `/judge-ai`, `/judge-pro`, `/judge-profile`, `/lawyer/[id]`, `/lawyer/dashboard`, `/lawyer/profile/edit`, `/lawyer/register`, `/legal-sos`, `/login`, `/marketplace`, `/meet/[id]`, `/meet`, `/messages`, `/methodology`, `/moot-court`, `/nearby`, `/nyaycourt-simulator`, `/nyayvoice`, `/payment/[id]`, `/payment/success`, `/pricing`, `/privacy`, `/professionals`, `/refund`, `/register`, `/rent-agreement`, `/research`, `/reset-password/[token]`, `/security-and-compliance`, `/settings`, `/setup-profile`, `/terms`, `/translator`, `/verification-pending`, `/video-call`, and `/voice-assistant`, `/grievance`, `/investors`, and `/methodology/benchmark`.

`/investors` and `/methodology/benchmark` are unlisted, noindex pages. Metrics show database-derived aggregates when the API is connected; the aggregates are not independently audited. `/grievance` is public and its officer details are marked [NEEDED].

## CI and test state

- `.github/workflows/ci.yml` uses `npm ci`, runs backend Jest with a MongoDB service container, then builds the client. Hosted CI was not executed from this workspace.
- `.github/workflows/playwright.yml` has a root lockfile, Playwright config, browser install, route smoke and status tests, and a client dev-server setup. Local Chromium suite passed 18/18; hosted workflow was not run.
- Final local client production build passed. `npm run lint` exits 0; Next build still emits non-fatal React Hook and `<img>` warnings across existing components.
- Backend route/middleware/AI utility syntax checks passed; proof-verifier tests passed (3 tests). Full integration tests were not run because no local MongoDB listener was available.
- Server production audit: 0 findings. Client production-only audit: 0 findings. Full client audit: 9 development-tool findings (7 high, 2 moderate); npm's clean-all recommendation requires major framework/CSS-tooling changes.
- Production smoke requests returned HTTP 200 for `/`, `/methodology/benchmark`, `/investors`, `/grievance`, and `/judge-ai`. Docker image startup remains unverified.

## Claim evidence and risk scan

The claim-by-claim register is in [CLAIMS_REGISTER.md](./CLAIMS_REGISTER.md). This report intentionally distinguishes implemented screens from verified legal, security, or business outcomes.
