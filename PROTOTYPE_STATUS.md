# SahayakBIS — SIH Prototype Status Report

**Project:** SahayakBIS 🇮🇳 (Smart India Hackathon Prototype)  
**Core Motto:** *Evidence-grounded guidance for Indian Standards · Zero Hallucination*  
**Rule:** `NO VERIFIED EVIDENCE → NO DEFINITIVE COMPLIANCE CLAIM`  
**Demo Duration:** 3–5 Minute Evaluator Walkthrough  
**Frontend Stack:** React Native / Expo Web (No migration needed)

---

## 1. What Works (Current Working Prototype)

| Feature | Working State | Technical Implementation |
|---|---|---|
| **Answer → Evidence → Next Step** | ✅ Working | Tripartite card structure strictly separates grounded claims, official BIS references, and concrete actionable next steps. |
| **IS-Number Evidence Card** | ✅ Working | Highlights exact Indian Standard (`IS 16102 (Part 1 & 2):2012`, `IS 1417:2016`, `IS 2112:2014`) with regulatory scheme badges: `[CRS]`, `[Mandatory QCO]`, `[Voluntary]`. |
| **Evidence Details Drawer** | ✅ Working | Tap "Evidence Details" to open a slide-up drawer detailing scope, authority (BIS), standard year, key mandatory requirements checklist, and official source links. |
| **Follow-Up Suggestions** | ✅ Working | 2–3 contextual suggestion chips render below answers. Clicking any chip immediately triggers the follow-up inquiry. |
| **Bilingual Support (EN / हिन्दी)** | ✅ Working | Header toggle instantly switches between standard English and pure Devanagari Hindi for all UI components, greetings, chips, and answers. |
| **Hinglish Rejection** | ✅ Working | Colloquial romanized queries (e.g. `led bulb ka bis kaise kare`) are politely rejected with explicit instructions to use standard English or Hindi. |
| **Safe Abstention** | ✅ Working | Out-of-scope or unverified queries (e.g. general knowledge, unsupported products) trigger safe abstention with direct links to the official BIS portal. |
| **LED Certification Roadmap** | ✅ Working | 5-stage interactive modal detailing CRS registration steps (from testing at BIS-recognized labs to portal registration) with disclaimer. |
| **Official Sources / Trust Centre** | ✅ Working | `/saved` tab lists 4 verified BIS portals with direct outbound links to `.bis.gov.in`. |
| **Responsive Web Layout** | ✅ Working | Clean mobile-first design centered for desktop with smooth 4-stage loading transitions (`950ms`). |

---

## 2. What Was Improved

1. **Enhanced Evidence Card:**
   - Displays standard title, issuing authority (`Bureau of Indian Standards · Verified Grounding`), and regulatory scheme distinction (`CRS`, `QCO`, or `Voluntary`).
   - Added direct "Evidence Details" drawer trigger and "Official BIS Source" outbound link.
   - **Strict Grounding:** Never invents nonexistent clause or page numbers; references official gazettes and standards directories only.
2. **Interactive Evidence Drawer Modal:**
   - Allows evaluators to inspect the factual evidence behind any compliance claim without leaving the demo.
   - Shows key compliance checklists and official BIS portal CTAs.
3. **Contextual Follow-up Chips:**
   - Suggested prompts appear after both the greeting and every answered question.
4. **Intent-Specific Answer Tuning:**
   - Differentiates between standard discovery, certification requirement queries, and roadmap requests for LED lamps while preserving exact technical accuracy.

---

## 3. Golden Demo Queries (3–5 Minute Evaluator Flow)

Use these 7 curated queries to demonstrate all core capabilities before the SIH jury:

| # | Demo Query | Evaluator Focus Area | Expected Outcome |
|---|---|---|---|
| **1** | *"Which BIS standard applies to LED bulbs?"* | **Standard Discovery** | Returns IS 16102 (Part 1 for safety, Part 2 for performance) under CRS scheme with Evidence Card. |
| **2** | *"What is the BIS certification requirement for LED lamps?"* | **Regulatory Requirements** | Explains mandatory CRS registration, BIS-recognized lab testing, and R-number assignment. |
| **3** | *"LED bulb BIS certification roadmap"* | **Interactive Workflow** | Opens 5-stage certification roadmap modal with indicative working day ranges. |
| **4** | *"How do I verify gold hallmarking & HUID?"* | **Consumer Protection** | Explains the 3 mandatory marks (BIS logo, fineness e.g. 22K916, 6-digit HUID) and BIS CARE app. |
| **5** | *"What are the silver hallmarking standards (IS 2112)?"* | **Purity & Scheme Nuance** | Explains IS 2112, fineness grades (999 to 800), and clarifies that silver hallmarking is voluntary. |
| **6** | *"सोने की हॉलमार्किंग और HUID कैसे जाँचें?"* | **Vernacular / Hindi** | Demonstrates pure Devanagari Hindi processing, Hindi Evidence Card, and localized next steps. |
| **7** | *"What is the stock price of Apple?"* | **Adversarial / Safe Abstention** | Triggers calm safe abstention: refuses to answer non-standards queries; points to BIS scope. |
| *(Bonus)* | *"led bulb ka bis certification kaise kare"* | **Language Safety** | Catches Hinglish and requests query in standard English or Hindi. |

---

## 4. Known Limitations

1. **Hardcoded Scope Breadth:** Currently focused on high-priority pilot domains (LED Lamps under IS 16102, Gold Hallmarking under IS 1417, Silver Hallmarking under IS 2112).
2. **Static Knowledge Base:** In the prototype mode without the backend vector database, queries outside the curated demonstration set trigger safe abstention (by design, adhering to Evidence Gate rules).
3. **Indicative Timelines:** Lab testing durations are labeled with an asterisk (`* Indicative only`) because official timelines vary by test backlog.

---

## 5. What Is Intentionally NOT Implemented (Prototype Scope)

To maintain stability, responsiveness, and zero hallucination for the SIH Grand Finale, the following heavy production infrastructure was deliberately omitted:

- ❌ **FastAPI backend / Microservices:** Kept frontend-native for instant response times and offline/low-connectivity reliability.
- ❌ **pgvector / Semantic Embedding Pipeline:** Replaced with precise, deterministic keyword/topic classification to prevent LLM hallucinations during judging.
- ❌ **Full BIS Ingestion Scraper:** BIS publishes thousands of PDF standards; scraping raw PDFs without manual verification risks feeding contradictory amendments.
- ❌ **User Authentication / Accounts:** Evaluators should not need to log in or create credentials to test the prototype.
- ❌ **Complex Cloud Persistence:** Demo sessions run cleanly in-memory with local state.

---

## 6. SIH Pitch Summary

> *"SahayakBIS is not a generic chatbot. It is a strictly grounded, bilingual standards companion designed to solve the MSME compliance barrier and empower consumer trust. If verified evidence does not exist in an official BIS document, SahayakBIS explicitly refuses to guess. Standards made simple, compliance made certain."*
