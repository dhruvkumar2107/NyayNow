const request = require('supertest');
const { app, server } = require('../index');
const mongoose = require('mongoose');

describe('Sanity Check', () => {
    beforeAll(async () => {
        const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nyaynow";
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
    });

    afterAll(async () => {
        await mongoose.connection.close(); // Close DB connection
        server.close(); // Close server
    });

    it('GET /healthz should return 200 OK', async () => {
        const res = await request(app).get('/healthz');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('ok');
        expect(res.body).toHaveProperty('db');
    });
});
