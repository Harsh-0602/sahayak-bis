# SahayakBIS — UX Audit Report

**Date:** September 2026  
**Auditor:** Agent A (UX & Information Architecture Audit)  
**Target:** SahayakBIS SIH Grand Finale Prototype  
**Scope:** `app/(tabs)/index.tsx`, `saved.tsx`, `history.tsx`, `profile.tsx`, `_layout.tsx`

---

## 1. Executive Summary

The current prototype provides a clean, responsive mobile-web interface with structured chat cards (Answer → Evidence → Next Step), interactive modal drawers, and bilingual toggle. However, from an evaluator's perspective, the current UX suffers from three critical perceptual bottlenecks:
1. **The "LED-Only" Illusion:** 3 of the 4 intent buttons and the initial roadmap flow revolve around LED lamps, inadvertently signaling to judges that SahayakBIS is a single-product tool rather than a generalized conversational BIS guidance layer.
2. **Lack of Visible Audience Segmentation:** The home interface does not visibly delineate between the two primary national stakeholders: **Industries/MSMEs** (standard discovery, CRS requirements, compliance roadmaps) and **Consumers/Citizens** (hallmark verification, HUID understanding, BIS CARE services).
3. **Evidence Drawer Depth & Touch Targets:** While the slide-up modal exists, the visual distinction between standard technical specifications and legal regulatory orders needs clearer grouping, and empty/static tabs (History, Sources, Profile) need purposeful content.

---

## 2. Screen-by-Screen UX Findings

### 2.1 Explore Screen (`index.tsx`)
- **Header & Branding:**
  - Header displays "SahayakBIS — Standards made simple" with EN/HI toggle pill and "Official BIS" link.
  - *Observation:* Clean and professional. Needs a subtle sub-tag or banner communicating prototype scope: *"Demonstrating representative Industry & Consumer standards · Selected pilot categories"*.
- **Intent Bar:**
  - Currently contains 4 intent buttons: "Find Standard", "BIS Requirement", "Roadmap", "Verify / Understand".
  - *Issue:* "Find Standard", "BIS Requirement", and "Roadmap" all dispatch LED queries. Only "Verify / Understand" touches gold hallmarking.
  - *Recommendation:* Restructure into a dual-mode or dual-segment bar:
    - **Industry Section:** `[Find a Standard]`, `[Understand Requirements]`, `[Compliance Roadmap]`
    - **Consumer Section:** `[Verify Hallmark]`, `[Understand HUID]`, `[BIS CARE Services]`
    - **Quick Category Selector:** Quick-switch chips for `LED Lighting (Industry)`, `Gold Jewellery (Consumer)`, and `Silver Artefacts (Trade/Consumer)`.
- **Chat Feed & Card Layout:**
  - Tripartite layout (`ANSWER` → `EVIDENCE` → `NEXT STEP`) is clear, logical, and highly credible.
  - Follow-up chips below `NEXT STEP` provide frictionless continuation.
  - *Improvement:* Ensure the Evidence Card visually highlights the **Regulatory Scheme** (CRS vs QCO vs Voluntary) with an explicit explanation rather than an ungrounded badge.
- **Evidence Details Drawer:**
  - Slide-up bottom sheet is well-received.
  - *Improvement:* Structure the content into two distinct panels:
    1. **Technical Standard Scope** (IS title, issuing division, testing parameters).
    2. **Regulatory & Scheme Basis** (CRS order vs Hallmarking QCO vs Voluntary Scheme) with direct official source CTAs.

### 2.2 Sources Screen (`saved.tsx`)
- Currently lists 4 sources in a single flat list.
- *Improvement:* Group sources into **Industry Compliance Portals** (MeitY CRS, BIS Product Certification) and **Consumer Protection Portals** (Hallmarking FAQs, HUID Consumer Guide, BIS CARE). Add a clear disclaimer stating that SahayakBIS retrieves guidance strictly from official gazettes.

### 2.3 History Screen (`history.tsx`)
- Currently shows a static "No history yet" card.
- *Improvement:* Make this screen actively helpful by providing a "Sample Demonstrations" list allowing judges or presenters to re-launch golden demo queries with one tap, alongside recent session inquiries.

### 2.4 Profile / About Screen (`profile.tsx`)
- Outlines the SIH prototype, but must unambiguously establish the relationship between SahayakBIS and the Bureau of Indian Standards:
  - *"SahayakBIS provides conversational guidance based on available BIS evidence. BIS remains the authoritative source for current standards, certification, and regulatory requirements."*
  - Not government-owned, not an official certification engine.

---

## 3. High-Priority UX Improvements for Sprint

1. **Dual Industry & Consumer Guidance Bar:** Visually separate industry compliance tools from citizen consumer verification tools on the main screen.
2. **Pilot Category Scope Pill:** Visually show that LED, Gold, and Silver are representative demonstrations of a generalized architecture.
3. **Consumer-Tailored HUID Flow:** In gold hallmarking answers, visually highlight that SahayakBIS guides understanding, while live HUID lookup is performed on the official **BIS CARE** mobile app.
4. **Adversarial / Safe Abstention Card Styling:** Calm, dignified design for safe abstention with clear action buttons: `[Refine Question]` and `[View Official BIS Sources]`.
