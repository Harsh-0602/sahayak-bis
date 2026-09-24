# SahayakBIS --- Implementation Phases

## Phase 0 --- Current Prototype Audit

Inspect the repository and reproduce the existing prototype before
changing it.

Deliver `CURRENT_STATE.md` with: - working features - broken features -
missing features - technical debt - run/deploy commands - screenshots

## Phase 1 --- Product Foundation

Build/refine: - SahayakBIS entry screen - natural-language query box -
example queries - Find My Standard - Check BIS Requirement - Compliance
Roadmap - Verify / Understand - responsive states

Acceptance: a new user understands the product immediately.

## Phase 2 --- Evidence/Data Layer

-   Identify authoritative BIS sources
-   ingest HTML/PDF
-   clean and structure text
-   chunk
-   enrich metadata
-   embed
-   store in Supabase pgvector
-   retain source/version information

Acceptance: every evidence chunk is traceable to its source.

## Phase 3 --- Hybrid Retrieval

Implement: - normalization - language detection - entity extraction -
keyword retrieval - semantic retrieval - candidate merge - reranking

Test exact IS numbers, product descriptions, Hindi, ambiguous and
synonym-heavy queries.

## Phase 4 --- Evidence Gate + Grounded Answers

Implement: - evidence sufficiency - authority ranking - conflict
detection - freshness/effective-status checks - grounded prompt -
mandatory citation - safe abstention

Acceptance: insufficient evidence cannot produce a definitive compliance
claim.

## Phase 5 --- Conversational UX

Add: - answer cards - evidence/source cards - IS-number badges -
expandable evidence - follow-up questions - language switch - next
action - official BIS links

Target flow: **question → answer → evidence → action**

## Phase 6 --- Compliance Roadmap

Generate:
`product → standard/scheme → testing → regulatory/certification status → next steps → official service`

Every step must be evidence-backed.

## Phase 7 --- Multilingual

Support Hindi + English first. Preserve technical identifiers. Test
mixed Hinglish.

## Phase 8 --- BIS Service Navigation

Contextual links for: - Know Your Standard - certification information -
laboratory/testing information - BIS Care - HUID/hallmarking
verification - other verified BIS services

Do not simulate official transactions.

## Phase 9 --- Evaluation

Create 50--100 test queries.

Measure: - retrieval accuracy - citation correctness - grounded-answer
rate - abstention accuracy - latency - roadmap completeness

Do not invent results.

## Phase 10 --- Security/Production

Verify: - server-side secrets - input validation - rate limiting - safe
URL handling - structured logs - no sensitive logs - indexes - health
endpoint - environment validation - production CORS

## Phase 11 --- Deployment

Frontend: Vercel. Backend: Render.

Verify production frontend uses production backend and no localhost
dependency remains.

## Phase 12 --- SIH Demo Hardening

Golden flow: 1. Open SahayakBIS 2. Ask product/LED-lamp question 3. Show
understanding 4. Show evidence 5. Open citation 6. Generate roadmap 7.
Switch to Hindi 8. Ask unsupported/adversarial question 9. Show safe
abstention 10. Open official BIS service

Prepare live, recorded and backup paths.

## Phase 13 --- Final Polish

Only after correctness is stable: - typography - spacing - source
cards - icons - animations - mobile responsiveness

Do not introduce risky architecture changes during final polish.
