# Open items / [NEEDED] register

Status as of 17 October 2026. Missing values are intentionally not inferred.

## Founder and company

- [NEEDED] Legal entity name, incorporation date, jurisdiction, CIN/LLPIN, registered office, cap table, founder shareholding, ESOP pool, existing debt/SAFE/convertibles.
- [NEEDED] DPIIT recognition number/status and eligibility to apply to any government programme.
- [NEEDED] Dhruv’s approved biography, co-founder/team roles, DSU/AIC-DSU affiliation, advisor identities and written permission to use names/logos.
- [NEEDED] Funding amount, instrument, valuation expectations (if any), 18-month monthly hiring/compute/legal budget, and milestones tied to each use of funds.

## Legal safety and licensing — release blockers for verified-law claims

- [NEEDED] Indian counsel opinion on citizen-facing legal information/drafting, advocate marketplace/listing/subscription/lead fees, BCI rules, solicitation, professional responsibility, and state-specific restrictions.
- [NEEDED] Indian Kanoon API agreement and written review of query, display, caching, excerpt, derived-work, retention, and commercial-use rights. Until then, do not ingest or persist third-party text as a licensed corpus.
- [NEEDED] India Code/gazette/Supreme Court/eCourts source terms, update rights, source hierarchy, and permitted redistribution/excerpts.
- [NEEDED] Named legal editorial reviewers for criminal and civil law; review cadence and sign-off records for statutory-version mapping.
- [NEEDED] Verified mapping rows for IPC/CrPC/Evidence Act ↔ BNS/BNSS/BSA, including commencement, amendments, transitional rules, exceptions, source IDs, and reviewer timestamps. No transition rule is approved yet.
- [NEEDED] Counsel-approved incident categories, deadline rules, state stamp-duty/registration rules, NALSA/DLSA directory provenance, and escalation wording.
- [NEEDED] SOS policy and verified state/UT legal-aid contact inventory. Current UI links to national 112 and NALSA 15100 as official contacts; test availability and display state caveats.

## Privacy/security and operations

- [NEEDED] Appointed grievance officer name, address, monitored contact channel, and response ownership; do not invent an officer identity.
- [NEEDED] DPDP Act/Rules counsel review, consent text by purpose and processor, age/minor treatment, purpose-to-field map, retention/deletion schedule, backup expiry, cross-border/provider location inventory, and data-principal request SOP.
- [NEEDED] Breach detection/escalation runbook, notification decision tree, incident owner, tabletop evidence, and contact details.
- [NEEDED] Evidence vault threat model, client-side encryption and key-loss/recovery model, approved timestamp authority, privacy test, and deletion verification. Feature not implemented.
- [NEEDED] Penetration-test report, cloud configuration evidence, access review, secret rotation, backup restore test, and certification status. No SOC 2 report found; do not claim compliance.
- [NEEDED] Confirm email, SMS, WhatsApp, analytics, error reporting, cloud storage, model provider, and payment processors and their data handling terms.
- [NEEDED] Runtime credentials for MongoDB, Gemini, Indian Kanoon (only if permitted), Razorpay, Twilio, Cloudinary, Bhashini, DocuSign, email/SMTP, analytics, and production origins. No secrets are stored in this repo.

## Product evidence and fundraising

- [NEEDED] Signed pilot/design-partner letters, named consent for public case studies, baseline and measured workflow outcomes, repeat usage, and human review protocol.
- [NEEDED] Canonical live metrics definitions and owner: registered accounts, MAU, weekly queries, active paid accounts, lawyers with verified credential evidence, MRR, refunds, retention, conversion, CAC, and response time.
- [NEEDED] Cost-per-query by feature/model/token, currency/tax basis, storage/network overhead, gross margin and payback calculations.
- [NEEDED] Paid-user/transaction count must reconcile payment ledger, refunds, subscription status, and plan code before investor display.
- [NEEDED] Prospective, counsel-reviewed evaluation corpus: 50 initial cases and 2,500 scaling plan, consent/licensing, date cut-off, languages, gold labels, adjudication, benchmark baseline, confidence intervals, and negative/rejection cases.
- [NEEDED] Official current lawyer-to-citizen, legal-aid-gap, BNS-transition, and addressable-market data with dates/methodology. One live NJDG district-case snapshot is sourced on the investors page; it is not TAM.
- [NEEDED] Business ask, runway, use of proceeds, revenue/expense forecasts, legal entity and cap table files.
- [NEEDED] Confirm eligibility and intake timing for each grant/incubator. As of 17 Oct 2026, the official Startup India Seed Fund Scheme page says startup applications closed 31 May 2026; do not present it as currently open.
- [NEEDED] During ELEVATE NxT's listed 13 Oct–13 Nov 2026 window, verify NyayNow's entity/team/turnover/TRL criteria and whether its technical depth/IP qualifies. The ELEVATE NxT page says Pan-India, while the general terms page says Karnataka registration/workforce; get written clarification. Eligibility is not established by this code review.

## Engineering acceptance items

- [NEEDED] Restore/confirm Git repository and branches; current supplied workspace has no `.git` folder. No PRs or workstream branches can be produced here.
- [NEEDED] Run hosted CI and document its result. Local Playwright root install/config was exercised successfully; the full API suite still depends on MongoDB.
- [NEEDED] Provision a test MongoDB to run integration tests and the production API in a staging environment; Docker CLI was not available in the prior environment.
- [NEEDED] Licensed, versioned legal documents and counsel-reviewed evaluator before enabling `PROOF_RECEIPTS_ENABLED`.
- [NEEDED] Counsel-reviewed lawful-source retrieval and human-evaluated rubric before enabling `EXPERIMENTAL_COURTROOM_SIMULATION_ENABLED`; the previous generated rulings and heuristic scores were withdrawn.
- [NEEDED] Independent moot-court scoring/citation evaluation and qualified reviewer before enabling `EXPERIMENTAL_MOOT_COURT_ENABLED`.
- [NEEDED] Implement proof receipt creation in the response path, public-receipt access controls, cryptographic key rotation, revocation/correction model, trust/entailment checks, audit trail, and latency/load tests.
- [NEEDED] Cross-check the content of every route, locale, image/logo, generated prompt, email/template, PDF and downloadable public document against the claim register before release.
