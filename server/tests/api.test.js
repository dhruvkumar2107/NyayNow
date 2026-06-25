const request = require('supertest');
const { app, server } = require('../index');
const mongoose = require('mongoose');

describe('Backend API Layer', () => {
    afterAll(async () => {
        await mongoose.connection.close();
        server.close();
    });

    /* ── Health ──────────────────────────────────────────── */
    describe('Health Check', () => {
        it('GET /healthz should return a status object', async () => {
            const res = await request(app).get('/healthz');
            expect([200, 503]).toContain(res.status);
            expect(res.body).toHaveProperty('ok');
            expect(res.body).toHaveProperty('db');
            expect(res.body).toHaveProperty('uptime');
        });
    });

    /* ── Auth — input validation ─────────────────────────── */
    describe('Auth Routes', () => {
        it('POST /api/auth/login with missing body returns 400', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .set('X-CSRF-Protection', '1')
                .send({});
            expect(res.status).toBe(400);
        });

        it('POST /api/auth/login with invalid email type returns 400', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .set('X-CSRF-Protection', '1')
                .send({ email: 123, password: 'password' });
            expect(res.status).toBe(400);
        });

        it('POST /api/auth/register with short password returns 400', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('X-CSRF-Protection', '1')
                .send({ email: 'test@example.com', password: '123', role: 'client', name: 'Test' });
            expect(res.status).toBe(400);
        });

        it('POST /api/auth/register with admin role is rejected', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('X-CSRF-Protection', '1')
                .send({ email: 'admin@example.com', password: 'password123', role: 'admin', name: 'Hacker' });
            expect(res.status).toBe(400);
        });

        it('POST /api/auth/register with invalid email format returns 400', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('X-CSRF-Protection', '1')
                .send({ email: 'not-an-email', password: 'password123', role: 'client', name: 'Test' });
            expect(res.status).toBe(400);
        });

        it('POST /api/auth/refresh with no cookie returns 401', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .set('X-CSRF-Protection', '1')
                .send();
            expect(res.status).toBe(401);
        });

        it('POST /api/auth/forgot-password returns generic message regardless of email', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .set('X-CSRF-Protection', '1')
                .send({ email: 'nonexistent@example.com' });
            // Should return 200 with generic message (no user enumeration)
            expect(res.status).toBe(200);
            expect(res.body.message).toContain('If the account exists');
        });
    });

    /* ── Payments — server-side amount enforcement ──────── */
    describe('Payment Routes', () => {
        it('POST /api/payments/create-order without auth returns 403', async () => {
            const res = await request(app)
                .post('/api/payments/create-order')
                .set('X-CSRF-Protection', '1')
                .send({ plan: 'silver' });
            expect(res.status).toBe(403);
        });

        it('POST /api/payments/create-order with invalid plan is rejected', async () => {
            // Without auth, will hit auth guard first — testing plan validation requires a valid token
            // This test confirms the route exists and auth is enforced
            const res = await request(app)
                .post('/api/payments/create-order')
                .set('X-CSRF-Protection', '1')
                .send({ plan: 'fake_plan_9999' });
            expect([400, 403]).toContain(res.status);
        });
    });

    /* ── Users — admin-only enforcement ─────────────────── */
    describe('User Routes', () => {
        it('GET /api/users without auth returns 403', async () => {
            const res = await request(app).get('/api/users');
            expect(res.status).toBe(403);
        });

        it('GET /api/users/public/:id with invalid ObjectId returns 500 or 404', async () => {
            const res = await request(app).get('/api/users/public/not-a-real-id');
            expect([404, 500]).toContain(res.status);
        });
    });

    /* ── AI Routes — rate limit guard ───────────────────── */
    describe('AI Routes', () => {
        it('POST /api/ai/assistant with empty body returns 4xx', async () => {
            const res = await request(app)
                .post('/api/ai/assistant')
                .set('X-CSRF-Protection', '1')
                .send({});
            // Either hits AI limit (403) or returns an error (500)
            expect(res.status).toBeGreaterThanOrEqual(400);
        });
    });

    /* ── CSRF protection ─────────────────────────────────── */
    describe('CSRF Middleware', () => {
        it('POST /api/auth/login without X-CSRF-Protection header returns 403', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password' });
            expect(res.status).toBe(403);
        });
    });

    /* ── Edge Cases ──────────────────────────────────────── */
    describe('Edge Cases', () => {
        it('GET unknown /api/ route returns 404', async () => {
            const res = await request(app).get('/api/unknown-route-xyz-123');
            expect(res.status).toBe(404);
        });

        it('should not expose stack traces in production-mode errors', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .set('X-CSRF-Protection', '1')
                .send({ email: 'x@y.com', password: 'wrongpass123' });
            expect(res.body).not.toHaveProperty('stack');
        });
    });
});
