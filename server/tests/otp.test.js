const request = require('supertest');
const { app, server } = require('../index');
const mongoose = require('mongoose');
const OtpEntry = require('../models/OtpEntry');
const User = require('../models/User');

describe('Brevo Email OTP Authentication Flow', () => {
    const testEmail = 'testuser@example.com';
    let capturedOtp = null;
    let originalLog;

    beforeAll(async () => {
        // Connect to MongoDB since index.js skips it in test mode
        const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nyaysathi";
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        // Intercept console.log to capture mock OTP
        originalLog = console.log;
        console.log = (...args) => {
            originalLog(...args);
            const logStr = args.join(' ');
            const match = logStr.match(/OTP:\s*(\d{6})/);
            if (match) {
                capturedOtp = match[1];
            }
        };
    });

    afterAll(async () => {
        // Restore console.log
        console.log = originalLog;

        // Clean up database entries
        try {
            await OtpEntry.deleteMany({ email: testEmail });
            await User.deleteOne({ email: testEmail });
        } catch (err) {
            console.error("Cleanup error:", err);
        }

        // Close connections
        await mongoose.connection.close();
        server.close();
    });

    describe('POST /api/auth/send-otp', () => {
        it('should send OTP and return success in mock mode', async () => {
            const res = await request(app)
                .post('/api/auth/send-otp')
                .set('X-CSRF-Protection', '1')
                .send({ email: testEmail });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('OTP sent via Email');

            // Verify OtpEntry is created in database
            const entry = await OtpEntry.findOne({ email: testEmail });
            expect(entry).not.toBeNull();
            expect(entry.otp).toMatch(/^\d{6}$/);

            // Verify OTP was logged and captured
            expect(capturedOtp).not.toBeNull();
            expect(capturedOtp).toHaveLength(6);
        });

        it('should return 400 if email is missing', async () => {
            const res = await request(app)
                .post('/api/auth/send-otp')
                .set('X-CSRF-Protection', '1')
                .send({});
            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/verify-otp', () => {
        it('should fail with incorrect OTP', async () => {
            const res = await request(app)
                .post('/api/auth/verify-otp')
                .set('X-CSRF-Protection', '1')
                .send({ email: testEmail, otp: '000000' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Invalid OTP');
        });

        it('should succeed with correct OTP and create/login user', async () => {
            expect(capturedOtp).not.toBeNull();

            const res = await request(app)
                .post('/api/auth/verify-otp')
                .set('X-CSRF-Protection', '1')
                .send({ email: testEmail, otp: capturedOtp });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.headers['set-cookie']).toBeDefined();
            const hasTokenCookie = res.headers['set-cookie'].some(c => c.startsWith('token='));
            expect(hasTokenCookie).toBe(true);
            expect(res.body.user.email).toBe(testEmail);

            // Verify user was created in database
            const user = await User.findOne({ email: testEmail });
            expect(user).not.toBeNull();
            expect(user.role).toBe('client');
        });
    });
});
