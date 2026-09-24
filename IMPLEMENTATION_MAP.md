# SahayakBIS — Implementation Map

**Date:** September 2026  
**Auditor:** Agent D (Code Structure & Dependency Mapping)  
**Target Files:**
- `app/(tabs)/index.tsx` (Main conversational interface, query engine, Evidence Drawer, Roadmap)
- `app/(tabs)/saved.tsx` (Sources / Trust Centre tab)
- `app/(tabs)/history.tsx` (Recent queries and quick demo launcher)
- `app/(tabs)/profile.tsx` (About SahayakBIS, authority disclaimer, pilot scope)

---

## 1. File Modification Plan

### 1.1 `app/(tabs)/index.tsx`
- **Taxonomy & Parsing:**
  - Define `type ProductScope = 'LED' | 'GOLD' | 'SILVER' | 'UNKNOWN' | 'NONE'`
  - Define `type UserIntent = 'DISCOVER_STANDARD' | 'REQUIREMENT' | 'ROADMAP' | 'VERIFY_HUID' | 'ADVERSARIAL_GUARANTEE' | 'ADVERSARIAL_CERTIFY' | 'UNKNOWN_PRODUCT' | 'OUT_OF_SCOPE'`
  - Implement `classifyQuery(text: string): { product: ProductScope; intent: UserIntent; lang: 'English' | 'Hindi' | 'Hinglish' }`
- **Multi-Category Header & Scope Statement:**
  - Add subtitle / pilot scope banner: *"Selected BIS categories are demonstrated in this prototype. The same evidence-grounded workflow can be extended to additional categories."*
  - Dual audience quick-action bar:
    - **Industry:** Find Standard (LED), BIS Requirement, Compliance Roadmap
    - **Consumer:** Verify Hallmark & HUID (Gold), Fineness Grades, Silver Standards (IS 2112)
- **Evidence Card & Evidence Drawer:**
  - Distinct badges for `[CRS · Compulsory Registration]`, `[Mandatory · QCO]`, and `[Voluntary Scheme]`.
  - Evidence Drawer modal with two distinct panels:
    - **Panel 1: Standard Technical Specification** (IS title, parts, issuing committee, testing scope).
    - **Panel 2: Regulatory & Legal Basis** (MeitY CRS order / Hallmarking QCO / Voluntary status) with official source link.
- **Consumer Gold / HUID Flow:**
  - Distinct card emphasizing that SahayakBIS assists with hallmark understanding, while live HUID lookup is performed on the official **BIS CARE app** (with direct CTA).
- **Adversarial & Safe Abstention Handler:**
  - Specialized responses for guarantee demands (*"SahayakBIS cannot certify or guarantee legal compliance..."*) and unknown products (*"Product not found in current verified prototype evidence..."*) with `[Refine Question]` and `[View Official BIS Sources]`.
- **Roadmap Modal:**
  - Clear 5-step compliance milestones without fabricated fees; all turnaround timelines marked with `* Indicative only — confirm with testing lab`.

### 1.2 `app/(tabs)/saved.tsx` (Sources Tab)
- Reorganize sources into two logical sections:
  1. **Industry Compliance & Registration Portals:**
     - *BIS Product Certification Online Information* (`https://www.bis.gov.in/product-certification/online-information/`)
     - *Indian Standards on LED Series (IS 16102 Directory)* (`https://bis.gov.in/other/LEDSeries.pdf`)
  2. **Consumer Protection & Verification Services:**
     - *Gold & Silver Hallmarking FAQs (IS 1417 & IS 2112)* (`https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq/?lang=en`)
     - *Consumer Protection & HUID Verification (BIS CARE)* (`https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en`)
- Add Trust Layer Notice: *"Every claim in SahayakBIS is tied directly to the published official sources above."*

### 1.3 `app/(tabs)/history.tsx` (History Tab)
- Transform from static empty view to an interactive demonstration launcher:
  - Header: *"Recent Inquiries & Demonstration Quick-Start"*
  - Quick-start chips for the 7 golden demo queries:
    - *"Which BIS standard applies to LED bulbs?"*
    - *"Is BIS certification required for LED lamps?"*
    - *"LED bulb BIS compliance roadmap"*
    - *"How can I verify gold jewellery & HUID?"*
    - *"What is IS 2112 for silver?"*
    - *"सोने की हॉलमार्किंग और HUID कैसे जाँचें?"*
    - *"Can you guarantee that my product is BIS compliant?"*
  - Clear explanation: *"In this SIH prototype, session inquiries are retained in-memory for live judging."*

### 1.4 `app/(tabs)/profile.tsx` (Profile / About Tab)
- Update "About SahayakBIS" section:
  - State clearly: *"SahayakBIS is an evidence-grounded conversational guidance layer for Indian Standards. It is an advisory assistive companion, not an official government agency or certification body."*
  - Reiterate BIS Authority: *"The Bureau of Indian Standards (BIS) remains the sole authoritative source for all Indian Standards, certifications, and Quality Control Orders."*
  - Pilot Scope Statement: *"Selected categories (LED lighting, Gold hallmarking, and Silver jewellery) are demonstrated in this prototype to showcase the evidence-grounded architecture."*
