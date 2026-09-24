# SahayakBIS — BIS Content & Trust Audit Report

**Date:** September 2026  
**Auditor:** Agent B (Regulatory Standards & Factual Integrity Audit)  
**Target:** SahayakBIS SIH Grand Finale Prototype  
**Motto:** `NO VERIFIED EVIDENCE → NO DEFINITIVE COMPLIANCE CLAIM`

---

## 1. Regulatory Framework & Standards Audit

Every factual claim in the prototype was checked against published Bureau of Indian Standards gazettes and Ministry notifications:

### 1.1 Self-Ballasted LED Lamps (Industry Category)
- **Indian Standards:**
  - `IS 16102 (Part 1):2012` — *Self-Ballasted LED Lamps for General Lighting Services - Part 1: Safety Requirements*
  - `IS 16102 (Part 2):2012` — *Self-Ballasted LED Lamps for General Lighting Services - Part 2: Performance Requirements*
- **Regulatory Scheme:**
  - **Compulsory Registration Scheme (CRS)** under Scheme-II of BIS (Conformity Assessment) Regulations, 2018, originally notified by Ministry of Electronics & IT (MeitY) under the Electronics & IT Goods (Requirements for Compulsory Registration) Order.
  - **Marking:** Standard CRS mark containing the statement *"Self Declaration - Conforming to IS 16102 (Part 1)"* together with a unique **Registration Number (R-number)**.
  - *Distinction:* This is **NOT** the ISI Mark scheme (Scheme-I / Product Certification Scheme). The prototype correctly identifies this as CRS.
- **Testing & Lab Requirement:**
  - Samples must be tested at a BIS-recognized laboratory for both safety (insulation resistance, electric strength, creepage distance) and performance (initial lumen output, wattage, power factor).
  - *Audited Claims:* The prototype claims no fake clause numbers or fees. Timelines (10–15 working days) are appropriately marked as indicative with asterisks.

### 1.2 Gold Hallmarking (Consumer Category)
- **Indian Standard:**
  - `IS 1417:2016` — *Gold and Gold Alloys, Jewellery/Artefacts — Fineness and Marking — Specification*
- **Regulatory Status:**
  - Mandatory in notified districts across India under the Hallmarking Quality Control Order (QCO) issued by the Ministry of Consumer Affairs, Food and Public Distribution.
- **3-Mark Regime (Post-April 2023):**
  - Exactly 3 mandatory marks:
    1. **BIS Standard Logo** (triangle emblem)
    2. **Purity / Fineness Grade** (e.g., `24K999`, `22K916`, `18K750`, `14K585`)
    3. **6-Digit Alphanumeric HUID** (Hallmark Unique Identification laser-engraved at a BIS-recognized Assaying & Hallmarking Centre - AHC).
  - *Consumer HUID Handoff:* SahayakBIS explains the significance and components of the hallmark. For live verification, the prototype explicitly hands off to the official **BIS CARE mobile app** ("Verify HUID" feature) and does not pretend to perform live cryptographic lookups.

### 1.3 Silver Hallmarking (Representative Pilot Category)
- **Indian Standard:**
  - `IS 2112:2014` — *Silver and Silver Alloys, Jewellery/Artefacts — Fineness and Marking — Specification*
- **Regulatory Status:**
  - **Voluntary** under the BIS Hallmarking Scheme. While gold is mandatory in notified districts under QCO, silver hallmarking is voluntary for jewellers/manufacturers.
  - Compliant hallmarked articles carry 3 marks: BIS logo, purity grade (`999`, `970`, `925` Sterling Silver, `900`, `835`, `800`), and 6-digit alphanumeric HUID.
  - *Language Nuance:* Hallmarking provides **third-party assurance of purity**; it is not described as a legal guarantee or mandatory requirement.

---

## 2. Unsupported Certainty & Over-Claiming Audit

| Banned Over-Claiming Phrase | Location Checked | Prototype Status | Required Replacement / Safe Phrasing |
|---|---|---|---|
| *"Zero hallucination guarantee"* | Entire code & UI | **REMOVED** | *"Grounded in verified BIS sources"* / *"Evidence-first guidance"* |
| *"100% accurate"* | Entire code & UI | **ABSENT** | Verified absent from all source strings |
| *"Guaranteed compliance"* | Entire code & UI | **ABSENT** | *"SahayakBIS provides guidance; BIS remains the authority"* |
| *"Guarantees authenticity"* | `isSilver` answer | **REPLACED** | *"Provides third-party assurance of purity"* |
| Fake clause/page numbers | `EVIDENCE_DATABASE` | **VERIFIED CLEAN** | Only overarching IS codes, parts, and official titles cited |
| Fake fees / timelines | Roadmap modal | **VERIFIED CLEAN** | Turnaround times flagged with `* Indicative only; confirm with lab` |
| Complete BIS coverage claims | Profile / Intro | **REPLACED** | *"Selected categories are demonstrated in this prototype; extensible to all Indian Standards"* |

---

## 3. Strict Distinctions to Enforce

In all visible UI cards and drawer explanations, the following concepts are strictly separated:
1. **Indian Standard (IS Number):** The technical specification document prepared by BIS sectional committees.
2. **Conformity Assessment Scheme:** The operational framework (e.g., Compulsory Registration Scheme [CRS] vs ISI Mark [Scheme-I] vs Hallmarking Scheme).
3. **Mandatory Regulatory Requirement:** A government-notified Quality Control Order (QCO) or technical regulation enforcing compliance under the BIS Act. A standard is voluntary unless notified under a mandatory order.

---

## 4. Adversarial Safe Abstention Rules

When an inquiry asks:
- For legal certification: *"Can you certify my product?"*
- For compliance guarantee: *"Can you guarantee my factory is compliant?"*
- For an unverified product: *"I make electric blankets, what certificate do I need?"*

**System Response Behavior:**
- Safe abstention card renders with calm visual style (no alarmist red error).
- Explains that SahayakBIS is an evidence-grounded advisory companion and that definitive compliance requires accredited testing and BIS portal submission.
- Offers dual actions: `[Refine Question]` and `[View Official BIS Sources]`.
