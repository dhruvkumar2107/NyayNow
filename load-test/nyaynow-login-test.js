import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

/**
 * NyayNow - PURE AUTHENTICATION LOAD TEST
 * 
 * Focus: Isolated Login Throughput (JWT Generation)
 * Uses pre-seeded users (loadtest_user_0 to loadtest_user_499)
 */

export let options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 200 },
        { duration: '1m', target: 300 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'], // Login should be fast
        http_req_failed: ['rate<0.05'],
    },
};

const BASE_URL = 'https://nyaysathi-main.onrender.com';
const loginFailures = new Counter('auth_failures');

export default function () {
    // Pick a user from the 500 pre-seeded pool based on VU and iteration
    const userId = (__VU + __ITER) % 500;
    const email = `loadtest_user_${userId}@nyaynow.test`;
    const password = 'LoadTestPass@123';

    const payload = JSON.stringify({ email, password });
    const params = { headers: { 'Content-Type': 'application/json' } };

    const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);

    const success = check(res, {
        'login successful (200)': (r) => r.status === 200,
    });

    if (!success) {
        loginFailures.add(1);
        console.error(`Auth Failed for ${email}: Status ${res.status}`);
    }

    sleep(1);
}
