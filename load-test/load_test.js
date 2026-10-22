/**
 * NyayNow Load Test - autocannon based
 * Tests how many concurrent users the server can handle.
 *
 * Usage:
 *   node load-test/load_test.js [scenario]
 *
 * Scenarios:
 *   baseline   - 10 users, single public route (default)
 *   ramp       - gradual ramp from 10 → 50 → 100 → 200 users
 *   stress     - 500 concurrent connections for 30 seconds
 *   soak       - 50 users for 5 minutes (steady-state check)
 *   spike      - sudden burst of 300 users for 10 seconds
 *
 * Make sure the server is running first:
 *   cd server && node index.js
 */

const autocannon = require("autocannon");
const { promisify } = require("util");
const run = promisify(autocannon);

const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

// ─────────────────────────────────────────────
// Helper: pretty-print a result table to console
// ─────────────────────────────────────────────
function printResult(label, result) {
  const { requests, latency, throughput, errors, timeouts, non2xx } = result;
  const pass = (non2xx === 0 && errors === 0 && timeouts === 0);

  console.log("\n" + "═".repeat(60));
  console.log(`  📊  ${label}`);
  console.log("═".repeat(60));
  console.log(
    `  Requests/sec   : ${requests.average.toFixed(1)} avg   |  ${requests.max} peak`
  );
  console.log(
    `  Latency (ms)   : ${latency.p50} p50   |  ${latency.p99} p99   |  ${latency.max} max`
  );
  console.log(
    `  Throughput     : ${(throughput.average / 1024).toFixed(1)} KB/s avg`
  );
  console.log(
    `  Total requests : ${requests.total}`
  );
  console.log(
    `  Errors         : ${errors}   Non-2xx: ${non2xx}   Timeouts: ${timeouts}`
  );
  console.log(`  Status         : ${pass ? "✅ PASS" : "⚠️  DEGRADED"}`);
  console.log("═".repeat(60) + "\n");

  return {
    label,
    requestsPerSec: requests.average,
    p50: latency.p50,
    p99: latency.p99,
    maxLatency: latency.max,
    totalRequests: requests.total,
    errors,
    non2xx,
    timeouts,
    pass,
  };
}

// ─────────────────────────────────────────────
// Scenarios
// ─────────────────────────────────────────────

async function runBaseline() {
  console.log("\n🚀 Starting BASELINE scenario (10 users, 15 seconds)...");
  const res = await run({
    url: `${BASE_URL}/healthz`,
    connections: 10,
    duration: 15,
    title: "Baseline - Health Check",
  });
  return printResult("Baseline (10 users)", res);
}

async function runRamp() {
  const stages = [
    { connections: 10,  duration: 15, label: "Ramp: 10 users" },
    { connections: 50,  duration: 20, label: "Ramp: 50 users" },
    { connections: 100, duration: 20, label: "Ramp: 100 users" },
    { connections: 200, duration: 20, label: "Ramp: 200 users" },
  ];

  const results = [];
  for (const stage of stages) {
    console.log(`\n🔼 ${stage.label} — ${stage.duration}s ...`);
    const res = await run({
      url: `${BASE_URL}/healthz`,
      connections: stage.connections,
      duration: stage.duration,
      title: stage.label,
    });
    results.push(printResult(stage.label, res));
  }
  return results;
}

async function runStress() {
  console.log("\n💥 Starting STRESS scenario (500 users, 30 seconds)...");
  const res = await run({
    url: `${BASE_URL}/healthz`,
    connections: 500,
    duration: 30,
    title: "Stress - 500 concurrent",
  });
  return printResult("Stress (500 users)", res);
}

async function runSoak() {
  console.log("\n🌊 Starting SOAK scenario (50 users, 5 minutes)...");
  const res = await run({
    url: `${BASE_URL}/healthz`,
    connections: 50,
    duration: 300,
    title: "Soak - 50 users 5min",
  });
  return printResult("Soak (50 users, 5min)", res);
}

async function runSpike() {
  console.log("\n⚡ Starting SPIKE scenario (300 users burst, 10 seconds)...");
  const res = await run({
    url: `${BASE_URL}/healthz`,
    connections: 300,
    duration: 10,
    pipelining: 10,
    title: "Spike - 300 burst",
  });
  return printResult("Spike (300 users burst)", res);
}

// ─────────────────────────────────────────────
// Multi-route scenario — tests realistic traffic
// against public endpoints (no auth needed)
// ─────────────────────────────────────────────
async function runMultiRoute() {
  const routes = [
    { path: "/healthz", label: "Health Check" },
    { path: "/api/lawyers",        label: "GET /api/lawyers" },
    { path: "/api/posts",          label: "GET /api/posts" },
    { path: "/api/topics",         label: "GET /api/topics" },
    { path: "/api/nearby?lat=12.97&lng=77.59&radius=10", label: "GET /api/nearby" },
  ];

  const results = [];
  for (const route of routes) {
    console.log(`\n🔍 Testing ${route.label} with 50 users for 15s ...`);
    const res = await run({
      url: `${BASE_URL}${route.path}`,
      connections: 50,
      duration: 15,
      title: route.label,
    });
    results.push(printResult(route.label, res));
  }
  return results;
}

// ─────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────
async function main() {
  const scenario = (process.argv[2] || "baseline").toLowerCase();

  console.log(`\n╔${"═".repeat(58)}╗`);
  console.log(`║  NyayNow Load Test  ·  Target: ${BASE_URL.padEnd(26)}║`);
  console.log(`║  Scenario: ${scenario.padEnd(47)}║`);
  console.log(`╚${"═".repeat(58)}╝`);

  try {
    switch (scenario) {
      case "baseline":
        await runBaseline();
        break;
      case "ramp":
        await runRamp();
        break;
      case "stress":
        await runStress();
        break;
      case "soak":
        await runSoak();
        break;
      case "spike":
        await runSpike();
        break;
      case "multi":
        await runMultiRoute();
        break;
      case "full":
        console.log("\n▶ Running FULL suite (baseline → ramp → stress → multi-route)");
        await runBaseline();
        await runRamp();
        await runMultiRoute();
        await runStress();
        break;
      default:
        console.error(`Unknown scenario: "${scenario}".`);
        console.error(
          "Available: baseline | ramp | stress | soak | spike | multi | full"
        );
        process.exit(1);
    }
  } catch (err) {
    if (err.message && err.message.includes("ECONNREFUSED")) {
      console.error("\n❌ Cannot connect to server at", BASE_URL);
      console.error(
        "   Make sure the server is running:\n   cd server && node index.js\n"
      );
    } else {
      console.error("\n❌ Load test failed:", err.message);
    }
    process.exit(1);
  }

  console.log("\n✅ Load test complete.\n");
}

main();
