# SahayakBIS 🇮🇳 — SIH 2026 Grand Finale Demo Script & Walkthrough

**Audience**: SIH Evaluators / Grand Finale Jury  
**Duration**: 3–5 Minutes  
**Live Prototype URL**: `http://localhost:8082`  
**Core Motto**: *"Safe Guidance Grounded in Official BIS Evidence"*

---

## 🎯 1. 30-Second Elevator Pitch (The Hook)

> *"Good morning respected evaluators. Navigating Indian Standards has traditionally been fragmented across technical PDFs, gazette notifications, and complex ministerial portals. Small manufacturers struggle to know which standard applies and whether certification is mandatory, while consumers often don't understand the hallmarks stamped on their jewellery.*
>
> *Introducing **SahayakBIS** — a conversational AI guidance layer built to make Indian Standards and BIS conformity accessible, trustworthy, and verifiable. Unlike generic LLMs that hallucinate standards or invent compliance certificates, SahayakBIS operates under a strict **Evidence Gate**: if a claim cannot be verified against official BIS gazette or standard documents, the system refuses to speculate."*

---

## ⏱️ 2. The 3–5 Minute Step-by-Step Demo Flow

### 🎬 ACT 1: Industry Pilot — MSME Compliance (1.5 Mins)

1. **Screen**: Open Home Tab (`/`). Point out the **Pilot Scope Banner**:
   - *Key Talking Point*: *"Notice our pilot boundary: we explicitly declare our scope across Industry and Consumer domains, avoiding inflated claims."*
2. **Action**: Tap the query chip: **`IS 16102 (LED Lamp Standard)`** (or type *"What is the BIS standard for self-ballasted LED lamps?"*).
   - Observe the **4-Stage Loading Animation** (*Scanning BIS Catalogue → Verifying Legal Orders → Extracting Technical Clauses → Synthesizing Safe Guidance*).
   - *Key Talking Point*: *"Every response breaks down into Answer → Official Evidence → Next Actionable Step."*
3. **Action**: Tap **`[Review Citation & Scope]`** on the Evidence Card.
   - **Showcase the Dual-Panel Evidence Drawer**:
     - **Panel 1 (Technical Specification)**: Points to IS 16102 (Part 1):2026 (Safety, First Revision) & Part 2:2012 (Performance).
     - **Panel 2 (Regulatory Legal Basis)**: Points to MeitY Electronics and IT Goods (Compulsory Registration) Order, CRS Scheme II.
   - *Key Talking Point*: *"Generic AI confuses a voluntary technical standard with a mandatory legal requirement. SahayakBIS clearly isolates the standard from the statutory order that enforces it."*
4. **Action**: Tap **`LED 5-Step Compliance Roadmap`** (or Next Step link).
   - **Showcase the 5-Stage Interactive Roadmap**:
     - Stage 1: Standard Identification
     - Stage 2: BIS-Recognized Lab Testing
     - Stage 3: CRS Portal Submission
     - Stage 4: Scrutiny & Grant of Registration
     - Stage 5: Standard Mark & Labeling
   - *Key Talking Point*: *"This gives MSMEs an end-to-end operational roadmap with realistic timeframes."*

---

### 🎬 ACT 2: Consumer Protection Pilot — Hallmarking & Trust (1 Min)

1. **Action**: Tap the consumer query chip: **`Gold Hallmarking & HUID Breakdown`** (or type *"What does the hallmark on gold jewellery mean?"*).
   - **Showcase**: The 3 official marks:
     1. BIS Standard Logo
     2. Purity / Fineness (e.g. 22K916)
     3. 6-Digit Alphanumeric HUID (Hallmark Unique Identification)
   - *Key Talking Point*: *"We also draw a clear boundary between advisory education and real-time verification: SahayakBIS explains the marks and cites IS 1417, but directs consumers to the official BIS CARE app for real-time HUID database lookups."*
2. **Action**: Tap **`22K916 Meaning & Purity Table`**.
   - Show how the system explains 91.6% pure gold alloyed with 8.4% metals per IS 1417:2016.

---

### 🎬 ACT 3: AI Safety & Boundary Defense (1 Min)

1. **Action**: Type or select from History:
   > *"Can you certify my LED lamp or guarantee BIS approval?"*
2. **Showcase**:
   - The immediate **Safety Refusal**:
     - Explains SahayakBIS is an AI advisory companion.
     - Reaffirms that the **Bureau of Indian Standards is the sole statutory certification body** under the BIS Act, 2016.
     - Neither this AI nor any third-party tool can grant certificates or guarantee approvals.
   - *Key Talking Point*: *"This prevents regulatory liability and deceptive commercial claims."*
3. **Action**: Tap the **`[हि]`** Language Toggle in the header.
   - Show instant translation into pure Devanagari Hindi across the entire interface (headers, scope banner, query chips, drawer, and guidance cards).
4. **Action**: (Optional if asked) Type a Hinglish query: *"LED bulb ke liye BIS certificate kaise milega?"*
   - Show the Hinglish rejection banner instructing the user to choose pure Hindi or English.

---

### 🎬 ACT 4: Trust Architecture & Extensibility (30 Secs)

1. **Action**: Tap the **Sources Tab (`/saved`)**:
   - Show organized primary sources: Industry (IS 16102, CRS Portal) & Consumer (IS 1417, IS 2112, BIS CARE).
2. **Action**: Tap the **About Tab (`/profile`)**:
   - Show the Hackathon Companion positioning, 4 Core Principles (Evidence Gate, Separation of Standard vs Order, Strict Safety, Grounded Truth), and Statutory Disclaimer.
3. **Closing Statement**:
   > *"SahayakBIS is designed as an extensible reference architecture for the Department of Consumer Affairs and BIS. It solves citizen confusion, boosts MSME ease of doing business, and eliminates AI hallucinations through strict evidence grounding. Thank you!"*

---

## ⚡ 3. Quick-Response Cheatsheet for Judges' Questions

| Judge Question | Winning Response |
|:---|:---|
| *"Is this just a wrapper around ChatGPT?"* | *"No, sir/ma'am. Standard LLMs hallucinate non-existent IS numbers and falsely claim products are mandatory when they are voluntary. SahayakBIS implements a strict Evidence Gate architecture where every claim is validated against indexed BIS gazettes and technical standards before generation. Without verified evidence, the system abstains safely."* |
| *"Can you verify any product in India?"* | *"This prototype demonstrates a high-depth pilot covering both an Industry domain (LED Lamps under IS 16102 and CRS) and Consumer domain (Gold IS 1417 and Silver IS 2112). The underlying schema is designed to scale across all 20,000+ Indian Standards as BIS expands its digital gazette APIs."* |
| *"Can someone use this to fake BIS approval?"* | *"Absolutely not. As demonstrated in our safety refusal, the system explicitly informs users that SahayakBIS has no certification power and that only BIS officers and authorized labs under the BIS Act, 2016 can grant licenses or registrations."* |
| *"Why reject Hinglish?"* | *"In technical regulatory compliance, mixed colloquial language introduces severe ambiguity in legal terms (e.g. 'registration' vs 'certification' vs 'license'). To ensure 100% legal accuracy, we support rigorous Devanagari Hindi and English."* |
