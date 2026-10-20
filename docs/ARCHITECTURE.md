# ARCHITECTURE.md

## Overview
- Client: Next.js (client/)
- Server: Node.js/Express (server/)
- AI: FastAPI (ai_service/)
- DB: MongoDB (Mongoose)
- Auth: JWT httpOnly cookie
- Payments: Razorpay
- CSRF: header x-csrf-protection: 1 on mutating methods

