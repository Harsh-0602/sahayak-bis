# SahayakBIS — Working Prototype: Complete A-to-Z Specification
### Built lean for Internal Round, architected to extend toward Grand Finale

This document assumes you have ~2 days (36-48 hours) before your internal
round demo. Everything here is scoped so a real, running prototype is
achievable — not a mockup, not fake data — while still being extensible if
you're shortlisted.

---

## A. WHAT "WORKING PROTOTYPE" MEANS HERE — SCOPE

**In scope (build this):**
- A real, deployed, publicly-accessible chat app
- 2 product categories with genuine BIS data (not fabricated answers)
- Every answer either correctly cited or honestly "not found" — no fake citations
- A live public URL + QR code judges can actually open on their own phone

**Out of scope (do NOT attempt for internal round):**
- User accounts / login / saved history
- Full BIS catalogue coverage
- Voice input
- Payment/premium features
- Admin dashboard

Trying to build the "out of scope" items now is the single biggest way
teams run out of time and end up with nothing working. Resist the urge.

---

## B. CORE FEATURES (exactly 8, mapped to the PS)

| # | Feature | Priority |
|---|---|---|
| 1 | Conversational Q&A in Hindi/English | Must-have |
| 2 | Standard recommendation from product description | Must-have |
| 3 | Certification scheme explanation (ISI/CRS/FMCS) | Must-have |
| 4 | Certification Roadmap Generator (step checklist) | Must-have |
| 5 | Testing lab suggestion | Must-have |
| 6 | Hallmarking guidance | Must-have |
| 7 | Citation on every answer (IS number/clause) | Must-have — this is your differentiator |
| 8 | Consumer-query mode (plain-language explanations) | Must-have |

Everything else (BIS Care App deep-links, voice, multi-category scale) is
Slide-4 "Extensibility" — mention it, don't build it now.

---

## C. USER JOURNEYS (design your UI around these 3)

**Journey 1 — MSME/Exporter:**
Types "I want to export LED bulbs, which BIS certification do I need?" →
gets an answer naming the CRS scheme and IS 16101/16102 with a citation →
clicks "Generate Certification Roadmap" → sees a 4-step checklist with
time estimates.

**Journey 2 — Consumer:**
Types "What does the ISI mark mean?" or "How do I verify gold hallmarking?"
→ gets a plain-language answer, still cited, no jargon.

**Journey 3 — Student/Researcher:**
Types "What is IS 16101?" → gets a direct lookup answer with the standard's
scope and citation.

Build and test these 3 flows end-to-end before anything else — they are
your actual demo script (see Section M).

---

## D. SCREENS / UI SPECIFICATION

