# SahayakBIS --- System Architecture

## Core Flow

``` text
USER
 ↓
SahayakBIS WEB PLATFORM
 ↓
QUERY UNDERSTANDING
 ├ language
 ├ product/entity
 ├ intent
 └ scope
 ↓
HYBRID RETRIEVAL
 ├ keyword
 └ semantic
 ↓
RERANKING
 ↓
BIS EVIDENCE INDEX
 ├ Standards
 ├ Testing Schemes
 ├ Certification
 ├ QCO / Notifications
 ├ Laboratories
 └ BIS Services
 ↓
VERSION / REGULATORY CHECK
 ↓
EVIDENCE GATE
 ├ sufficient → GROUNDED AI
 └ insufficient → SAFE ABSTENTION
 ↓
ANSWER + EVIDENCE + ROADMAP
 ↓
OFFICIAL BIS SERVICES
```

## Stack

-   Frontend: Next.js, React, Tailwind CSS, TypeScript
-   Backend: FastAPI, Python
-   Database: Supabase Postgres + pgvector
-   Embeddings: multilingual sentence-transformers or verified
    equivalent
-   LLM: provider abstraction; current documented setup uses Groq
    primary and Gemini fallback
-   Ingestion: Python, BeautifulSoup4, pdfplumber
-   Deployment: Vercel frontend + Render backend

Use only the providers actually configured in the repository.

## Evidence Metadata

Preserve where available: `source_url`, `source_type`, `source_title`,
`publisher`, `published_date`, `updated_date`, `retrieved_at`,
`document_version`, `page`, `section`, `clause`, `is_number`,
`standard_title`, `standard_year`, `status`, `supersedes`, `scheme`,
`qco`, `notification`, `product_category`, `testing_scope`,
`effective_date`, `content_hash`.

Never fabricate metadata.

## Knowledge Pipeline

``` text
Official BIS Source
 ↓
Fetcher / Importer
 ↓
Raw Document
 ↓
Text Extraction
 ↓
Cleaning
 ↓
Section/Page Detection
 ↓
Chunking
 ↓
Metadata Enrichment
 ↓
Embeddings
 ↓
Supabase pgvector
 ↓
Retrieval
```

## Retrieval

1.  Normalize query
2.  Detect language
3.  Extract product/entity/intent
4.  Run keyword retrieval
5.  Run semantic retrieval
6.  Merge candidates
7.  Rerank by relevance, authority and recency
8.  Apply Evidence Gate
9.  Generate grounded answer

## Evidence Gate

Check: - scope - sufficient evidence - authority - consistency -
current/effective status - whether evidence actually supports the
requested conclusion

Failure → no definitive compliance claim.

## Regulatory Check

Before mandatory/compliance claims inspect: - standard status -
revision/amendments - supersession - QCO/notification - effective date -
product/category

Never infer mandatory certification solely from an IS number.

## Roadmap

`product + goal + verified evidence → standard/scheme → testing → regulatory/certification status → next steps → official BIS service`

Every roadmap step should have evidence where possible.

## Suggested API

`POST /api/query` `POST /api/roadmap` `GET /api/sources/{id}`
`GET /api/health`

Optional later: `POST /api/feedback` `GET /api/history`
`POST /api/admin/ingest`

## Security

-   Server-side secrets only
-   Never expose API keys to browser
-   Validate input
-   Rate limit public APIs
-   Do not log secrets
-   Treat retrieved documents as untrusted data
-   Never allow retrieved text to override system safety rules

## Observability

Log request ID, language, retrieval latency, evidence IDs, model
latency, abstention reason and error category without storing secrets or
unnecessary sensitive data.

## Failure Handling

Primary provider → fallback provider → safe error.

Retrieval failure → retry/alternate retrieval → Evidence Gate →
abstention.

Conflicting evidence → show conflict and prefer authoritative/current
source.
