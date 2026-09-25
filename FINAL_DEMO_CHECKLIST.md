# SahayakBIS 🇮🇳 — SIH 2026 Grand Finale Demo Script & Walkthrough

**Audience**: SIH Evaluators / Grand Finale Jury  
**Duration**: 3–5 Minutes  
**Live Prototype URL**: `http://localhost:8082`  
**Core Motto**: *"National Standards & Conformity Intelligence — Grounded in Official BIS Evidence"*

---

## 🎯 1. 30-Second Elevator Pitch (The Hook)

> *"Good morning respected evaluators. Navigating Indian Standards has traditionally been fragmented across 20,000+ technical documents, Gazette notifications, ministerial Quality Control Orders, and multiple portals. MSMEs struggle to identify applicable standards and understand mandatory certification requirements, while citizens struggle to verify hallmarking or report non-compliance.
>
> Introducing **SahayakBIS** — a national conversational intelligence layer designed to democratize access to Indian Standards and BIS services.
>
> What makes SahayakBIS unique is our **Evidence Gate Architecture**: every response is strictly bounded by verified Gazette notifications, standard documents, and ministerial orders. If verified evidence is not available, the system safely abstains rather than hallucinating regulatory claims."*

---

## ⏱️ 2. The 3–5 Minute Step-by-Step Demo Flow

### 🎬 ACT 1: National Product Positioning & Workflow (45 Seconds)

1. **Screen**: Open Home Tab (`/`). Point out:
   - **Product Header**: *SahayakBIS — National Standards & Conformity Intelligence*
   - **End-to-End Workflow Visualization Strip**:
     `[ 01 ASK ] ➔ [ 02 UNDERSTAND ] ➔ [ 03 FIND ] ➔ [ 04 VERIFY ] ➔ [ 05 GUIDANCE ] ➔ [ 06 OFFICIAL SOURCE ]`
   - *Key Talking Point*: *"SahayakBIS covers the full standards lifecycle — from discovering applicable Indian Standards to understanding mandatory orders, lab testing, and official portal filing."*
2. **Show Core Capabilities**:
   - 5 Product Capabilities: *Find My Standard*, *Check BIS Requirement*, *Build Compliance Roadmap*, *Verify / Understand*, and *Explore BIS Services*.
3. **Show Trust Framework**:
   - Highlight the **Evidence-Backed Trust Framework**: *"No sufficient verified evidence → No definitive compliance claim."*
   - Point out the transparent declaration: *"Current Prototype Evidence Coverage"* showcasing the connected representative slices.

---

### 🎬 ACT 2: Industry Compliance & Evidence Grounding (1.5 Minutes)

1. **Action**: Tap **`LED Lamp Standard (IS 16102)`** (or ask *"Which BIS standard applies to LED bulbs?"*).
2. **Observe**:
   - Animated loading pipeline: *Understanding query → Finding relevant BIS evidence → Checking source status → Preparing grounded answer*.
   - Structured response: **Answer ➔ Evidence Card ➔ Next Step Action**.
   - Note the verified citation: **IS 16102 (Part 1):2026** (Safety Requirements, First Revision) & **IS 16102 (Part 2):2012** (Performance Requirements).
3. **Action**: Tap **`[View Evidence Details]`** to open the Evidence Drawer:
   - **Panel 1 (Technical Specification)**: Technical scope, mandatory safety test parameters (insulation, shock protection, thermal endurance).
   - **Panel 2 (Regulatory Legal Basis)**: Statutory order (MeitY Electronics & IT Goods Order), Scheme-II (CRS), and official BIS source link.
   - *Key Talking Point*: *"Notice that we strictly distinguish the voluntary technical standard from the mandatory statutory order that enforces it."*
4. **Action**: Tap **`LED Compliance Roadmap`**:
   - Opens the 5-stage conformity roadmap: *Identify Standard ➔ Scheme Check ➔ Lab Testing at BIS-Recognized Lab ➔ Document Preparation ➔ Portal Filing via CRS*.

---

### 🎬 ACT 3: Citizen Protection & Precious Metals (1 Minute)

1. **Action**: Tap **`Gold Hallmarking & HUID`** (or ask *"How do I verify a 6-digit HUID on gold jewellery?"*).
2. **Showcase**:
   - The 3 mandatory hallmarking marks:
     1. BIS Logo
     2. Purity & Fineness grade (e.g. 22K916 per IS 1417:2016)
     3. 6-digit laser-engraved alphanumeric HUID
   - *Key Talking Point*: *"SahayakBIS educates citizens on standards, but enforces statutory authority boundaries by directing consumers to the official BIS CARE app for real-time verification."*
3. **Action**: Tap **`22K916 Meaning & Purity`**:
   - Explains 22 Karat (91.6% pure gold) and displays the fineness breakdown.

---

### 🎬 ACT 4: AI Safety, Safe Abstention & Language Guardrails (1 Minute)

1. **Adversarial Guarantee Defense**:
   - Ask: *"Can you guarantee that my product is BIS compliant?"*
   - **Showcase**: Immediate safe abstention. Explains that SahayakBIS is an advisory AI companion; only BIS and accredited laboratories have statutory authority to test and certify.
2. **Hinglish Rejection**:
   - Type: *"LED bulb ke liye BIS certificate kaise milega?"*
   - **Showcase**: Language guardrail rejects colloquial Hinglish, guiding the user to choose formal Devanagari Hindi or English.
3. **Bilingual Localization**:
   - Tap **`हि`** in the header. The entire UI transforms into formal Devanagari Hindi (*राष्ट्रीय मानक एवं अनुरूपता आसूचना*).

---

### 🎬 ACT 5: Architecture, Evidence Library & Scale (45 Seconds)

1. **Tab 2 — BIS Evidence Library (`/saved`)**:
   - Point out functional organization: *Standards Specifications*, *Regulatory Orders (QCO/CRO)*, *Conformity Assessment Schemes*, and *Digital Services (Manakonline & BIS CARE)*.
2. **Tab 3 — Query History & Workflows (`/history`)**:
   - Organized across the 5 lifecycle stages from scoping to authority boundaries.
3. **Tab 4 — About SahayakBIS (`/profile`)**:
   - **Universal Value Proposition** (MSMEs, Consumers, Regulators).
   - **Implementation vs Production Architecture Table**: Transparently explains the journey from the SIH verified prototype slice to the full 20,000+ standards production system with pgvector and automated gazette ingestion.

---

## 🏆 Summary Closing Statement for Judges

> *"SahayakBIS proves that conversational AI in government and regulatory domains must be built on verifiable evidence, explicit authority boundaries, and zero hallucination. We have demonstrated a complete, credible slice of this national intelligence platform for SIH 2026."*
