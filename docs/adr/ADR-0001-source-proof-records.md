# ADR-0001: Source, passage, and proof receipt record scaffolding

- Status: Proposed; disabled in production by default
- Date: 17 October 2026
- Context: Current AI routes have no persistent source IDs, exact passage, law-as-on-date record, or public receipt. Prompt instructions cannot prove citation accuracy.
- Decision: Add `SourceDoc`, `Passage`, and `ProofReceipt` Mongo models; implement a deterministic verifier for source existence, passage ownership, exact quote presence, approved source status, and validity on an explicit `asOfDate`. Sign receipt payloads with HMAC-SHA256. Gate the public endpoint on `PROOF_RECEIPTS_ENABLED=true` and an external `PROOF_RECEIPT_HMAC_SECRET`.
- Limits: Exact quotation is not semantic entailment. A passing exact-quote check only verifies identity, quote inclusion, source policy status, and temporal interval. It must never be marketed as validated legal reasoning or zero hallucination. No receipts are issued by the response path, no corpus is ingested, and no signature key is committed.
- Why HMAC first: It uses Node’s standard crypto implementation without an extra dependency. Public verifiability requires key management and potentially Ed25519 signatures; reassess before any public launch.
- Consequences: Proof routes remain in development, and answer UI cannot claim “verified” until a permissioned ingestion pipeline, semantic/legal review, receipt creation, key lifecycle, and independent tests are approved.
- Required follow-up: Legal/data licence review; source text hash/normalization specification; version and amendment model; proof receipt creation/immutability/revocation; test vectors; API load test; legal editor sign-off.
