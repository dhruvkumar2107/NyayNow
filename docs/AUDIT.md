# AUDIT.md

## Architecture Map

### Tech Stack
- Frontend: Next.js 15.5.28 (App Router), React 19.2.1, TypeScript/JSX, Tailwind CSS 3.4.3
- Backend: Node.js + Express 4.18.2, Mongoose 7.8.8 (MongoDB)
- AI Service: Python FastAPI (python service at /python service/)
- Real-time: Socket.IO 4.8.3
- Auth: JWT, Google OAuth
- Payments: Razorpay
- Storage: Cloudinary
- Communications: Twilio, Nodemailer
- Search: Algolia
- Monitoring: Sentry
- Testing: Jest, Playwright

### Infrastructure
- Hosting: Vercel (client), Render/Node (server) as per render.yaml
- Database: MongoDB
- CDN: Cloudinary
## Routes
Major routes found:
- /assistant (AI)
- /marketplace
- /draft
- /legal-sos (Legal SOS)
- /nyayvoice
- /courtroom-battle (NyayCourt Simulator)
- /bns, /ipc-to-bns (BNS directory, translator)
- /professionals
- /dashboard (client)
- /lawyer (lawyer dashboard)
- /admin (admin)
- /pricing, /security, /privacy, /dpdp, /methodology
## Data Models (key)
- User, LawyerProfile, Case, Lead, Consultation, Document, Evidence, Message, Notification, Payment, Payout, Invoice, AuditLog, TrustedContact, ConsentLog, Review
- AdminAuditLog (exists)
- ChatHistory, GuestUsage, Subscription, etc.

## Features Present
- AI assistant, marketplace, drafting, Legal SOS, NyayVoice, NyayCourt Simulator
- BNS directory, 14-language support (locales), SEO, CI/CD configs
- Lawyer dashboard, client dashboard, admin console
## Security Findings (initial)
- JWT secret validation exists in server/index.js
- Helmet configured with CSP
- Rate limiting present (global, auth, AI)
- Input validation with express-validator present in routes
- CORS configured with allowlists
- Audit logging for admin actions
- PII redaction in Sentry

## Issues to fix (from prompt)
- Ensure Zod/equivalent on every input (express-validator used; expand coverage)
- Prompt-injection defences on AI endpoints
- No PII/SOS/evidence in logs
- File upload validation (type, size, extension, magic bytes) - present partially
- Signed upload URLs
- Trust wording cleanup across public pages
- Language count consistency (use single constant SUPPORTED_LANGUAGES)
- Encryption statement consistency
- Replace placeholder letter logos with text label
- Drive queries counter from real DB
- Fix BNS wording for civil docs; add governingLaw per template
- Fix dead-end CTAs
- Hide Case Studies/Press if no real content
- Add persistent 'AI guidance, not legal advice' strip
## Next Steps
Extend stack as-is, add requested components, enforce security, rebuild pages, implement dashboards.
- Performance: need to assess mobile mid-range (4G baseline)
- Accessibility: axe checks in CI needed
- Dead links/CTAs: scan public pages
