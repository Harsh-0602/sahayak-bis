# SahayakBIS — Phase 1 Regression & BIS Content Audit Report

**Date:** September 2026  
**Status:** ALL 17 TESTS PASSED · 0 BREAKING REGRESSIONS  
**Target Environment:** Expo Web (`http://localhost:8082`), Mobile Viewport (503×718) & Desktop Viewport

---

## 1. Passed Tests

| Test ID | Test Item | Verified Behavior | Status |
|---|---|---|---|
| **T01** | App Load & Branding | Header displays "SahayakBIS", shield icon, "Standards made simple", EN/HI toggle pill, and "Official BIS" link. | **PASS** |
| **T02** | English/Hindi Toggle | Switching toggle to "हि" updates greeting, intent button labels, suggested prompt chips, and composer placeholder to Hindi (Devanagari). Switching back to "EN" restores English. | **PASS** |
| **T03** | 4 Intent Buttons | Four intent buttons ("Find Standard", "BIS Requirement", "Roadmap", "Verify / Understand" / Hindi equivalents) render with correct icons and dispatch corresponding queries. | **PASS** |
| **T04** | Suggested Prompt Chips | Horizontal scroll chips render with sparkle icons; clicking sends pre-formulated queries accurately. | **PASS** |
| **T05** | 4-Stage Loading State | During query processing (950ms), status sequentially cycles through: 1) "Understanding your query…", 2) "Finding relevant BIS evidence…", 3) "Checking source status…", 4) "Preparing grounded answer…" with pulsing animation. | **PASS** |
| **T06** | Answer → Evidence → Next Step Layout | Assistant messages render in structured card format: `ANSWER` block, `EVIDENCE` badge card (with IS number, title, and external link), and `NEXT STEP` guidance. | **PASS** |
| **T07** | LED Bulb Standard (IS 16102) | Query returns IS 16102 (Part 1: Safety, Part 2: Performance) under Compulsory Registration Scheme (CRS), links to official BIS LED Series PDF, and renders "View Certification Roadmap" CTA. | **PASS** |
| **T08** | LED Certification Roadmap Modal | Clicking roadmap button opens bottom sheet modal displaying 5 numbered stages (01 to 05), timeline badges (10–15 working days, 3–5 working days), evidence notes, and disclaimer. Modal closes cleanly. | **PASS** |
| **T09** | Gold Hallmarking (IS 1417) | Query correctly states 3 mandatory marks (BIS Logo, fineness grades e.g. 22K916/18K750, and 6-digit alphanumeric HUID), references IS 1417, links to Hallmarking FAQ URL, and points to BIS CARE app. | **PASS** |
| **T10** | Silver Hallmarking (IS 2112) | Query correctly identifies IS 2112, fineness grades (999, 970, 925 Sterling Silver, 900, 835, 800), 3 marks with HUID, and BIS CARE verification. | **PASS** |
| **T11** | Out-of-Scope Safe Abstention | General non-standards queries ("What is the weather today?", etc.) trigger safe abstention: "Verified BIS evidence not found for that question", clear notice of supported scope, and link to official BIS portal. | **PASS** |
| **T12** | Hinglish Rejection | Colloquial romanized queries ("led bulb ka bis certification kaise kare") are caught by language classifier and rejected with explanatory notice to use standard English or Devanagari Hindi. | **PASS** |
| **T13** | Hindi Response Generation | Pure Devanagari queries return complete responses in grammatically sound Hindi with corresponding Hindi evidence titles and next-step actions. | **PASS** |
| **T14** | Trust Centre / Sources Tab (`/saved`) | Displays 4 official verified BIS sources (LED Series IS 16102, Gold & Silver FAQs, Consumer Protection HUID, BIS Product Certification Portal) with Evidence Gate policy disclaimer. All external links open official `.bis.gov.in` URLs. | **PASS** |
| **T15** | History Tab (`/history`) | Displays past inquiry sessions, timestamped logs, and clear/manage options without runtime errors. | **PASS** |
| **T16** | Profile Tab (`/profile`) | Displays user role selection (Manufacturer, Consumer, Jeweller, Lab), preferences, and language settings cleanly. | **PASS** |
| **T17** | Responsive Web UI | Fluid layout adjusts smoothly between mobile phone viewport (375–503px) and wide desktop displays without horizontal overflow or clipping. | **PASS** |

---

## 2. Failed Tests
* **None.** (0 test failures across 17 test vectors).

---

## 3. UI Issues Identified

1. **Active Tab Highlight Clarity:** On the bottom navigation bar, while the active tab is highlighted in primary blue (`#0070C0`), the contrast on certain displays between inactive grey (`#888888`) and active icon could be increased for enhanced WCAG 2.1 AAA compliance.
2. **Evidence Card Tap Target:** In the assistant message card, tapping the evidence card opens the official link, but the card could benefit from an explicit hover state and subtle border highlight on desktop web to make interactivity immediately obvious.
3. **Chat Scroll-To-Bottom:** On rapid successive message sending, scroll animation executes at 100ms; adding an additional slight delayed trigger ensures newly rendered multi-line evidence cards are fully visible without manual scrolling.

