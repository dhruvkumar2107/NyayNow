/**
 * Quick runner — executes a single autocannon test and writes result to stdout + JSON file.
 */
const autocannon = require("autocannon");

const BASE_URL = process.env.BASE_URL || "http://localhost:4000";
const scenario = process.argv[2] || "baseline";

const configs = {
  baseline: { url: `${BASE_URL}/healthz`, connections: 10, duration: 15, title: "Baseline - 10 users" },
  ramp10:   { url: `${BASE_URL}/healthz`, connections: 10,  duration: 15, title: "Ramp - 10 users" },
  ramp50:   { url: `${BASE_URL}/healthz`, connections: 50,  duration: 20, title: "Ramp - 50 users" },
  ramp100:  { url: `${BASE_URL}/healthz`, connections: 100, duration: 20, title: "Ramp - 100 users" },
  ramp200:  { url: `${BASE_URL}/healthz`, connections: 200, duration: 20, title: "Ramp - 200 users" },
  lawyers:  { url: `${BASE_URL}/api/lawyers`, connections: 50, duration: 15, title: "GET /api/lawyers" },
  posts:    { url: `${BASE_URL}/api/posts`, connections: 50, duration: 15, title: "GET /api/posts" },
  topics:   { url: `${BASE_URL}/api/topics`, connections: 50, duration: 15, title: "GET /api/topics" },
  stress:   { url: `${BASE_URL}/healthz`, connections: 500, duration: 30, title: "Stress - 500 users" },
  spike:    { url: `${BASE_URL}/healthz`, connections: 300, duration: 10, pipelining: 10, title: "Spike - 300 burst" },
};

const cfg = configs[scenario];
if (!cfg) {
  console.error("Unknown scenario:", scenario, "| Available:", Object.keys(configs).join(", "));
  process.exit(1);
}

console.log(`\nTarget : ${BASE_URL}`);
console.log(`Scenario: ${cfg.title}`);
console.log(`Connections: ${cfg.connections} | Duration: ${cfg.duration}s`);
console.log("Running...\n");

const instance = autocannon(cfg, (err, result) => {
  if (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }

  const { requests, latency, throughput, errors, timeouts, non2xx } = result;

  console.log("════════════════════════════════════════════════════");
  console.log("RESULT: " + cfg.title);
  console.log("════════════════════════════════════════════════════");
  console.log(`Requests/sec  : avg=${requests.average} | max=${requests.max} | total=${requests.total}`);
  console.log(`Latency (ms)  : p50=${latency.p50} | p99=${latency.p99} | max=${latency.max}`);
  console.log(`Throughput    : avg=${Math.round(throughput.average/1024)} KB/s`);
  console.log(`Errors        : ${errors} | Non-2xx: ${non2xx} | Timeouts: ${timeouts}`);
  const pass = non2xx === 0 && errors === 0 && timeouts === 0;
  console.log(`Status        : ${pass ? "PASS" : "DEGRADED"}`);
  console.log("════════════════════════════════════════════════════\n");
});

autocannon.track(instance, { renderLatencyTable: false, renderProgressBar: true });
