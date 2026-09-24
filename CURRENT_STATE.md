# SahayakBIS — Current State (Phase 0 Audit)
> Audit date: 2026-09-24

---

## Working Features ✅

| Feature | Location | Notes |
|---|---|---|
| Chat UI (send/receive messages) | `app/(tabs)/index.tsx` | Send button + Enter key |
| Language toggle (EN / हिन्दी) | `index.tsx` | Updates greeting + prompts |
| 3 suggested prompt chips | `index.tsx` | Scrollable horizontal row |
| Hinglish detection & rejection | `index.tsx` — `classifyQueryLanguage()` | Returns bilingual rejection message |
| LED (IS 16102) keyword answers | `index.tsx` — `getAnswer()` | English + Hindi |
| Gold hallmarking (HUID) answers | `index.tsx` — `getAnswer()` | English + Hindi |
| Silver (IS 2112) answers | `index.tsx` — `getAnswer()` | English + Hindi |
| General hallmarking answers | `index.tsx` — `getAnswer()` | Covers combined gold+silver queries |
| Safe abstention (out-of-scope) | `index.tsx` — `getAnswer()` | Returns "no verified source" in EN+HI |
| Citation badge (tappable → opens URL) | `index.tsx` | Works on web via `Linking.openURL` |
| LED certification roadmap modal | `index.tsx` — `roadmapSteps[]` | 4 bilingual steps + total timeline |
| Trust Centre / Sources tab | `app/(tabs)/saved.tsx` | Reads from Supabase or fallback array |
| Supabase source catalog | `supabase/migrations/…sql` | RLS: read-only for anon |

---

## Broken / Non-Functional Features ❌

| Feature | Symptom | Root Cause |
|---|---|---|
| History tab | Static placeholder, no data | No persistence layer |
| Supabase integration | Works only if `.env` is present | No env validation; silent fallback |
| `loadSources()` in index.tsx | Tapping "3 official BIS sources" fires fetch but result not shown distinctly | Sources already pre-loaded from fallback |

---

## Missing Features (vs PRD/Architecture/Design docs) 🔴

| Missing | Required by |
|---|---|
| Semantic / vector retrieval (pgvector) | PRD P0, Architecture.md |
| Real Evidence Gate (evidence sufficiency check) | PRD P0, Architecture.md, rules.md |
| LLM grounded answer generation | PRD P0, Architecture.md |
| Knowledge pipeline (fetch → chunk → embed → store) | Architecture.md, phasis.md Phase 2 |
| FastAPI backend server | Architecture.md |
| Hybrid retrieval (keyword + semantic) | PRD P0, Architecture.md |
| Version / regulatory check layer | Architecture.md |
| 4-intent action buttons (Find Standard / BIS Requirement / Roadmap / Verify) | design.md |
| Structured Answer → Evidence → Next Step card | design.md, rules.md Rule 11 |
| Evidence card with IS/page/clause/date | design.md |
| Hallmarking compliance roadmap | phasis.md Phase 6 |
| Follow-up question suggestions | PRD P1 |
| Evidence drawer / expandable sources | PRD P1 |
| Version / effective-date metadata | PRD P1, rules.md Rule 14 |
| Inter font | design.md |
| Correct design.md color palette (#0070C0 system) | design.md |
| Meaningful 4-stage loading states | design.md |
| Safe abstention action buttons (BIS link + Refine) | design.md |
| Query history persistence | PRD P1, phasis.md Phase 7 |
| Vercel / Render deployment | phasis.md Phase 11 |
| Test suite (50–100 queries) | PRD Evaluation, phasis.md Phase 9 |

---

## Technical Debt

1. `index.tsx` is 429 lines — UI, logic, data, and styles mixed together
2. Answer strings are hard-coded — no separation from evidence data
3. No backend — security boundary does not exist; all logic runs in browser
4. Stack mismatch — Architecture.md specifies Next.js + FastAPI; repo uses Expo/RN
5. Supabase used only for catalog display — no pgvector, no embeddings
6. Roadmap timelines asserted without evidence backing
7. No font loading — uses system fonts
8. No automated test suite
9. Docs (PRD, Architecture, rules, phasis, design) stored in Downloads — not committed to repo

---

## Run / Deploy Commands

```bash
# Install dependencies
cd e:\SahayakBIS-Prototype\sahayak-bis
npm install

# Start web dev server
npx expo start --web
# Open: http://localhost:8081

# Required environment (copy .env.example → .env and fill in):
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

App runs without Supabase env vars (uses local fallback sources). No LLM API keys required (no LLM integration yet).

---

## What Must Not Break During Improvements

- Hinglish rejection logic (`classifyQueryLanguage`)
- Citation badge + source URL display
- Language toggle (EN/HI)
- Out-of-scope safe abstention message
- LED roadmap modal (4 steps, bilingual)
- All IS numbers (16102, 1417, 2112) — must remain exact
- BIS URLs (must remain real, verified URLs)
- Supabase RLS policy
