# NyayNow — Technical Overview
### AI Legal Intelligence & Lawyer Marketplace for India
**Domain:** [nyaynow.in](https://nyaynow.in) &nbsp;|&nbsp; **GitHub:** [dhruvkumar2107/NyayNow](https://github.com/dhruvkumar2107/NyayNow) &nbsp;|&nbsp; **Version:** 2.0.0

---

## 1. 🗺️ SITE MAP

### 🏠 Public Pages
| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with Bento grid, comparison section, Legal SOS |
| `/about` | About Us | Company mission, team, story |
| `/contact` | Contact | Contact form with email integration |
| `/pricing` | Pricing | Subscription plans and feature tiers |
| `/blog` | Blog | Legal news and articles |
| `/career` | Careers | Job openings |
| `/professionals` | For Professionals | Luxury feature showcase for lawyers |
| `/case-studies` | Case Studies | Real-world platform impact |
| `/methodology` | Methodology | How NyayNow AI works |
| `/security-and-compliance` | Security & Compliance | DPDP, privacy, legal compliance |

### 🤖 AI-Powered Tools
| Route | Page | Description |
|-------|------|-------------|
| `/assistant` | NyaySathi AI | Main AI legal assistant chatbot |
| `/judge-ai` | Judge AI | Case outcome predictor (ML-based) |
| `/judge-pro` | Judge Pro | Advanced case analysis for lawyers |
| `/research` | Legal Research | AI-powered case law and statute search |
| `/drafting` | Document Drafting | AI contract and document generator |
| `/analyze` | Document Analyzer | Upload & analyze legal PDFs |
| `/nyayvoice` | NyayVoice | Multilingual voice legal assistant |
| `/voice-assistant` | Voice Assistant | Browser-based voice interface |
| `/courtroom-battle` | Courtroom Battle | AI vs AI legal argument simulation |
| `/moot-court` | Moot Court | Legal argumentation practice tool |
| `/nyaycourt-simulator` | NyayCourt Simulator | Full courtroom simulation |
| `/devils-advocate` | Devil's Advocate | Counter-argument generator |

### ⚖️ Lawyer & Marketplace
| Route | Page | Description |
|-------|------|-------------|
| `/marketplace` | Lawyer Marketplace | Find & filter verified lawyers (Algolia search) |
| `/lawyer/:id` | Lawyer Profile | Individual lawyer public profile page |
| `/legal-sos` | Legal SOS | Emergency legal help, 24/7 panic button |
| `/nearby` | Nearby Services | AI-powered map of courts, lawyers, police stations |
| `/ecourts` | eCourts | Live Indian court case status tracker |
| `/meet` | Video Meet | Jitsi-based secure video consultation |
| `/video-call` | Video Call | Instant video call with lawyers |
| `/agreements` | Agreements | AI contract generator & management |
| `/rent-agreement` | Rent Agreement | Automated rent agreement builder |

### 📊 Dashboards (Authenticated)
| Route | Page | Description |
|-------|------|-------------|
| `/client` | Client Dashboard | Cases, appointments, invoices, messages |
| `/messages` | Messages | Real-time messaging (Socket.io) |
| `/calendar` | Calendar | Appointment and court date sync |
| `/analytics` | Analytics | Personal usage analytics |
| `/settings` | Settings | Profile and account settings |
| `/payment` | Payment | Razorpay payment gateway |
| `/compliances` | Compliances | DPDP compliance tracker |

### 🏛️ Lawyer-Only (Authenticated)
| Route | Page | Description |
|-------|------|-------------|
| `/judge-profile` | Judge Profile | Judicial profile management |
| `/setup-profile` | Setup Profile | Lawyer onboarding & profile completion |
| `/digilocker-verify` | DigiLocker Verify | Bar Council ID verification |
| `/verification-pending` | Verification Pending | Status page during verification |

### 🔐 Auth Pages
| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Email + Google OAuth login |
| `/register` | Register | New user registration with role selection |
| `/forgot-password` | Forgot Password | Password reset flow |

### 📋 Legal & Compliance
| Route | Page | Description |
|-------|------|-------------|
| `/privacy` | Privacy Policy | DPDP-compliant privacy policy |
| `/terms` | Terms of Service | Platform terms |
| `/disclaimer` | Disclaimer | Legal disclaimer |
| `/refund` | Refund Policy | Subscription refund policy |

### 🛠️ Admin & System
| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Admin Panel | Platform analytics, user management |
| `/help` | Help Center | FAQs and support documentation |

---

## 2. 🏗️ TECH STACK

### Frontend
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 14.1.0 | SSR/SSG React framework |
| **Language** | JavaScript (JSX) | ES2022 | Component logic |
| **Styling** | Tailwind CSS | 3.4.3 | Utility-first CSS |
| **Animations** | Framer Motion | 12.33.0 | Page & micro animations |
| **Smooth Scroll** | Lenis | 1.3.17 | Buttery smooth scrolling |
| **Icons** | Lucide React | 0.344.0 | Icon library |
| **Maps** | React Leaflet | 4.2.1 | Interactive maps (Nearby page) |
| **Charts** | Recharts | 2.12.2 | Analytics dashboards |
| **Search** | Algolia InstantSearch | 7.23.2 | Lawyer marketplace search |
| **Auth (Google)** | @react-oauth/google | 0.13.4 | Google One Tap login |
| **Real-time** | Socket.io Client | 4.7.5 | Live chat & Legal Uber |
| **Notifications** | React Hot Toast | 2.4.1 | Toast alerts |
| **PDF Generation** | jsPDF + AutoTable | 4.2.0 | Client-side PDF export |
| **E-Signing** | React Signature Canvas | 1.0.6 | Document digital signing |
| **Markdown** | React Markdown | 9.0.1 | AI response rendering |
| **Confetti** | Canvas Confetti | 1.9.2 | Celebration animations |
| **Counter** | React CountUp | 6.5.0 | Animated stat counters |
| **Fonts** | Google Fonts (Inter, Plus Jakarta Sans) | — | Premium typography |
| **Error Tracking** | Sentry React | 8.26.0 | Frontend error monitoring |
| **Analytics** | PostHog | 1.131.4 | Product analytics |

### Backend
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | ≥18.0.0 | JavaScript server runtime |
| **Framework** | Express.js | 4.18.2 | REST API server |
| **Real-time** | Socket.io | 4.8.3 | WebSocket server (chat, Legal Uber) |
| **Authentication** | JWT (jsonwebtoken) | 9.0.3 | Stateless auth tokens |
| **Password** | bcryptjs | 3.0.3 | Password hashing |
| **OAuth** | google-auth-library | 10.5.0 | Google token verification |
| **File Uploads** | Multer | 1.4.5 | Multipart file handling |
| **PDF Parsing** | pdf-parse | 2.4.5 | Extract text from uploaded PDFs |
| **Email** | Nodemailer | 8.0.1 | Transactional emails |
| **WhatsApp/SMS** | Twilio | 5.12.1 | WhatsApp webhook & SMS alerts |
| **Payments** | Razorpay | 2.9.6 | Indian payment gateway |
| **E-Signing** | DocuSign API | 8.6.0 | Legal document e-signing |
| **Security** | Helmet | 8.1.0 | HTTP security headers (CSP, HSTS) |
| **Rate Limiting** | express-rate-limit | 8.2.1 | Brute-force & DDoS protection |
| **Compression** | compression | 1.8.1 | Gzip response compression |
| **Error Tracking** | Sentry Node | 10.32.1 | Backend error monitoring |
| **Profiling** | @sentry/profiling-node | 10.32.1 | Performance profiling |
| **HTTP Client** | axios | 1.5.0 | Outbound HTTP requests |

### Database
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Database** | MongoDB Atlas | Cloud | Primary NoSQL database |
| **ODM** | Mongoose | 7.8.8 | MongoDB object modeling |
| **Connection** | MongoDB Atlas M0 | Free Tier | Cloud-hosted cluster |

#### Database Models (17 Collections)
| Model | Purpose |
|-------|---------|
| `User` | Clients, lawyers, judges — all roles |
| `Case` | Legal case records and status |
| `Appointment` | Booking and scheduling data |
| `Message` | Real-time chat messages |
| `ChatHistory` | AI conversation persistence |
| `Connection` | Lawyer-client follow/connect graph |
| `Agreement` | AI-generated contracts |
| `Invoice` | Lawyer billing records |
| `Payment` | Razorpay transaction records |
| `Notification` | In-app alert system |
| `Post` | Community feed posts |
| `Topic` | Discussion topics/threads |
| `Event` | Calendar events & court dates |
| `CRMClient` | Lawyer CRM contact entries |
| `CasePrediction` | Judge AI prediction results |
| `AuditLog` | Security audit trail |
| `Confession` | Anonymous legal confession booth |

### AI & Intelligence
| Service | Provider | Purpose |
|---------|----------|---------|
| **Legal AI** | Google Gemini 2.5 Flash | Main AI assistant, Judge AI, research |
| **Multilingual NLP** | Gemini (multi-language) | NyayVoice 12+ Indian languages |
| **Document OCR** | PDF-parse + Gemini Vision | Lawyer Bar Council verification |
| **Case Grounding** | Indian Kanoon links | Real case law citations |
| **Search & Ranking** | Algolia | Lawyer marketplace full-text search |

### Infrastructure & DevOps
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **CI/CD** | GitHub Actions | Auto-test and deploy pipeline |
| **Containerization** | Docker | Local development containers |
| **Testing** | Playwright + Jest/Vitest | E2E and unit tests |
| **Error Monitoring** | Sentry (Frontend + Backend) | Real-time crash reporting |
| **Product Analytics** | PostHog | User behavior analytics |
| **Version Control** | Git + GitHub | Source control |

---

## 3. 🚀 DEPLOYMENT ARCHITECTURE

```
                        ┌─────────────────────────────────┐
                        │         USERS (Internet)         │
                        └──────────────┬──────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                                      │
          ┌─────────▼──────────┐             ┌────────────▼────────────┐
          │   FRONTEND          │             │      BACKEND API         │
          │   Vercel            │             │      Render.com          │
          │   nyaynow.in        │◄───REST─────│   nyaysathi-main         │
          │   Next.js 14 SSR    │◄───WSS──────│   .onrender.com          │
          │   Global CDN        │             │   Node.js + Express      │
          │   Auto-HTTPS        │             │   Socket.io              │
          └────────────────────┘             └────────────┬────────────┘
                                                          │
                    ┌─────────────────────────────────────┤
                    │                   │                  │
          ┌─────────▼──────┐  ┌────────▼───────┐ ┌───────▼────────┐
          │  MongoDB Atlas  │  │   Cloudinary   │ │  Google Gemini │
          │  Cloud Database│  │  File Storage  │ │  AI API        │
          │  (Free M0)     │  │  Images/PDFs   │ │  (Gemini 2.5)  │
          └────────────────┘  └────────────────┘ └────────────────┘
                    │
          ┌─────────▼──────────────────────────────────────────────┐
          │              THIRD-PARTY INTEGRATIONS                   │
          │  Razorpay (Payments) │ Twilio (WhatsApp/SMS)           │
          │  Algolia (Search)    │ DocuSign (E-Signing)            │
          │  Sentry (Errors)     │ PostHog (Analytics)             │
          │  Jitsi (Video Calls) │ DigiLocker (Verification)       │
          └────────────────────────────────────────────────────────┘
```

### Service URLs

| Service | Platform | URL / Location |
|---------|----------|---------------|
| **Frontend** | Vercel | `https://nyaynow.in` |
| **Backend API** | Render.com | `https://nyaysathi-main.onrender.com` |
| **Database** | MongoDB Atlas | `cluster0.iofqvq2.mongodb.net` (Cloud) |
| **File Storage** | Cloudinary | `res.cloudinary.com` |
| **AI Engine** | Google AI Studio | Gemini 2.5 Flash API |
| **Payments** | Razorpay | `checkout.razorpay.com` |
| **WhatsApp** | Twilio | Webhook via backend |
| **Search** | Algolia | `*.algolia.net` |
| **Error Tracking** | Sentry | `*.sentry.io` |
| **Analytics** | PostHog | `app.posthog.com` |
| **Video Calls** | Jitsi Meet | `meet.jit.si` (embedded) |
| **Source Code** | GitHub | `github.com/dhruvkumar2107/NyayNow` |

---

## 4. 🔌 API ROUTE CATALOGUE

### Base URL: `https://nyaysathi-main.onrender.com`

| Route | Methods | Description |
|-------|---------|-------------|
| `GET /healthz` | GET | Server health check (DB status, memory, uptime) |
| `/api/auth` | POST | Register, login, Google OAuth, password reset |
| `/api/ai` | POST | Gemini AI — assistant, judge, research, drafting, voice |
| `/api/lawyers` | GET, POST, PUT | Lawyer listing, profile, search |
| `/api/users` | GET, PUT, DELETE | User profile CRUD |
| `/api/messages` | GET, POST | Real-time messages (REST + Socket.io) |
| `/api/chats` | GET, POST | AI chat history persistence |
| `/api/appointments` | GET, POST, PUT | Book and manage appointments |
| `/api/payments` | POST | Razorpay order creation & verification |
| `/api/subscriptions` | GET, POST, DELETE | Recurring subscription management |
| `/api/leads` | GET, POST | Pay-per-lead system for lawyers |
| `/api/cases` | GET, POST, PUT | Case file management |
| `/api/agreements` | GET, POST | AI-generated contracts |
| `/api/invoices` | GET, POST | Lawyer billing & invoice system |
| `/api/notifications` | GET, POST, PATCH | In-app notification system |
| `/api/connections` | GET, POST, PUT | Follow/connect between users |
| `/api/posts` | GET, POST, DELETE | Community feed |
| `/api/topics` | GET, POST | Discussion topics |
| `/api/events` | GET, POST, PUT | Calendar events & court dates |
| `/api/crm` | GET, POST, PUT | Lawyer CRM (client management) |
| `/api/nearby` | GET | AI-powered nearby courts, lawyers, police |
| `/api/ecourts` | GET | Live Indian court case status |
| `/api/uploads` | POST | File upload to Cloudinary |
| `/api/verification` | POST, GET | DigiLocker Bar Council verification |
| `/api/docusign` | POST | E-signature via DocuSign |
| `/api/whatsapp` | POST | Twilio WhatsApp webhook |
| `/api/contact` | POST | Contact form submission (email) |
| `/api/admin` | GET | Admin analytics & user management |
| `/api/confessions` | GET, POST | Anonymous legal confession booth |

---

## 5. 🔒 SECURITY INFRASTRUCTURE

| Layer | Implementation |
|-------|---------------|
| **Auth** | JWT tokens (9.0.3) with signed secrets |
| **Password Storage** | bcryptjs salted hashing |
| **HTTP Headers** | Helmet.js (CSP, HSTS, XSS protection) |
| **Rate Limiting** | Global: 300 req/15min · Auth: 10/hr · AI: 50/15min |
| **CORS** | Strict whitelist (nyaynow.in, localhost only) |
| **Input Validation** | Express JSON body limit: 10MB |
| **Proxy Trust** | `trust proxy = 1` (Render/Vercel compatible) |
| **Error Sanitization** | Sentry strips passwords & tokens before logging |
| **HTTPS** | Enforced on all services (Vercel + Render) |
| **Data Protection** | DPDP (India) compliant privacy policy |

---

## 6. 🏷️ VERSION HISTORY

| Version Tag | Description | Commit |
|-------------|-------------|--------|
| `v1.0.0-initial` | Initial Deploy — basic NyayNow platform | `95b3c4a` |
| `v1.1.0-auth` | Google Authentication, Login & Signup | `fd71597` |
| `v1.2.0-features` | Judge AI, Legal Uber, LawyerOS complete | `617d253` |
| `v1.3.0-monetization` | Razorpay payments, DPDP, regional languages, court sync | `020b87e` |
| `v1.4.0-startup-upgrades` | Security hardening, billing, UI polish | `0015dd4` |
| `v2.0.0-professionals` | Professionals page redesign, luxury interactive UI | `6846b87` |

> See all versions: [github.com/dhruvkumar2107/NyayNow/tags](https://github.com/dhruvkumar2107/NyayNow/tags)

---

## 7. 🌐 ENVIRONMENT VARIABLES

### Frontend (`client/.env`)
| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | `https://nyaysathi-main.onrender.com` | Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `<id>.apps.googleusercontent.com` | Google OAuth |

### Backend (`server/.env`)
| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing secret |
| `GEMINI_API_KEY` | Google Gemini AI key |
| `RZP_KEY_ID` / `RZP_KEY_SECRET` | Razorpay payment keys |
| `CLOUDINARY_CLOUD_NAME/KEY/SECRET` | File storage |
| `SENTRY_DSN` | Error tracking |
| `GOOGLE_CLIENT_ID` | Google OAuth verification |
| `TWILIO_ACCOUNT_SID/AUTH_TOKEN` | WhatsApp/SMS |
| `ALGOLIA_APP_ID/API_KEY` | Search service |
| `CLIENT_URL` | Allowed CORS origin |

---

*Document generated: June 2026 · NyayNow Platform v2.0.0*
