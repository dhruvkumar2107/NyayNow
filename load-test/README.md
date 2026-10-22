# NyayNow Load Test

Tests how many concurrent users the server can handle using [autocannon](https://github.com/mcollina/autocannon).

## Prerequisites

Make sure the server is running first:

```bash
cd server
node index.js
```

## Running Tests

From the `load-test/` directory:

```bash
# Install deps (one time)
npm install

# Run a specific scenario
npm run baseline   # 10 users for 15s        — warm-up / sanity check
npm run ramp       # 10→50→100→200 users     — gradual ramp-up
npm run multi      # 50 users across 5 routes — realistic traffic mix
npm run spike      # 300 users burst, 10s    — sudden traffic spike
npm run stress     # 500 users for 30s       — find the breaking point
npm run soak       # 50 users for 5 min      — memory leak / stability check
npm run full       # baseline + ramp + multi + stress (all in sequence)
```

Or with a custom server URL:

```bash
BASE_URL=https://your-backend.onrender.com node load_test.js ramp
```

## Interpreting Results

| Metric | Good | Acceptable | Problem |
|---|---|---|---|
| Requests/sec | > 500 | 100–500 | < 100 |
| p99 latency | < 300ms | 300–1000ms | > 1000ms |
| Non-2xx errors | 0 | < 1% | > 1% |
| Timeouts | 0 | < 0.5% | > 0.5% |

## Key Bottlenecks to Watch

- **Rate limiter**: Global limit is 300 req / 15 min per IP. Load tests from localhost bypass per-IP limits but will hit total server capacity.
- **MongoDB pool size**: Configured at `maxPoolSize: 10`. Under high load, DB queries may queue.
- **Socket.io**: Real-time connections are separate from HTTP load; for WebSocket load testing use `artillery` or `wscat`.
- **Memory**: Watch Node.js memory during soak test — leaks show up here.
