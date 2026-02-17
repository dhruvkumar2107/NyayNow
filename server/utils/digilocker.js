const axios = require('axios');

// We use Setu (https://setu.co) as the bridge for DigiLocker integration as it's the standard for Indian startups.
// Endpoints: Production: https://prod.setu.co/api/v1  | Sandbox: https://uat.setu.co/api/v1

const SETU_BASE_URL = process.env.NODE_ENV === 'production'
    ? "https://prod.setu.co/api/v1"
    : "https://uat.setu.co/api/v1";

const CLIENT_ID = process.env.SETU_CLIENT_ID;
const CLIENT_SECRET = process.env.SETU_CLIENT_SECRET;
const PRODUCT_INSTANCE_ID = process.env.SETU_PRODUCT_INSTANCE_ID;

/**
 * 1. Create a DigiLocker Request
 * This generates a URL that we redirect the user to.
 */
const createVerificationRequest = async (redirectUrl) => {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("Missing Setu/DigiLocker API Keys (CLIENT_ID, CLIENT_SECRET)");
    }

    try {
        const response = await axios.post(
            `${SETU_BASE_URL}/aadhaar/request`,
            {
                redirectURL: redirectUrl,
            },
            {
                headers: {
                    'x-client-id': CLIENT_ID,
                    'x-client-secret': CLIENT_SECRET,
                    'x-product-instance-id': PRODUCT_INSTANCE_ID
                }
            }
        );

        // response.data will contain the 'id' (request_id) and 'url' (to redirect user)
        return response.data;

    } catch (error) {
        console.error("Setu API Error:", error.response?.data || error.message);
        throw new Error("Failed to initiate DigiLocker request via Setu");
    }
};

/**
 * 2. Get Verification Status
 * After user comes back, we check if they actually verified.
 */
const getVerificationStatus = async (requestId) => {
    try {
        const response = await axios.get(
            `${SETU_BASE_URL}/aadhaar/request/${requestId}`,
            {
                headers: {
                    'x-client-id': CLIENT_ID,
                    'x-client-secret': CLIENT_SECRET,
                    'x-product-instance-id': PRODUCT_INSTANCE_ID
                }
            }
        );

        return response.data; // Includes aadhaar number, name, photo, etc.
    } catch (error) {
        console.error("Setu Status Error:", error.response?.data || error.message);
        throw error;
    }
};

module.exports = { createVerificationRequest, getVerificationStatus };
