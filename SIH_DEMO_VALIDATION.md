# SIH Grand Finale Prototype Validation Report

**Project:** SahayakBIS 🇮🇳  
**Prototype State:** PROTOTYPE FREEZE ACHIEVED  
**Validation Time:** September 2026  
**Local Test Environment:** `http://localhost:8082`  
**Core Motto:** *Evidence-grounded guidance for Indian Standards*  
**Operational Principle:** `NO VERIFIED EVIDENCE → NO DEFINITIVE COMPLIANCE CLAIM`

---

## 1. Demo Flows Validation (A through H)

| Flow ID | Query / Action | Key Verifications | Result |
|---|---|---|---|
| **A. FIND STANDARD** | *"What is the BIS standard for self-ballasted LED lamps?"* | • Returns IS 16102 (Part 1: Safety & Part 2: Performance)<br>• Evidence Card displays `[CRS · Compulsory Registration]` badge<br>• Tapping "Evidence Details" opens Evidence Drawer showing issuing authority (BIS), scope, and requirements<br>• "Official BIS Source" link points to official CRS directory (`https://www.crsbis.in/BIS/products.do`) | **PASS** |
| **B. BIS REQUIREMENT** | *"Is BIS certification required for LED lamps?"* | • Explains mandatory CRS registration requirements under MeitY/BIS order<br>• States testing must occur at a BIS-recognized lab before portal submission<br>• Does NOT equate standard formulation with mandatory certification without official CRS basis | **PASS** |
| **C. ROADMAP** | *"Show me the BIS compliance roadmap for LED lamps."* | • "View Certification Roadmap" button triggers interactive 5-step modal<br>• Steps 01 to 05 cover identification, CRS status, lab testing, documentation, and portal registration<br>• Indicative timelines (`10–15 days*`, `3–5 days*`) include explicit asterisks and official disclaimer | **PASS** |
| **D. GOLD / HUID** | *"How can I verify gold jewellery?"* | • Correctly cites 3 mandatory marks: 1) BIS Logo, 2) Purity/Fineness grade (e.g., 22K916), 3) 6-digit alphanumeric HUID<br>• Notes mandatory status under Hallmarking QCO in notified districts<br>• Links to BIS CARE mobile app ("Verify HUID" feature) | **PASS** |
| **E. SILVER** | *"What is IS 2112?"* | • Displays IS 2112 (Silver and Silver Alloys)<br>• Explicitly identifies silver hallmarking as **voluntary** under the BIS scheme<br>• Notes 6 recognized grades (999, 970, 925 Sterling, 900, 835, 800) and third-party assurance | **PASS** |
| **F. HINDI** | Switch to **"हि"**; Query: *"LED बल्ब के लिए कौन सा BIS मानक लागू होता है?"* | • Header, intent buttons, and suggested chips translate seamlessly to Hindi<br>• Answer generates in grammatically correct Devanagari Hindi<br>• Hindi Evidence Card and localized Next Steps render cleanly | **PASS** |
| **G. HINGLISH** | *"led bulb ka bis certification kaise kare"* | • Language classifier catches romanized Hindi phrasing<br>• Rejection banner explains that Hinglish is unsupported and asks user to use standard English or Hindi | **PASS** |
| **H. OUT OF SCOPE** | *"What is the stock price of Apple?"* | • Triggers calm, safe abstention ("I could not find sufficient verified BIS evidence...")<br>• Explains covered categories (LED bulbs, Gold, Silver) and provides link to official BIS portal | **PASS** |

---

## 2. Official External BIS Links Audit

| Portal / Document | URL | Verified Status |
|---|---|---|
| **BIS CRS Products Directory (LED)** | `https://www.crsbis.in/BIS/products.do` | **LIVE & ACTIVE** (HTTP 200) |
| **BIS Product Certification Portal** | `https://www.bis.gov.in/product-certification/online-information/` | **LIVE & ACTIVE** (HTTP 200) |
| **Gold & Silver Hallmarking FAQs** | `https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq/?lang=en` | **LIVE & ACTIVE** (HTTP 200) |
| **Consumer Protection & HUID** | `https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en` | **LIVE & ACTIVE** (HTTP 200) |
| **BIS Central Portal** | `https://www.bis.gov.in/` | **LIVE & ACTIVE** (HTTP 200) |

*Zero dead or broken links detected in the prototype.*

---

## 3. UI and Content Verification

