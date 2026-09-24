# SahayakBIS --- Product Requirements Document

## Product

SahayakBIS --- an evidence-grounded conversational intelligence layer
for Indian Standards and BIS services.

## Goal

Turn: **ASK → UNDERSTAND → FIND → VERIFY → ROADMAP → ACT**

into a reliable workflow for MSMEs, startups, exporters, consumers,
students and researchers.

## MVP Scope

Start with **2--3 carefully selected BIS categories**. Do not claim full
BIS-catalogue coverage.

Core journeys: 1. Find My Standard 2. Check BIS Requirement 3. Build
Compliance Roadmap 4. Verify / Understand BIS Information

## P0 Requirements

-   Natural-language query interface
-   Product/entity + intent understanding
-   Keyword + semantic hybrid retrieval
-   Supabase Postgres + pgvector evidence store
-   Source metadata
-   Grounded answer generation
-   Mandatory source/reference display
-   Evidence Gate
-   Safe abstention
-   Hindi + English
-   Responsive web UI
-   Production deployment

## P1 Requirements

-   Structured compliance roadmap
-   Standard → testing → next-step workflow
-   Official BIS deep-links
-   Document/page/section/clause references where available
-   Query history
-   Evidence drawer
-   Version/effective-date awareness
-   Suggested follow-ups

## Answer Contract

A definitive answer must be supported by retrieved evidence.

Show: - direct answer - applicable standard/service information when
supported - short explanation - evidence/source - next action

If evidence is insufficient: \> **NO VERIFIED EVIDENCE → NO DEFINITIVE
COMPLIANCE CLAIM**

## Certification Safety

Never assume a standard means certification is mandatory. Distinguish: -
standard - certification scheme - testing requirement -
QCO/notification - voluntary certification - compulsory certification -
official service guidance

## Non-Goals

-   Generic ChatGPT clone
-   Certification authority
-   Government approval engine
-   Replacement for BIS Care
-   Full BIS catalogue in MVP
-   Unsupported impact/accuracy claims

## Evaluation

Build 50--100 test queries covering standard discovery, product/service
questions, consumer questions, MSME questions, Hindi, ambiguity,
out-of-scope and adversarial cases.

Measure: - retrieval accuracy - citation correctness - grounded-answer
rate - abstention accuracy - multilingual success - latency - roadmap
completeness

## Acceptance

Demo-ready only when the golden flow works end-to-end, citations are
visible, unsupported questions abstain, secrets are protected, official
links work, production deployment works and a recorded fallback exists.
