import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * NyayNow - TEST USER PRE-SEEDING SCRIPT
 * 
 * Run this ONCE before the main load test to generate 500 steady accounts.
 * This avoids the 'E11000 duplicate key' race conditions and DB bottlenecks
 * during peak concurrent registration.
 */

export let options = {
    vus: 10,
    iterations: 500, // Total 500 users
};

const BASE_URL = 'https://nyaysathi-main.onrender.com';

export default function () {
    const id = __ITER; // Unique per iteration (0 to 499)
    const email = `loadtest_user_${id}@nyaynow.test`;
    const password = 'LoadTestPass@123';
    const phone = `9000000${id.toString().padStart(3, '0')}`; // Deterministic phone

    const payload = JSON.stringify({
        role: 'client',
        name: `Test User ${id}`,
        email: email,
        password: password,
        phone: phone
    });

    const params = {
        headers: { 'Content-Type': 'application/json' },
    };

    const res = http.post(`${BASE_URL}/api/auth/register`, payload, params);

    check(res, {
        'user created or exists': (r) => r.status === 201 || r.status === 200 || (r.status === 400 && r.json('error').includes('already exists')),
    });

    // Slow and steady to avoid hitting DB connection pool limits
    sleep(0.5);
}
