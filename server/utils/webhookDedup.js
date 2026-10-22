/**
 * Deterministic dedup key for inbound provider webhooks.
 *
 * Prefer the provider payment id (stable across retries), then the subscription
 * id + event type, then the event id when present. Returns null when nothing
 * stable exists so callers can skip dedup rather than block processing.
 *
 * @param {object} event  parsed webhook body
 * @returns {string|null}
 */
function buildWebhookDedupKey(event) {
  const paymentId = event?.payload?.payment?.entity?.id;
  if (paymentId) return `payment:${paymentId}`;
  const subscriptionId = event?.payload?.subscription?.entity?.id;
  if (subscriptionId) return `subscription:${subscriptionId}:${event?.event}`;
  if (event?.id) return `event:${event.id}`;
  return null;
}

module.exports = { buildWebhookDedupKey };
