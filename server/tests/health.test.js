const request = require('supertest');
const { app, server } = require('../index');
const mongoose = require('mongoose');

describe('Sanity Check', () => {
    afterAll(async () => {
        await mongoose.connection.close(); // Close DB connection
        server.close(); // Close server
    });

    it('GET /healthz should return 200 OK', async () => {
        const res = await request(app).get('/healthz');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('ok', true);
    });
});
