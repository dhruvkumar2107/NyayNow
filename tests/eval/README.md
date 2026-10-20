# Legal evaluation harness status

No real case set or benchmark run is included. Do not populate this folder with client matters until source/data rights, de-identification, consent/legal basis, access, and retention are approved.

## Required record shape

Each reviewed example should record: stable ID; dataset/source and licence; source cutoff; jurisdiction; question/task; expected answer claims; canonical source IDs and passage spans; supported/unsupported citation labels; statute version/effective date; severity rubric; language; reviewer role and conflict checks; model/prompt/retrieval versions; adjudication; and reproducibility metadata. Keep case content out of public artifacts unless explicitly cleared.

## Evaluation gates

1. Two qualified reviewers agree on source and expected answer; resolve disagreement.
2. Separate retrieval recall, citation existence, passage support, currency, jurisdiction, unsupported claims, and abstention metrics.
3. Freeze dataset and prompts before scoring; document leakage controls.
4. Publish sample size, confidence intervals, baseline, exclusions, failures, and cost/latency.
5. Never infer courtroom outcome accuracy from retrospective anecdotes.

Status: protocol scaffold only. Dataset: [NEEDED]. Evaluator: [NEEDED]. Baseline: not run.
