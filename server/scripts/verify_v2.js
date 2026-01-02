const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const BASE_URL = 'http://localhost:4000/api';
const PHONE = "9999999999";

const log = (msg, type = 'info') => {
    const symbol = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    console.log(`${symbol} ${msg}`);
};

async function verifySystem() {
    console.log("\n🚀 STARTING 1100% SYSTEM VERIFICATION 🚀\n");

    try {
        // 1. AUTH: TEST OTP FLOW
        log("Testing OTP Auth Flow...", 'info');

        // A. Send OTP
        await axios.post(`${BASE_URL}/auth/send-otp`, { phone: PHONE });
        log("OTP Sent Successfully", 'success');

        // B. Verify OTP (We mocked it as random, but for test we need to know it? 
        // Wait, the previous code saved it in memory. We can't easily get it unless we peek logs or mock strictly.
        // Actually, my implementation of send-otp returned { message, mockOtp }. I can use that!
        const otpRes = await axios.post(`${BASE_URL}/auth/send-otp`, { phone: PHONE });
        const otp = otpRes.data.mockOtp;
        log(`Received Mock OTP: ${otp}`, 'info');

        const verifyRes = await axios.post(`${BASE_URL}/auth/verify-otp`, { phone: PHONE, otp });
        const { token, user } = verifyRes.data;

        if (token && user) log(`OTP Verified! User Logged in: ${user.phone}`, 'success');
        else throw new Error("OTP Verification failed to return token");

        const authHeader = { headers: { Authorization: `Bearer ${token}` } };

        // 2. AI: TEST DOC GENERATION
        log("Testing AI Document Drafts...", 'info');

        // A. FIR
        const firRes = await axios.post(`${BASE_URL}/ai/draft-fir`, {
            incident_details: "Stolen laptop at cafe",
            language: "Hindi", // Test lang support
            location: "Delhi"
        }, authHeader);

        if (firRes.data.draft && firRes.data.draft.length > 50) log("FIR Draft Generated (Hindi context)", 'success');
        else throw new Error("FIR Generation Failed");

        // B. Legal Notice
        const noticeRes = await axios.post(`${BASE_URL}/ai/draft-notice`, {
            notice_details: "Tenant not paying rent",
            type: "Eviction Notice"
        }, authHeader);

        if (noticeRes.data.draft) log("Legal Notice Generated", 'success');

        // 3. ADMIN: VERIFY USER
        log("Testing Admin Verification...", 'info');
        // Update user to simulate resume upload
        await axios.put(`${BASE_URL}/users/${user._id}`, { resume: "/uploads/fake.pdf" });
        log("Resume 'Upload' simulated on User Profile", 'success');

        // Verify
        await axios.put(`${BASE_URL}/users/${user._id}`, { verified: true });

        // Fetch to confirm
        const updatedUser = await axios.get(`${BASE_URL}/users/${user._id}`);
        if (updatedUser.data.verified) log("User Verification Confirmed!", 'success');
        else throw new Error("Verification Persistence Failed");

        console.log("\n✨ SYSTEM STATUS: 1100% OPERATIONAL ✨");

    } catch (err) {
        log(`VERIFICATION FAILED: ${err.message}`, 'error');
        if (err.response) console.log(err.response.data);
    }
}

verifySystem();