---

## 4. Functional Issues Identified

1. **Language Switch with Active Chat History:** When switching between English and Hindi during an active chat with more than 2 messages, existing assistant messages retain the language they were generated in (by design, to avoid re-rendering chat history), while the UI chrome updates. Future messages follow the new language or query language. This is functional, but a small helper chip suggesting "Start fresh conversation in Hindi" could improve user clarity.
2. **Offline / Fallback Resilience:** When Supabase is not configured, the app seamlessly falls back to `localSources` and built-in rules, which is robust; error handling for network dropouts during external link opening is handled natively by the browser.

---

## 5. BIS-Content Issues & Factual Audit

Every hardcoded BIS factual claim in the prototype was audited against the referenced official BIS portals:

### 1. LED Standard: IS 16102 (Part 1 & Part 2)
- **Claim:** Self-ballasted LED lamps for general lighting require BIS registration under the Compulsory Registration Scheme (CRS). Safety standard: IS 16102 (Part 1):2012; Performance standard: IS 16102 (Part 2):2012.
- **Audit Result:** **ACCURATE & VERIFIED.**
- **BIS Reference:** Ministry of Electronics & IT (MeitY) / BIS CRS Order. Self-ballasted LED lamps are covered under CRO Phase II (Order date 2014) with standards IS 16102 (Part 1) and IS 16102 (Part 2).
- **Nuance/Enhancement:** Clarify that CRS grants a **Registration** (R-number) with the standard CRS mark ("Self Declaration – Conforming to IS 16102 (Part 1)..."), distinct from the ISI Mark scheme (Scheme I). The prototype currently makes this distinction correctly in the roadmap ("Compulsory Registration Scheme").

### 2. Gold Hallmarking: IS 1417 & HUID
- **Claim:** Genuine hallmarked gold carries three mandatory marks: 1) BIS Logo, 2) Purity/Fineness grade (24K999, 22K916, 18K750, 14K585, etc.), 3) 6-digit alphanumeric HUID code. Verification via BIS CARE app.
- **Audit Result:** **ACCURATE & VERIFIED.**
- **BIS Reference:** BIS Hallmarking FAQ & Hallmarking Regulations (effective July 2021 / mandatory 6-digit HUID from April 1, 2023). Older 4-mark system (which had jeweller's stamp and AHC mark separately) was officially replaced with the 3-mark HUID system. The prototype reflects the up-to-date post-2023 regulatory framework.
- **Regulatory Status:** Mandatory in notified districts under the Quality Control Order (QCO).

### 3. Silver Hallmarking: IS 2112
- **Claim:** Governed by IS 2112 (Silver and Silver Alloys, Jewellery/Artefacts). Fineness grades: 999, 970, 925, 900, 835, 800. Carries BIS logo, purity grade, and 6-digit HUID.
- **Audit Result:** **ACCURATE & VERIFIED.**
- **BIS Reference:** BIS Hallmarking Overview & IS 2112.
- **Nuance/Enhancement:** While Gold Hallmarking is mandatory in designated districts under QCO, Silver Hallmarking remains **voluntary** under the BIS Hallmarking Scheme, though any article hallmarked as silver must strictly comply with IS 2112 and carry the 3 marks including HUID. Adding this "Voluntary vs Mandatory" tag in the answer clarifies an important manufacturer/jeweller query.

### 4. Roadmap Timelines & Durations
- **Claim:** Testing duration: "10–15 working days*", Documentation: "3–5 working days*".
- **Audit Result:** **COMPLIANT WITH CERTIFICATION-SAFETY RULES.**
- **Details:** The prototype explicitly marks these durations with asterisks, includes disclaimer that durations are indicative and subject to laboratory queue and scope of testing, and directs users to official BIS portals for binding deadlines.

---

## 6. Recommended Fixes & Next Layer Improvements

1. **Clarify Scheme Distinction in UI Badge:** Add a dedicated badge indicating scheme type:
   - `CRS (Compulsory Registration Scheme)` for IS 16102
   - `Mandatory Hallmarking (QCO)` for IS 1417 (Gold)
   - `Voluntary Hallmarking` for IS 2112 (Silver)
2. **Dedicated IS-Number Evidence Card / Drawer:**
   - Enhance the Evidence card with an "Evidence Details" expandable drawer showing standard year, issuing committee (e.g., Electrotechnical / Metallurgical), scope summary, and official BIS catalog link.
3. **Follow-Up Suggestions ("Next Queries"):**
   - After an answer is rendered, suggest 2–3 contextual one-tap follow-up chips (e.g., after LED standard: "What documents are needed for CRS?", "Find recognized labs for IS 16102").
4. **Source Metadata Enrichment:**
   - Attach metadata tags (Standard Number, Issuing Authority: Bureau of Indian Standards, Verification Portal: BIS CARE / Manakonline) directly into the evidence card view.

---

## Conclusion
Phase 1 implementation has preserved all existing working functionality, adhered strictly to the Evidence Gate and certification safety rules, and validated all hardcoded BIS claims against authoritative BIS documents. The prototype is stable and ready for the next UI layer enhancements.
