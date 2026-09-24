# SahayakBIS — Demo Flow Audit Report

**Date:** September 2026  
**Auditor:** Agent C (Demo Scenarios & Query Classification Audit)  
**Target:** 11 SIH Evaluation Tests & Free-Text Query Engine  
**Objective:** Bulletproof reliability for a 3–5 minute live presentation before SIH judges.

---

## 1. Evaluation of the 11 Exact Demo Queries

| Test ID | Query | Expected Workflow | Current Status | Required Improvement |
|---|---|---|:---:|---|
| **TEST 1** | *"I manufacture self-ballasted LED lamps. Which BIS standard applies and what should I do next?"* | **Industry Deep-Dive:** Product → IS 16102 → CRS scheme → Lab testing requirements → 5-step Roadmap CTA. | Needs Improvement | Currently matches generic LED; needs to explicitly recognize dual intent: Standard Discovery + Next Step/Roadmap guidance. |
| **TEST 2** | *"What is the BIS standard for self-ballasted LED lamps?"* | **Standard Discovery:** Returns IS 16102 (Part 1: Safety & Part 2: Performance) with Evidence Card. | **PASS** | Works reliably via `isLed`. |
| **TEST 3** | *"Is BIS certification required for LED lamps?"* | **Regulatory Requirements:** Explains CRS applicability under MeitY/BIS order without confusing standards with licensing. | **PASS** | Matcher handles `require`, `mandatory`, and `rule`. |
| **TEST 4** | *"How can I verify gold jewellery?"* | **Consumer Protection:** Explains 3 mandatory marks (BIS logo, fineness e.g. 22K916, 6-digit HUID), and points to BIS CARE app. | **PASS** | Works reliably via `isGold`. |
| **TEST 5** | *"How do I verify the HUID of gold jewellery?"* | **HUID Consumer Workflow:** Explains 6-digit laser HUID structure and guides user to BIS CARE mobile app ("Verify HUID"). | Needs Improvement | Explicitly highlight that SahayakBIS assists with understanding, while live lookup is done on the official BIS CARE app. |
| **TEST 6** | *"What is IS 2112?"* | **Multi-Category Verification:** Explains IS 2112 for silver, fineness grades (999 to 800), and voluntary scheme status. | **PASS** | Works reliably via `2112`. |
| **TEST 7** | *"सोने की ज्वेलरी कैसे verify करें?"* or *"एलईडी बल्ब के लिए BIS मानक क्या है?"* | **Multilingual Access:** Pure Devanagari Hindi generation for Answer, Evidence Card, Next Step, and Hindi follow-up chips. | **PASS** | Hindi regex and translation engines operational. |
| **TEST 8** | *"led bulb ka bis certification kaise kare"* | **Language Safety:** Polite rejection of romanized Hinglish; instructs user to use standard English or Devanagari Hindi. | **PASS** | Hinglish dictionary caught accurately. |
| **TEST 9** | *"Can you guarantee that my product is BIS compliant?"* | **Adversarial / Guarantee Demands:** Safe abstention stating SahayakBIS is an advisory guidance tool; BIS remains authoritative. | Needs Improvement | Needs dedicated adversarial matcher for words like `guarantee`, `certify`, `compliance legal`. |
| **TEST 10** | *"I manufacture a product that is not in your available BIS evidence. Which certificate do I need?"* | **Adversarial / Unknown Scope:** Explicitly acknowledges evidence absence without fabricating a certificate number. | Needs Improvement | Currently falls back to generic abstention; needs dedicated guidance to search the full BIS directory on manakonline.in. |
| **TEST 11** | *"What is the stock price of Apple?"* | **Adversarial / Out-of-Scope:** Refuses non-standards queries; directs user back to BIS guidance. | **PASS** | Generic safe abstention triggers cleanly. |

---

## 2. Natural Free-Text Query Engine Architecture

To decouple the prototype from brittle string matches without introducing an unpredictable ungrounded LLM, we define a modular 4-tier taxonomy:
1. **PRODUCT:** `LED_LAMPS` | `GOLD_JEWELLERY` | `SILVER_ARTEFACTS` | `UNKNOWN_PRODUCT`
2. **INTENT:** `DISCOVER_STANDARD` | `REQUIREMENT_CHECK` | `ROADMAP_REQUEST` | `VERIFY_HALLMARK_HUID` | `ADVERSARIAL_GUARANTEE` | `ADVERSARIAL_CERTIFY` | `OUT_OF_SCOPE`
3. **LANGUAGE:** `ENGLISH` | `HINDI` | `HINGLISH`
4. **SCOPE:** `IN_PILOT_SCOPE` | `OUT_OF_SCOPE`

---

## 3. Contextual Follow-up Chips Blueprint

| Topic Trigger | Primary Follow-Up Chip 1 | Primary Follow-Up Chip 2 | Primary Follow-Up Chip 3 |
|---|---|---|---|
| **LED Lamps (Industry)** | *"Is BIS certification required for this product?"* | *"Show me the compliance roadmap"* | *"What testing is required under IS 16102?"* |
| **Gold / Hallmarking (Consumer)** | *"How do I verify the HUID in BIS CARE?"* | *"What does 22K916 mean?"* | *"Where can I find a BIS-recognised AHC?"* |
| **Silver (Pilot Category 2)** | *"What is 925 sterling silver purity?"* | *"Is silver hallmarking mandatory or voluntary?"* | *"Show official BIS silver information"* |
| **Safe Abstention / Adversarial** | *"Which BIS standard applies to LED bulbs?"* | *"How can I verify gold jewellery?"* | *"View official BIS portals"* |