- **No Invented Clauses / Sections:** All references cite overarching Indian Standards (`IS 16102`, `IS 1417`, `IS 2112`) and their official gazetted parts without hallucinating fake sub-clauses or page numbers.
- **No Invented Fees:** The prototype makes zero monetary or fee claims; all cost-related inquiries direct users to official BIS fee schedules.
- **No False Guarantees:** Language was audited to replace claims of "guaranteeing authenticity" with accurate regulatory terms: "provides third-party assurance of purity" (per BIS official nomenclature).
- **Indicative Timelines:** Any lab testing durations carry asterisks and an explicit disclaimer advising users to confirm turnaround times with their accredited testing laboratory.
- **TypeScript Health:** `npx tsc --noEmit` compiles cleanly with **0 errors**.

---

## 4. Fixes Made During Validation

1. **Broadened Requirement Query Matching:**
   - *Issue:* Queries phrased as `"Is BIS certification required for LED lamps?"` or containing `"mandatory"` previously defaulted to standard discovery text instead of the dedicated regulatory requirements explanation.
   - *Fix:* Expanded intent matching in `isRequirementQuery` to cover `require`, `mandatory`, and `आवश्य`.
2. **Accurate Silver Scheme Terminology:**
   - *Issue:* Avoided ambiguity regarding whether silver hallmarking is mandatory.
   - *Fix:* Added clear wording in both English and Hindi clarifying that silver hallmarking remains **voluntary** under the BIS Hallmarking Scheme, while gold hallmarking is mandatory in notified districts under QCO.
3. **Removed Over-Claiming Wording:**
   - *Issue:* Replaced any colloquial references to "guarantee" with BIS-standard "third-party assurance".

---

## 5. Recommended 3–5 Minute SIH Grand Finale Demo Script

Follow this step-by-step sequence when presenting before the SIH judging panel:

```
[0:00 - 0:30] Introduction & Value Proposition
- Show the clean header: SahayakBIS ("Standards made simple").
- Pitch: "MSMEs struggle with standard discovery; consumers struggle to verify hallmarking.
  SahayakBIS provides evidence-grounded guidance with zero hallucination."

[0:30 - 1:15] Demo Flow 1: Standard Discovery & Evidence Card
- Click the "Find Standard" intent button.
- Point out the 4-stage transparent loading states.
- Point out the Answer → Evidence → Next Step architecture.
- Highlight the Evidence Card: IS 16102 (Part 1 & 2):2012 with [CRS · Compulsory Registration] badge.
- Tap "Evidence Details" to show the Evidence Drawer with official BIS metadata.

[1:15 - 2:00] Demo Flow 2: Compliance Roadmap
- Click the follow-up suggestion: "LED bulb BIS certification roadmap".
- Tap "View Certification Roadmap".
- Walk the jury through the 5 milestones (lab testing, document prep, portal submission).
- Note the realistic indicative timelines with lab backlog disclaimers.

[2:00 - 2:45] Demo Flow 3: Consumer Protection (Gold & Silver)
- Click "How do I verify gold jewellery?".
- Point out the 3 mandatory marks (BIS logo, fineness e.g. 22K916, 6-digit HUID).
- Show the Next Step pointing to the BIS CARE app.
- Click the silver follow-up: "What are the silver hallmarking standards (IS 2112)?".
- Highlight the regulatory distinction: Gold is mandatory under QCO; Silver is voluntary.

[2:45 - 3:30] Demo Flow 4: Vernacular & Strict Safety Guardrails
- Toggle language to "हि" in the header: show pure Devanagari translation.
- Type Hinglish: "led bulb ka bis certification kaise kare" -> show polite rejection and language safety banner.
- Type out-of-scope query: "What is the stock price of Apple?" -> show Evidence Gate Safe Abstention.
- Conclude: "SahayakBIS never hallucinates. If verified evidence is absent, it abstains."
```

---

## 6. Known Limitations (Ready-to-Answer for Judges)

| Potential Judge Question | Prepared Honest Response |
|---|---|
| *"Can it answer questions about cement (IS 269) or steel?"* | *"In this SIH finale prototype, we focused on high-priority pilot domains (LEDs and Hallmarking) to guarantee 100% verified evidence. The architecture is ready to ingest additional BIS gazettes via the same schema."* |
| *"Is there a live LLM running in the background?"* | *"No, for this prototype we intentionally prioritized deterministic reliability over an unconstrained LLM. In standards compliance, an unverified LLM response is a legal hazard. Future phases will integrate local RAG with pgvector."* |
| *"Can it submit applications directly to BIS?"* | *"No. SahayakBIS is an advisory guidance tool. All official regulatory submissions must occur directly on the official BIS portal (manakonline.in), which SahayakBIS links to."* |

---

**Conclusion:** The SahayakBIS SIH Grand Finale prototype is **frozen, validated, and demo-ready**.
