const request = require('supertest');
const { app, server } = require('../index');
const mongoose = require('mongoose');

describe('Backend API Layer', () => {
    afterAll(async () => {
        await mongoose.connection.close();
        server.close();
    });

    describe('Health Check', () => {
        it('GET /healthz should return 200 OK', async () => {
            const res = await request(app).get('/healthz');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('ok');
            expect(res.body).toHaveProperty('db');
        });
    });

    describe('Auth Routes (Smoke Tests)', () => {
        it('POST /api/auth/google should not be an unknown route', async () => {
            const res = await request(app).post('/api/auth/google').send({});
            expect(res.status).not.toBe(404);
        });
    });

    describe('Edge Cases', () => {
        it('should return 404 for unknown routes', async () => {
            const res = await request(app).get('/api/unknown-route-123');
            expect(res.status).toBe(404); // Express default 404
        });
    });
});
