# SahayakBIS — Final Prototype Improvement Plan (SIH 2026)

**Target:** SIH Grand Finale 3–5 Minute Evaluator Presentation  
**Execution Model:** Single Primary Implementation Agent (Order 1 to 14)  
**Strict Rule:** No Next.js migration, no backend, no pgvector/RAG, no invented facts.

---

## 1. Sequence of Implementation (Steps 1 to 14)

```
[1] Natural Free-Text Query Handling
    ├── Add ProductScope & UserIntent taxonomy
    ├── Implement multi-pattern matcher (industry manufacturing queries, consumer HUID queries, silver, adversarial)
    └── Preserve Hinglish rejection & Hindi detection

[2] Stronger Evidence Drawer
    ├── Split drawer into: Technical Standard Scope vs Regulatory Legal Basis
    ├── Display: Authority (BIS), Standard IS code, Year/Edition, Source URL
    └── Official BIS Source action CTA (direct link)

[3] Regulatory Basis Visibility
    ├── Clearly distinguish: Standard vs Scheme vs Mandatory Order
    ├── Explanatory labels for CRS, Hallmarking QCO, and Voluntary Scheme
    └── Source verification stamp without over-claiming

[4] Unsupported Certainty Cleanup
    ├── Remove all absolute words ('guarantee', '100% accurate', 'always', 'certified')
    └── Adopt regulatory phrasing: 'Based on available BIS evidence...', 'Provides third-party assurance of purity'

[5] Roadmap Safety
    ├── 5-step milestone roadmap preserved
    └── Turnaround days explicitly marked with lab backlog disclaimers (* Indicative only)

[6] Adversarial Safe Abstention
    ├── Handle guarantee demands ('Can you guarantee my product is compliant?')
    ├── Handle direct certification demands ('Can you certify my factory?')
    ├── Handle unknown products ('I make electric blankets, what certificate do I need?')
    └── Provide dual actions: [Refine Question] and [View Official BIS Sources]

[7] BIS Authority vs SahayakBIS Guidance Positioning
    ├── Add clear non-governmental advisory disclaimer in Profile, Evidence Drawer, and App Intro
    └── Reiterate: 'SahayakBIS provides conversational guidance; BIS remains the sole authority'

[8] Multi-Category Demonstration Structure
    ├── Replace 'LED-only' visual perception
    ├── Add pilot scope banner: 'Selected BIS categories demonstrated; extensible to all Indian Standards'
    └── Segment top quick actions into: Industry (LED) & Consumer (Gold/Silver)

[9] Gold / HUID Improvement
    ├── Consumer-tailored workflow explaining the 3 mandatory marks
    ├── Explicit clarity: SahayakBIS explains hallmark; live lookup is via official BIS CARE app
    └── Direct CTA to open BIS CARE portal / app information

[10] Silver Improvement
    ├── Clear standalone category under IS 2112
    ├── Explains 6 fineness grades and voluntary scheme status
    └── Contextual follow-up suggestions

[11] Empty / Static States
    ├── Enhance History tab with 'Demonstration Quick-Start' golden query chips
    ├── Structure Sources tab into Industry vs Consumer portals
    └── Polish Profile screen with About SahayakBIS, authority notice, and pilot scope

[12] Navigation & Visual Polish
    ├── Ensure consistent padding, typography hierarchy, and theme colors (Navy, Gold, Primary Blue)
    └── Smooth 4-stage loading transitions (950ms)

[13] Hindi (हिन्दी) Improvements
    ├── Full Devanagari Hindi support across all components, drawer, roadmap, and safe abstention
    └── Natural phrasing preserving technical standard codes (IS 16102, IS 1417, IS 2112, BIS, CRS, HUID)

[14] Contextual Follow-Ups
    ├── Tailor 2–3 follow-up question chips per intent/topic
    └── Clicking any chip dispatches the query immediately
```

---

## 2. Verification Protocol

After implementation is complete:
1. `npx tsc --noEmit` must exit with 0 errors.
2. All 11 SIH evaluation tests must pass cleanly.
3. Final documents `FINAL_PROTOTYPE_QA.md` and `FINAL_DEMO_CHECKLIST.md` will be generated.
