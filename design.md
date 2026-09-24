# SahayakBIS --- UI/UX Design System

## Design Objective

Professional, trustworthy government-information intelligence product
--- not a generic AI chatbot.

Priority: **Trust → Evidence → Clarity → Action → Polish**

## Visual Style

-   white/light background
-   blue primary system
-   clean technical line icons
-   restrained cards
-   high readability
-   no childish cartoons
-   no neon cyberpunk
-   no glossy 3D
-   no fake government seals/logos

## Colors

`#0070C0` primary blue `#005B96` dark blue `#EAF5FC` light blue
`#7650B8` purple `#43A982` green `#E3A62F` amber `#111111` text
`#555555` muted text `#B7D3EA` borders `#FFFFFF` background

## Typography

Use Inter/Arial/Aptos. Desktop hierarchy: - H1 32--40px - H2 24--30px -
H3 18--22px - Body 15--17px - Caption 12--14px

Evidence must remain readable.

## Main Screen

``` text
┌───────────────────────────────────────────────┐
│ SahayakBIS        EN | हिन्दी    Official BIS │
├───────────────────────────────────────────────┤
│        Ask about Indian Standards             │
│ [ Describe your product or question...   ]    │
│ [Find Standard] [BIS Requirement]             │
│ [Roadmap]       [Verify / Understand]         │
├───────────────────────────────────────────────┤
│ Answer                                        │
│ Evidence / Sources                            │
│ Next Step                                     │
└───────────────────────────────────────────────┘
```

## Query UX

Example prompts: - "I manufacture LED lamps. Which BIS standard should I
check?" - "Mere product ke liye BIS requirement kya hai?" - "Gold
jewellery par HUID kaise verify karu?"

## Answer Card

Separate: \### Answer Direct response.

### Evidence

Source title, IS number, page/section/clause when available, URL.

### Next Step

Clear action.

Core visual relationship: **ANSWER → EVIDENCE → ACTION**

## Evidence Card

``` text
EVIDENCE
IS 16102 (Part 1):2026
BIS LIMS
Section / Page / Clause
[Open official source]
```

Never invent missing metadata.

## Roadmap UI

``` text
01 Identify applicable standard
 ↓
02 Check scheme / regulatory status
 ↓
03 Review testing requirements
 ↓
04 Prepare required information
 ↓
05 Continue through official BIS service
```

Each step should expose supporting evidence where possible.

## Safe Abstention

Use a calm evidence-state card, not a generic red error:

``` text
Evidence not sufficient

I could not find enough verified BIS information
to make a definitive compliance claim.

[View official BIS sources]
[Refine your question]
```

## Multilingual

Visible `EN | हिन्दी`. Technical identifiers remain unchanged.

## Official BIS Links

Use contextual cards, e.g.: **Know Your Standard** Search BIS standards
by IS number or keyword `[Open BIS]`

## Responsive

Mobile: - single column - large tap targets - compact evidence cards -
vertical roadmap - no horizontal table overflow

Desktop: - answer + evidence + next-action zones where appropriate

## Loading

Use meaningful states: - Understanding query... - Finding relevant BIS
evidence... - Checking source status... - Preparing grounded answer...

Never fake percentages.

## Trust Signals

Use: - official-source labels - timestamps - evidence cards - limitation
messages - official links

Never show fake claims such as "99.9% accurate", "government approved",
"official BIS AI" or "100% compliance guaranteed".

## Accessibility

Keyboard navigation, visible focus, contrast, semantic buttons, alt
text, screen-reader labels, no color-only meaning, reduced-motion
support.

## Demo Mode

Allow pre-tested example queries and deterministic UI states without
faking backend results.

## Final Design Rule

Every major screen must reinforce:

**USER QUESTION → RETRIEVED EVIDENCE → GROUNDED ANSWER → NEXT ACTION**
