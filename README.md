# SahayakBIS 🇮🇳
> **Standards made simple** — An AI-powered, source-grounded assistant for Indian Standards (BIS), Certification Roadmaps, and Hallmarking Verification. Built for Smart India Hackathon (SIH 2026).

---

## 🌟 Overview
**SahayakBIS** simplifies Bureau of Indian Standards (BIS) regulations for MSMEs, manufacturers, and everyday consumers. Instead of navigating thousands of complex gazette documents, users can query standards, understand certification timelines, and verify hallmarking rules in **English** or **हिन्दी (Devanagari)**.

---

## ✨ Key Features
- **💡 LED Bulbs & Luminaires (IS 16102)**:
  - Covers Safety (Part 1:2012) and Performance (Part 2:2012) requirements under the Compulsory Registration Scheme (CRS).
  - **Interactive Certification Roadmap**: Step-by-step guidance from lab testing to portal registration with estimated timeline (20–30 working days).
- **🪙 Gold Hallmarking & HUID (IS 1417)**:
  - Explains the three mandatory hallmark signs: BIS logo, Purity/Fineness grade (24K, 22K916, 18K750, 14K585), and 6-digit alphanumeric HUID.
  - Verification guidance using the BIS CARE mobile app and Assaying & Hallmarking Centres (AHC).
- **🥈 Silver Hallmarking (IS 2112)**:
  - Standard guidelines, fineness grades (999, 970, 925 Sterling Silver, 900, 835, 800), and HUID authenticity checks for silver jewellery and artefacts.
- **🛡️ Anti-Hallucination Guardrails**:
  - Out-of-scope queries (e.g. mobile phones, cement, steel, generic electronics) are safely filtered with verified source disclaimers.
- **🌐 Bilingual Support (English & हिन्दी)**:
  - Instant one-click toggle between English and Hindi.
  - Strict language consistency: English queries receive English answers, Hindi queries receive Hindi answers.
  - Hinglish filter to enforce official language standards.
- **📑 Trust Centre (Verified Sources)**:
  - Every answer is backed by official BIS gazette links and source citations.

---

## 🛠️ Tech Stack
- **Framework**: Expo (v54), React Native, Expo Router
- **Web Runtime**: React Native Web with Metro bundler
- **Icons**: Lucide React Native / Lucide Icons
- **Backend / Database**: Supabase (`sahayakbis_sources`)
- **Language**: TypeScript

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- npm / yarn

### 2. Installation
```bash
npm install
```

### 3. Run Dev Server
```bash
# Start the Expo web application
npx expo start --web
```
Open [http://localhost:8081](http://localhost:8081) in your browser.

---

## 📱 Supported Platforms
- Web (Chrome, Edge, Firefox, Safari)
- Android / iOS (via Expo Go / React Native)

---

## 📄 License
Prototype developed for Smart India Hackathon (SIH 2026).
