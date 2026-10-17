# NyayNow readiness — final status

**Checked 17 October 2026.** This is a repo-based product and diligence review, not legal, investment, security, or production certification.

## Live in this codebase

- Next.js client and Node/Express API with account, lawyer marketplace, billing integrations, and AI-assisted legal workflows. Gemini is used by the Node service; selected routes can use Google Search grounding and optional Indian Kanoon search.
- Outcome-analysis endpoints, courtroom simulation, and moot-court scoring are disabled by default. Public benchmark status says no results are published.
- Source and proof receipt schemas, exact-quote/temporal verification scaffold, public metrics endpoint, investor draft, grievance page, and SOS entry are present. They do not amount to production legal verification, proof receipts, emergency dispatch, or complete grievance operations.
- Public-facing wording was narrowed where evidence was absent. Agreement records disclose account-linked storage; e-signing is unavailable. Voice file transcription no longer simulates a transcript.

## In development or unavailable

- Licensed/versioned corpus, complete temporal law mapping, source passage retrieval and response-path proof receipts.
- Counsel-reviewed benchmark and measured multilingual accuracy; calibrated outcome research.
- Production evidence vault with client-side encryption, timestamping, hash chains, and verified deletion.
- Verified lawyer onboarding opinion, WhatsApp/IVR end-to-end SOS workflow, case journey backed by lawful live court data, language QA, and operational DPDP process.
- Independent penetration test, incident runbook evidence, provider inventory, production cloud review, and security certification.

## Verification run

- Client ESLint: passed.
- Proof verifier Jest tests: 3 passed; changed server route/middleware/AI utility syntax checks passed.
- Client production build: passed after the Playwright server stopped. Next emitted existing React hook dependency and `<img>` optimization warnings; they did not fail compilation.
- Playwright Chromium suite: 18 passed, including route smoke checks and disabled/unverified feature-state assertions.
- Production-only npm audits: zero findings for client and server. The full client audit still has development-tool findings (7 high, 2 moderate).
- No local MongoDB listener was available for full API integration tests. The supplied workspace has no `.git` directory, so hosted CI/deployment status is not observable and no branch, commit, or PR was created. Deployment startup and production configuration remain unverified.

## Safe claims today

NyayNow provides AI-assisted legal-information and document workflows. It can generate editable drafts and summaries for human review. Selected routes can use third-party legal search context when configured. Outcome prediction is disabled by default. The product is building toward source-grounded and time-aware legal intelligence; it does not currently establish legal accuracy, a proprietary legal corpus/model, legal advice, filing, emergency response, verified e-signing, comprehensive lawyer credential verification, security certification, or customer outcomes.

## Required before external fundraising or public launch claims

- **[NEEDED]** Incorporation and cap table, founder/team biography and approvals, DPIIT status, amount/instrument/use of funds, and 18-month budget.
- **[NEEDED]** Indian counsel opinions for legal workflows, marketplace/BCI rules, privacy, DPDP, state rules, and third-party data rights.
- **[NEEDED]** Source licences, pilot permissions, measured traction and unit economics, evaluation data and reviewer sign-off, production/security evidence, and completed data-room documents.
- **[NEEDED]** Grievance officer identity/contact, incident ownership, retention/deletion schedules, provider data handling, and production credentials/configuration.
- Funding cannot be promised by code changes. The Karnataka ELEVATE NxT portal currently lists an application window of 13 October–13 November 2026 and support up to ₹1 crore, but applicant eligibility, the technical qualification, TRL, and required company evidence have not been confirmed. The official Startup India Seed Fund portal says the startup application deadline was 31 May 2026. See the current [funding map](./investor/funding_map.md) and recheck the official portals before acting.
- A fundable deep-tech research milestone plan, company documents, pilot evidence, and a quantified ask still require founder input and external review. The current repository does not demonstrate proprietary deep-tech/IP or validated legal-AI performance.

See [Open Items](./OPEN_ITEMS.md), [Claims Register](./CLAIMS_REGISTER.md), [Deep-tech and Funding Readiness](./DEEPTECH_AND_FUNDING_READINESS.md), and the [investor pack](./investor/README.md) for owners and evidence required. Do not send draft investor materials externally until those items have been reconciled.