### Screen 1 — Chat Home
- Top bar: "SahayakBIS" logo/name, language toggle (Hindi/English — can be
  a simple label, doesn't need to translate the whole UI, just signals bilingual support)
- 2-3 clickable "suggested prompt" chips above the input box (pre-fill the
  3 demo questions from Section C — reduces live-typing risk during demo)
- Chat message list (scrollable)
- Text input + send button at the bottom

### Screen 2 — Bot Answer (a component, not a separate page)
- Answer text in a distinct bubble
- A **citation badge** below the answer text: "Source: IS 16101:2012" —
  make this visually distinct (colored, bold) since it's your core
  differentiator
- If the question matches a certification-type intent, show a button:
  "Generate Certification Roadmap"

### Screen 3 — Roadmap View
- Triggered by the button in Screen 2, or a new message
- A horizontal or vertical stepper: e.g. Testing → Document Preparation →
  Online Application → BIS Review & Registration
- Each step: title + short description + estimated duration (e.g. "10-15
  days")
- Total estimated timeline at the bottom (e.g. "Total: 20-30 working days")

### Screen 4 (optional, easy win) — About/Sources
- A static page listing your 5 verified sources with links — takes 15
  minutes to build and answers Slide-6 questions live if a judge asks to
  see it on the actual product.

---

## E. SYSTEM ARCHITECTURE (how it all connects)

```
User types a question (Next.js frontend)
        |
        v
FastAPI backend receives POST /api/query
        |
        v
Question is embedded (same multilingual model used on ingested data)
        |
        v
Supabase (Postgres + pgvector) similarity search -> top-3 chunks
        |
        v
Prompt built: [system instructions] + [3 chunks] + [user question]
        |
        v
Groq LLM call (Gemini as fallback if Groq errors/rate-limits)
        |
        v
Response parsed: {answer_text, source_is_number, confidence}
        |
        v
Returned to frontend -> rendered as chat bubble + citation badge
```

The Roadmap Generator is a second, simpler endpoint that follows the same
retrieve-then-generate pattern but with a prompt asking for a structured
checklist instead of a paragraph answer.

---

## F. DATA PLAN — exactly what to scrape

**Pick 2 categories only:**
1. **Electronics under CRS scheme** (e.g. LED bulbs, mobile chargers,
   power banks) — well-documented, clean structure on BIS's site
2. **Hallmarking** (gold jewellery) — high public interest, good demo value

**Sources to scrape (from your verified Slide 6 list):**
- bis.gov.in/know-your-standard — search results for your chosen product types
- bis.gov.in/product-certification/online-information — CRS scheme process
- bis.gov.in/hallmarking-overview — hallmarking process, HUID system

**Target volume:** 15-20 source documents/pages total, chunked into roughly
100-150 passages. This is enough depth for your 3 demo journeys plus a
reasonable buffer for an unexpected live question — you do not need
thousands of documents for a convincing demo.

---

## G. TECH STACK (confirmed, matches your PPT exactly)

| Layer | Tool |
|---|---|
| Frontend | Next.js + React + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database / Vectors | Supabase (Postgres + pgvector) |
| Embeddings | sentence-transformers (multilingual-MiniLM) |
| LLM | Groq (primary), Gemini (backup) |
| Deployment | Vercel (frontend), Render (backend) |

---

## H. DATABASE SCHEMA (Supabase)

```sql
create extension if not exists vector;

create table bis_chunks (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(384),        -- matches MiniLM output dimension
  source_document text,
  is_number text,
  category text,                 -- 'electronics' or 'hallmarking'
  created_at timestamp default now()
);

create index on bis_chunks using ivfflat (embedding vector_cosine_ops);
```

No user/auth tables needed for the prototype — keep it to this one table.

---

## I. BACKEND API ENDPOINTS

```
POST /api/query
  body: { "question": string, "language": "hi" | "en" | "auto" }
  returns: { "answer": string, "is_number": string | null,
             "source_document": string | null, "confidence": "high"|"low" }

POST /api/roadmap
  body: { "product_description": string }
  returns: { "steps": [{ "title": string, "description": string,
             "duration": string }], "total_duration": string }

GET /api/health
  returns: { "status": "ok" }   -- use this to sanity-check the deployed
                                   backend right before your demo
```

---

## J. FRONTEND COMPONENTS

```
<ChatWindow>            - top-level page, holds message state
  <SuggestedPrompts>     - the 2-3 clickable demo questions
  <MessageList>
    <UserMessage>
    <BotMessage>
      <CitationBadge>    - "Source: IS XXXX:20XX"
      <RoadmapButton>    - conditionally shown
  <RoadmapStepper>       - separate view/modal, shown on button click
  <ChatInput>            - text box + send button
  <LanguageToggle>       - simple Hindi/English label switch
```

---

## K. STEP-BY-STEP BUILD PLAN (36-48 hours)

**Phase 1 — Setup (2-3 hrs):** GitHub repo, Supabase project + pgvector
extension enabled, Next.js app scaffolded with Tailwind, Python environment
with all required packages, Groq + Gemini API keys obtained.

**Phase 2 — Data collection (4-5 hrs):** Scrape the 2 categories per
Section F, save raw text with source metadata.

**Phase 3 — Chunking + embedding (2-3 hrs):** Split into passages, generate
embeddings, load into the `bis_chunks` table.

**Phase 4 — Backend RAG engine (5-6 hrs):** Build `/api/query`, test with
your 3 demo questions using `curl` or a simple script before touching the
frontend at all.

**Phase 5 — Roadmap endpoint (2-3 hrs):** Build `/api/roadmap` once
`/api/query` is reliably working.

**Phase 6 — Frontend (6-8 hrs):** Build the components in Section J, wire
them to the backend. Get the ugly-but-working version first, polish styling
after it functions end-to-end.

**Phase 7 — Deployment (2-3 hrs):** Push both repos, deploy backend to
Render, frontend to Vercel, connect them via environment variable.

**Phase 8 — Testing (2-3 hrs):** Run all 3 demo journeys on the **deployed**
link (not localhost), fix anything broken, record a 60-90 second backup
video of a successful run.

**Total: roughly 25-31 hours of focused work** — leaves buffer within a
36-48 hour window for sleep and troubleshooting.

---

## L. TEAM ROLE SPLIT (6 members)

| Member | Owns |
|---|---|
| 1 | Data collection &amp; cleaning (Phase 2-3) |
| 2 | Backend / RAG engine (Phase 4) |
| 3 | Frontend UI (Phase 6) |
| 4 | Roadmap endpoint + integration support (Phase 5) |
| 5 | Deployment + testing lead (Phase 7-8) |
| 6 | Demo rehearsal, Q&A prep, backup-video recording |

---

## M. DEMO SCRIPT FOR INTERNAL ROUND

Prepare exactly these 3 questions, tested and working on the **deployed**
link, in this order:

1. *"I want to export LED bulbs, which BIS certification do I need?"*
   → expect CRS scheme + IS 16101/16102 citation
2. *"What does the ISI mark mean?"*
   → expect a plain-language, cited explanation
3. Click **"Generate Certification Roadmap"** after question 1 → show the
   4-step checklist

If a judge asks for a live, unscripted question — let them ask, but steer
toward your 2 covered categories if possible (e.g. "try asking about
hallmarking or CRS-scheme electronics"). If it's outside scope, your bot
should honestly say "no verified source found" — **this is a good thing
to demonstrate**, it shows your hallucination-safeguard working live.

**Backup plan:** if live internet fails, play your 60-90 second
screen-recording immediately — don't let the team stand in silence
debugging wifi.

---

## N. DEPLOYMENT — quick steps

**Backend (Render):**
1. Push FastAPI code to GitHub.
2. Render → New Web Service → connect repo → set build command
   (`pip install -r requirements.txt`) and start command
   (`uvicorn main:app --host 0.0.0.0 --port $PORT`).
3. Add environment variables: Supabase URL/key, Groq key, Gemini key.

**Frontend (Vercel):**
1. Push Next.js code to GitHub.
2. Vercel → New Project → import repo (auto-detects Next.js).
3. Add environment variable pointing to your Render backend URL.
4. Deploy — Vercel gives you a public `.vercel.app` link instantly.

---

## O. WHAT TO ACTUALLY SHOW LIVE (given your ~4-minute pitch)

Don't walk through every screen. During Slide 6 / closing, show **one**
live query (Journey 1) end-to-end — question typed, answer with citation
appears, roadmap button clicked. That's it. Save the rest for Q&A if judges
want to explore further.

---

## P. COMMON PITFALLS TO AVOID

- Trying to cover more than 2 categories — depth beats breadth for a demo.
- Skipping the citation badge to save frontend time — this is your core
  differentiator, never cut it.
- Testing only on localhost and assuming the deployed version works the
  same — always test the live link.
- Leaving the roadmap feature half-built — better to have 1 fully-working
  feature than 2 half-working ones.
- No fallback video — live demos fail more often than teams expect.

---

## Q. PRE-DEMO CHECKLIST (run this the morning of internal round)

- [ ] Hit `/api/health` on the deployed backend — confirm it responds
- [ ] Run all 3 demo questions on the live Vercel link, not localhost
- [ ] Confirm every demo answer shows a citation badge
- [ ] Confirm the roadmap button works and shows the 4-step checklist
- [ ] Backup video recorded and easily accessible (not buried in files)
- [ ] Phone/laptop fully charged, backup hotspot ready
- [ ] QR code printed/displayed pointing to the live link
