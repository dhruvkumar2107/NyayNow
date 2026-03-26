import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Counter, Trend } from 'k6/metrics';

/**
 * NyayNow - BULLETPROOF TOTAL PLATFORM LOAD TEST
 * 
 * Features:
 * 1. Pre-seeded User Login (Prevents DB race conditions)
 * 2. Robust Request Helper (Retries 5xx/429 errors)
 * 3. Feature-Specific Observability (Granular metrics)
 * 4. Fail-Fast Logic (Stops iteration if Auth fails)
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
    http_req_duration: ['p(95)<7000'],
    http_req_failed: ['rate<0.10'],
  },
};

const BASE_URL = 'https://nyaysathi-main.onrender.com';
const FRONTEND_URL = 'https://nyaynow.in';

// Custom Metrics for Observability
const authFailures = new Counter('auth_failures_total');
const aiFailures = new Counter('ai_failures_total');
const featureLatencies = {
  judge_ai: new Trend('latency_judge_ai'),
  nyay_court: new Trend('latency_nyay_court'),
  legal_sos: new Trend('latency_legal_sos'),
  vault: new Trend('latency_vault'),
};

/**
 * Robust Request Wrapper
 * Automatically retries up to 3 times on 5xx or 429 errors.
 */
function robustRequest(method, url, body, params, featureName = null) {
  let res;
  let retries = 3;
  
  while (retries > 0) {
    res = http.request(method, url, body, params);
    
    if (res.status < 500 && res.status !== 429) {
      if (featureName && featureLatencies[featureName]) {
        featureLatencies[featureName].add(res.timings.duration);
      }
      return res; // Success or client-side error (4xx)
    }
    
    retries--;
    if (retries > 0) {
      console.warn(`Retry ${3-retries} for ${url} (Status: ${res.status})`);
      sleep(1); // Backoff
    }
  }
  return res;
}

export default function () {
  // Phase 1: Login with Pre-seeded User
  let token = null;
  const userId = (__VU + __ITER) % 500;
  const email = `loadtest_user_${userId}@nyaynow.test`;
  const password = 'LoadTestPass@123';

  group('Authentication Flow', function() {
    let loginRes = robustRequest('POST', `${BASE_URL}/api/auth/login`, JSON.stringify({ email, password }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (check(loginRes, { 'login success': (r) => r.status === 200 })) {
      token = loginRes.json('token');
    } else {
      authFailures.add(1);
    }
  });

  if (!token) {
    console.error(`VU ${__VU} failed login for ${email}. Skipping iteration.`);
    return;
  }

  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  // Phase 2: Discovery
  group('Discovery Phase', function() {
    let home = http.get(`${FRONTEND_URL}/`);
    check(home, { 'homepage loaded': (r) => r.status === 200 });
  });

  sleep(1);

  // Phase 3: Premium AI Features
  group('AI Ecosystem', function() {
    
    // AI Assistant (NyayVoice)
    let resVoice = robustRequest('POST', `${BASE_URL}/api/ai/assistant`, JSON.stringify({
      question: "[VOICE CONSULTATION] What are my legal rights if my landlord cuts my water supply?",
      language: "English"
    }), authHeaders);
    if (!check(resVoice, { 'NyayVoice OK': (r) => r.status === 200 })) aiFailures.add(1);

    // Judge AI
    let resJudge = robustRequest('POST', `${BASE_URL}/api/ai/predict-outcome`, JSON.stringify({
      caseTitle: "Tenant Harassment Case",
      caseDescription: "Landlord attempting illegal eviction via utility cut.",
      caseType: "Civil"
    }), authHeaders, 'judge_ai');
    if (!check(resJudge, { 'Judge AI OK': (r) => r.status === 200 })) aiFailures.add(1);

    // Legal SOS
    let resSOS = robustRequest('POST', `${BASE_URL}/api/ai/legal-sos`, JSON.stringify({
      situation: "Landlord has locked me out of the premises right now.",
      emergencyType: "Illegal Eviction"
    }), authHeaders, 'legal_sos');
    if (!check(resSOS, { 'Legal SOS OK': (r) => r.status === 200 })) aiFailures.add(1);

    // NyayCourt (Simulation)
    let resCourt = robustRequest('POST', `${BASE_URL}/api/ai/courtroom-battle`, JSON.stringify({
      caseTitle: "The Instant Case",
      caseDescription: "Tenant vs Landlord utility dispute.",
      caseType: "Civil"
    }), authHeaders, 'nyay_court');
    if (!check(resCourt, { 'NyayCourt OK': (r) => r.status === 200 })) aiFailures.add(1);

    // Quantum Vault
    let resVault = robustRequest('POST', `${BASE_URL}/api/agreements`, JSON.stringify({
      type: "Affidavit",
      content: "I hereby swear that the information provided is true.",
      parties: ["Tenant A"]
    }), authHeaders, 'vault');
    if (!check(resVault, { 'Vault OK': (r) => r.status === 200 })) aiFailures.add(1);

  });

  sleep(Math.random() * 5 + 2);
}
