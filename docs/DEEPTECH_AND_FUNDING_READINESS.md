# NyayNow: Deep-tech and funding readiness

This is an internal plan, not a claim that the milestones below are already complete. It is based on the repository inspected on 17 October 2026.

## Investment thesis to validate

NyayNow can become a trustworthy Indian legal workflow and intelligence platform by combining source-linked legal retrieval, multilingual interaction, document workflows, and advocate review. The defensible product should be a measurable legal data and evaluation system, not a thin interface around a general-purpose language model.

## What the code supports today

- A Next.js client and Express API with authentication, billing, AI workflows, and marketplace features.
- Gemini generation in the Node service; selected legal routes can use Google Search grounding.
- Optional Indian Kanoon search and document retrieval when `INDIANKANOON_API_KEY` is configured.
- A FastAPI service also exists, but the main assistant route inspected uses the Node backend.

These components are a useful product foundation. They do not by themselves establish proprietary models, a custom vector retrieval system, a verified large legal corpus, production traction, or benchmark performance. The methodology page and product-use-case page have been updated to reflect this distinction.

## Deep-tech roadmap

### 1. Build a lawful, versioned legal corpus

- Record source, licence/terms, jurisdiction, court, document identifier, publication date, effective date, and ingestion timestamp for every item.
- Start with official statutes and permitted public judgments; obtain counsel review of source rights and redistribution limits.
- Keep source text immutable and versioned. Track amendments, repeals, and commencement dates separately.
- Add an ingestion audit trail, duplicate detection, OCR quality checks, and source health monitoring.

### 2. Build source-first retrieval

- Add hybrid lexical and semantic retrieval over explicitly licensed or permitted documents.
- Preserve paragraph and page spans so each generated proposition can point to a source passage.
- Add reranking and filters for court, date, jurisdiction, statute version, procedural posture, and precedential status.
- Return “no reliable source found” when retrieval is weak. Never synthesize a case record as a fallback.

### 3. Make legal answers auditable

- Separate retrieved evidence from model-written explanation in the API response.
- Validate citations against the indexed source records; flag unsupported citations and stale statutes.
- Treat predictions as research hypotheses. Do not present outcome probabilities without a properly designed, prospective evaluation and calibration study.
- Add prompt-injection defenses for user documents and retrieved text, plus redaction and retention controls for sensitive case material.

### 4. Publish an evaluation protocol

Create a counsel-reviewed, versioned test set with clear permissions and an evaluation harness covering:

- Citation existence and source-span correctness.
- Statutory version and jurisdiction correctness.
- Retrieval recall and ranking quality.
- Unsupported-claim and abstention rates.
- Hindi and additional language quality, including code-switching and speech transcription if supported.
- Latency, cost per successful task, and human correction time.

Report sample size, dataset cutoff, reviewer process, baselines, confidence intervals, and known failure modes. Do not use a single “accuracy” percentage as a substitute for these metrics.

## Funding milestones

| Stage | Evidence to produce | Funding use |
| --- | --- | --- |
| 0–3 months | Source-rights review, corpus schema, ingestion prototype, baseline citation audit, 5–10 design-partner interviews | Legal data access, engineering, evaluation design |
| 3–6 months | Pilot retrieval with source spans, counsel-reviewed benchmark, security/privacy threat model, measured task completion and correction rates | Retrieval infrastructure, expert review, privacy engineering |
| 6–12 months | Paid pilots, repeat usage, documented time saved, retention by role, unit economics, independent evaluation | Scale corpus coverage, integrations, sales and customer success |

Targets should be set with pilot partners after a baseline. Do not publish estimated customer counts, savings, or accuracy as achieved results.

## Data room checklist

- Product demo using real, permissioned source records and visible citations.
- Architecture diagram that matches production deployment, including data processors and regions.
- Data inventory, source terms, retention schedule, deletion process, security controls, and incident process.
- Evaluation notebook/report with reproducible methodology and error examples.
- Design-partner letters or paid pilot evidence with permission to disclose.
- Revenue, usage, retention, inference/search cost, and gross margin from actual analytics.
- Hiring plan, 18-month milestone budget, and explicit capital ask tied to those milestones.

## Investor positioning

Lead with the problem, the workflow, and evidence. Explain that NyayNow is building toward source-grounded, multilingual legal intelligence for India. Distinguish current Gemini and third-party search integrations from planned proprietary retrieval, corpus operations, and evaluation. Avoid claims of zero hallucinations, court outcome accuracy, blanket DPDP compliance, sovereign hosting, or customer impact until independently evidenced.
