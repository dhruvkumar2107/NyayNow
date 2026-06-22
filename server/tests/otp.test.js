const request = require('supertest');
const { app, server } = require('../index');
const mongoose = require('mongoose');
const OtpEntry = require('../models/OtpEntry');
const User = require('../models/User');

describe('mTalkz OTP Authentication Flow', () => {
    const testPhone = '9876543210';
    const normalizedPhone = '919876543210';
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
            const match = logStr.match(/OTP for \d+: (\d{6})/);
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
            await OtpEntry.deleteMany({ phone: normalizedPhone });
            await User.deleteOne({ phone: normalizedPhone });
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
                .send({ phone: testPhone });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                success: true,
                message: 'OTP sent via SMS'
            });

            // Verify OtpEntry is created in database
            const entry = await OtpEntry.findOne({ phone: normalizedPhone });
            expect(entry).not.toBeNull();
            expect(entry.sessionId).toMatch(/^mock_/);

            // Verify OTP was logged and captured
            expect(capturedOtp).not.toBeNull();
            expect(capturedOtp).toHaveLength(6);
        });

        it('should return 400 if phone is missing', async () => {
            const res = await request(app)
                .post('/api/auth/send-otp')
                .send({});
            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/verify-otp', () => {
        it('should fail with incorrect OTP', async () => {
            const res = await request(app)
                .post('/api/auth/verify-otp')
                .send({ phone: testPhone, otp: '000000' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid OTP');
        });

        it('should succeed with correct OTP and create/login user', async () => {
            expect(capturedOtp).not.toBeNull();

            const res = await request(app)
                .post('/api/auth/verify-otp')
                .send({ phone: testPhone, otp: capturedOtp });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.phone).toBe(normalizedPhone);

            // Verify user was created in database
            const user = await User.findOne({ phone: normalizedPhone });
            expect(user).not.toBeNull();
            expect(user.role).toBe('client');
        });
    });
});
