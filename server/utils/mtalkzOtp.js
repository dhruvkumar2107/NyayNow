const axios = require("axios");
const crypto = require("crypto");

const MTALKZ_API_KEY = process.env.MTALKZ_API_KEY;
const MTALKZ_SENDER_ID = process.env.MTALKZ_SENDER_ID || "NYYNOW";
// const MTALKZ_CONFIG_ID = process.env.MTALKZ_CONFIG_ID; // reserved for future use

const GENERATE_URL = "https://msg.mtalkz.com/V2/http-api-sms.php";
const VERIFY_URL = "https://msg.mtalkz.com/V2/http-verifysms-api.php";

const OTP_MESSAGE = "{OTP} is your NyayNow verification code. Valid for 2 minutes. Do not share.";

// In-memory store for mock mode
const mockStore = new Map();

/**
 * Normalize phone number to MSISDN format (prepend '91' if 10 digits).
 */
function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  return digits;
}

/**
 * Generate OTP via mTalkz API.
 * Falls back to mock mode if MTALKZ_API_KEY is not configured.
 *
 * @param {string} phoneNumber - Phone number (will be normalized to MSISDN)
 * @returns {Promise<{ success: boolean, sessionId?: string, error?: string }>}
 */
async function generateOTP(phoneNumber) {
  const msisdn = normalizePhone(phoneNumber);

  // --- Mock mode ---
  if (!MTALKZ_API_KEY) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const mockSessionId = `mock_${Date.now()}_${msisdn}`;
    mockStore.set(mockSessionId, otp);

    console.log(`[mTalkz MOCK] OTP for ${msisdn}: ${otp}  (sessionId: ${mockSessionId})`);

    return { success: true, sessionId: mockSessionId };
  }

  // --- Live mode ---
  try {
    const payload = {
      apikey: MTALKZ_API_KEY,
      senderid: MTALKZ_SENDER_ID,
      number: msisdn,
      message: OTP_MESSAGE,
      format: "json",
      digit: "6",
      otptimeout: "120",
    };

    const { data } = await axios.post(GENERATE_URL, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });

    console.log(`[mTalkz] generateOTP response for ${msisdn}:`, JSON.stringify(data));

    if (data && data.sessionid) {
      return { success: true, sessionId: data.sessionid };
    }

    // API returned but without sessionid – treat as failure, fall back to mock
    console.warn("[mTalkz] No sessionid in response, falling back to mock mode");
    const otp = crypto.randomInt(100000, 999999).toString();
    const mockSessionId = `mock_${Date.now()}_${msisdn}`;
    mockStore.set(mockSessionId, otp);
    console.log(`[mTalkz MOCK FALLBACK] OTP for ${msisdn}: ${otp}  (sessionId: ${mockSessionId})`);
    return { success: true, sessionId: mockSessionId };
  } catch (err) {
    console.error("[mTalkz] generateOTP error:", err.message);

    // Fallback to mock so auth flow doesn't break
    const otp = crypto.randomInt(100000, 999999).toString();
    const mockSessionId = `mock_${Date.now()}_${msisdn}`;
    mockStore.set(mockSessionId, otp);
    console.log(`[mTalkz MOCK FALLBACK] OTP for ${msisdn}: ${otp}  (sessionId: ${mockSessionId})`);
    return { success: true, sessionId: mockSessionId };
  }
}

/**
 * Verify OTP via mTalkz API.
 * For mock sessions (sessionId starts with 'mock_'), verifies locally.
 *
 * @param {string} sessionId - Session ID from generateOTP
 * @param {string} otp       - User-provided OTP
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function verifyOTP(sessionId, otp) {
  // --- Mock mode ---
  if (!sessionId || sessionId.startsWith("mock_")) {
    const expected = mockStore.get(sessionId);
    if (!expected) {
      return { success: false, error: "Mock session not found or expired" };
    }
    const match = expected === otp;
    if (match) mockStore.delete(sessionId);
    return match
      ? { success: true }
      : { success: false, error: "Invalid OTP" };
  }

  // --- Live mode ---
  if (!MTALKZ_API_KEY) {
    return { success: false, error: "mTalkz API key not configured" };
  }

  try {
    const payload = {
      apikey: MTALKZ_API_KEY,
      sessionid: sessionId,
      otp,
    };

    const { data } = await axios.post(VERIFY_URL, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });

    console.log("[mTalkz] verifyOTP response:", JSON.stringify(data));

    // mTalkz typically returns a status/message indicating success
    if (
      data &&
      (data.status === "success" ||
        data.status === "Success" ||
        data.msgtype === "success" ||
        (typeof data.message === "string" &&
          data.message.toLowerCase().includes("verified")))
    ) {
      return { success: true };
    }

    return { success: false, error: data?.message || "OTP verification failed" };
  } catch (err) {
    console.error("[mTalkz] verifyOTP error:", err.message);
    return { success: false, error: "OTP verification request failed" };
  }
}

module.exports = { generateOTP, verifyOTP, normalizePhone };
