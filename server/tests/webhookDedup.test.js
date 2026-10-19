const { buildWebhookDedupKey } = require("../utils/webhookDedup");

describe("buildWebhookDedupKey", () => {
  it("prefers the provider payment id", () => {
    const event = {
      event: "payment.captured",
      id: "evt_123",
      payload: { payment: { entity: { id: "pay_ABC" } } },
    };
    expect(buildWebhookDedupKey(event)).toBe("payment:pay_ABC");
  });

  it("falls back to subscription id + event type", () => {
    const event = {
      event: "subscription.charged",
      payload: { subscription: { entity: { id: "sub_XYZ" } } },
    };
    expect(buildWebhookDedupKey(event)).toBe("subscription:sub_XYZ:subscription.charged");
  });

  it("falls back to the event id when no entity id is present", () => {
    expect(buildWebhookDedupKey({ event: "payment.failed", id: "evt_9" })).toBe("event:evt_9");
  });

  it("returns null when nothing stable is available", () => {
    expect(buildWebhookDedupKey({ event: "payment.failed" })).toBeNull();
    expect(buildWebhookDedupKey({})).toBeNull();
    expect(buildWebhookDedupKey(null)).toBeNull();
  });

  it("is stable across repeated deliveries of the same payment event", () => {
    const first = { event: "payment.captured", payload: { payment: { entity: { id: "pay_1" } } } };
    const retry = { event: "payment.captured", payload: { payment: { entity: { id: "pay_1" } } } };
    expect(buildWebhookDedupKey(first)).toBe(buildWebhookDedupKey(retry));
  });
});
