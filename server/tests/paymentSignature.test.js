const crypto = require("crypto");
const express = require("express");
const request = require("supertest");

// Isolate the secret so signatures are deterministic regardless of ambient env.
const TEST_SECRET = "test_rzp_key_secret";
process.env.RZP_KEY_SECRET = TEST_SECRET;

const { verifySignature } = require("../services/paymentService");

function sign(orderId, paymentId) {
  return crypto
    .createHmac("sha256", TEST_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

describe("paymentService.verifySignature", () => {
  it("accepts a correctly computed signature", () => {
    const sig = sign("order_123", "pay_456");
    expect(verifySignature("order_123", "pay_456", sig)).toBe(true);
  });

  it("rejects a signature computed for a different payment", () => {
    const sig = sign("order_123", "pay_456");
    expect(verifySignature("order_123", "pay_999", sig)).toBe(false);
  });

  it("rejects a tampered / random signature", () => {
    expect(verifySignature("order_123", "pay_456", "deadbeef")).toBe(false);
  });

  it("rejects a non-string signature without throwing", () => {
    expect(verifySignature("order_123", "pay_456", undefined)).toBe(false);
    expect(verifySignature("order_123", "pay_456", 12345)).toBe(false);
  });

  it("rejects when the signing secret is missing", () => {
    const saved = process.env.RZP_KEY_SECRET;
    delete process.env.RZP_KEY_SECRET;
    try {
      expect(verifySignature("order_123", "pay_456", sign("order_123", "pay_456"))).toBe(false);
    } finally {
      process.env.RZP_KEY_SECRET = saved;
    }
  });
});

describe("Razorpay webhook raw-body handling", () => {
  // Mirror the production middleware: express.json with a verify hook that
  // captures the exact bytes, then a webhook-style HMAC verification.
  function buildApp() {
    const app = express();
    app.use(express.json({
      limit: "10mb",
      verify: (req, res, buf) => {
        if (buf && buf.length) req.rawBody = buf;
      },
    }));
    app.post("/webhook", (req, res) => {
      const rawBody = req.rawBody || (Buffer.isBuffer(req.body) ? req.body : null);
      if (!rawBody) return res.status(400).json({ error: "Unverifiable webhook payload" });

      const expected = crypto
        .createHmac("sha256", TEST_SECRET)
        .update(rawBody)
        .digest("hex");
      const provided = String(req.headers["x-razorpay-signature"] || "");
      const ok =
        Buffer.byteLength(expected) === Buffer.byteLength(provided) &&
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));

      if (!ok) return res.status(400).json({ error: "Invalid webhook signature" });
      return res.status(200).json({ received: true });
    });
    return app;
  }

  it("captures the raw body and verifies a valid signature", async () => {
    const app = buildApp();
    const payload = { event: "payment.captured", payload: { payment: { entity: { notes: {} } } } };
    const raw = JSON.stringify(payload);
    const sig = crypto.createHmac("sha256", TEST_SECRET).update(raw).digest("hex");

    const res = await request(app)
      .post("/webhook")
      .set("Content-Type", "application/json")
      .set("x-razorpay-signature", sig)
      .send(raw);

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });

  it("rejects an invalid signature", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/webhook")
      .set("Content-Type", "application/json")
      .set("x-razorpay-signature", "not-the-right-signature")
      .send(JSON.stringify({ event: "payment.captured" }));

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid webhook signature");
  });
});
