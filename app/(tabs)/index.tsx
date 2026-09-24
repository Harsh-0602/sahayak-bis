import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowUp,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileSearch,
  FileText,
  Globe2,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
  BadgeCheck,
  BookOpen,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

// ─── Design Tokens (design.md palette) ───────────────────────────────────────
const C = {
  primary: '#0070C0',
  primaryDark: '#005B96',
  primaryLight: '#EAF5FC',
  purple: '#7650B8',
  green: '#43A982',
  amber: '#E3A62F',
  amberDark: '#9D6E00',
  text: '#111111',
  muted: '#555555',
  border: '#B7D3EA',
  bg: '#FFFFFF',
  bgSoft: '#F5F8FC',
  navy: '#0C2D50',
  navyDark: '#091F38',
  navyLight: '#173E67',
  gold: '#C99A17',
  teal: '#2C8D93',
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Language = 'English' | 'Hindi';
type Intent = 'find' | 'requirement' | 'roadmap' | 'verify' | null;

export type EvidenceDetail = {
  isNumber: string;
  title: string;
  titleHi: string;
  scheme: string;
  schemeHi: string;
  schemeType: 'CRS' | 'Hallmarking' | 'Voluntary';
  authority: string;
  year: string;
  scopeSummary: string;
  scopeSummaryHi: string;
  keyRequirements: string[];
  keyRequirementsHi: string[];
  sourceUrl: string;
  sourceTitle: string;
  verifiedDate: string;
};

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  // Structured answer parts (Phase 1: Answer → Evidence → Next Step)
  answerText?: string;
  evidenceTitle?: string;
  evidenceIsNumber?: string;
  evidenceUrl?: string;
  evidenceDetail?: EvidenceDetail;
  nextStep?: string;
  nextStepUrl?: string;
  followUps?: string[];
  followUpsHi?: string[];
  // Legacy citation (preserved for compatibility)
  citation?: string;
  sourceUrl?: string;
  roadmap?: boolean;
  abstention?: boolean; // marks safe-abstention responses
  hinglish?: boolean;
};

type Source = { title: string; url: string; citation: string; summary: string };

type RoadmapStep = {
  number: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  duration: string;
  evidenceNote?: string;
  evidenceNoteHi?: string;
};

// ─── Loading States (design.md §Loading) ─────────────────────────────────────
const LOADING_STAGES = {
  English: [
    'Understanding your query…',
    'Finding relevant BIS evidence…',
    'Checking source status…',
    'Preparing grounded answer…',
  ],
  Hindi: [
    'आपका प्रश्न समझ रहे हैं…',
    'BIS प्रमाण खोज रहे हैं…',
    'स्रोत की स्थिति जाँच रहे हैं…',
    'सत्यापित उत्तर तैयार हो रहा है…',
  ],
};

// ─── Intent Buttons (design.md §Main Screen) ─────────────────────────────────
type IntentDef = { id: Intent; label: string; labelHi: string; icon: any; query: string; queryHi: string };
const INTENTS: IntentDef[] = [
  {
    id: 'find',
    label: 'Find Standard',
    labelHi: 'मानक खोजें',
    icon: FileSearch,
    query: 'Which BIS standard applies to LED bulbs?',
    queryHi: 'LED बल्ब के लिए कौन सा BIS मानक लागू होता है?',
  },
  {
    id: 'requirement',
    label: 'BIS Requirement',
    labelHi: 'BIS आवश्यकता',
    icon: ShieldCheck,
    query: 'What is the BIS certification requirement for LED lamps?',
    queryHi: 'LED लैंप के लिए BIS प्रमाणन आवश्यकता क्या है?',
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    labelHi: 'रोडमैप',
    icon: Sparkles,
    query: 'LED bulb BIS certification roadmap',
    queryHi: 'LED बल्ब BIS प्रमाणन रोडमैप',
  },
  {
    id: 'verify',
    label: 'Verify / Understand',
    labelHi: 'सत्यापित करें',
    icon: BadgeCheck,
    query: 'How do I verify gold hallmarking & HUID?',
    queryHi: 'सोने की हॉलमार्किंग और HUID कैसे जाँचें?',
  },
];

// ─── Suggested Prompts (Golden SIH Demo Queries) ─────────────────────────────
const prompts = {
  English: [
    'Which BIS standard applies to LED bulbs?',
    'What is the BIS certification requirement for LED lamps?',
    'LED bulb BIS certification roadmap',
    'How do I verify gold hallmarking & HUID?',
    'What are the silver hallmarking standards (IS 2112)?',
    'What is the stock price of Apple?',
  ],
  Hindi: [
    'LED बल्ब के लिए कौन सा BIS मानक लागू होता है?',
    'LED लैंप के लिए BIS प्रमाणन आवश्यकता क्या है?',
    'LED बल्ब BIS प्रमाणन रोडमैप',
    'सोने की हॉलमार्किंग और HUID कैसे जाँचें?',
    'चाँदी की हॉलमार्किंग मानक (IS 2112)',
    'आज का मौसम कैसा रहेगा?',
  ],
};

// ─── Official BIS Sources ─────────────────────────────────────────────────────
const HALLMARKING_FAQ_URL = 'https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq/?lang=en';
const BIS_PORTAL_URL = 'https://www.bis.gov.in/';
const BIS_CARE_URL = 'https://www.bis.gov.in/product-certification/online-information/';

const localSources: Source[] = [
  {
    title: 'Indian Standards on LED',
    url: 'https://bis.gov.in/other/LEDSeries.pdf',
    citation: 'BIS LED Series · IS 16102',
    summary: 'Official list covering LED lamps, modules, control gear, measurements and luminaires.',
  },
  {
    title: 'Gold & Silver Hallmarking FAQs & Standards',
    url: HALLMARKING_FAQ_URL,
    citation: 'BIS Gold & Silver · HUID',
    summary: 'Confirms the three-part hallmark: BIS logo, purity/fineness grades (IS 1417 & IS 2112) and six-digit HUID.',
  },
  {
    title: 'Consumer Protection & HUID Verification',
    url: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en',
    citation: 'BIS Consumer Protection',
    summary: 'Consumer guidance on using the BIS CARE mobile app to verify hallmarking before buying.',
  },
];

// ─── Evidence Database (IS-number metadata & evidence details) ───────────────
export const EVIDENCE_DATABASE: Record<string, EvidenceDetail> = {
  'IS 16102': {
    isNumber: 'IS 16102 (Part 1 & 2):2012',
    title: 'Self-Ballasted LED Lamps for General Lighting Services',
    titleHi: 'सामान्य प्रकाश व्यवस्था के लिए सेल्फ-बैलेस्टेड LED लैंप',
    scheme: 'Compulsory Registration Scheme (CRS)',
    schemeHi: 'अनिवार्य पंजीकरण योजना (CRS)',
    schemeType: 'CRS',
    authority: 'Bureau of Indian Standards · Electrotechnical Division',
    year: '2012 (with amendments)',
    scopeSummary: 'Prescribes safety requirements (Part 1: insulation resistance, electrical safety, mechanical endurance, thermal protection) and performance requirements (Part 2: wattage, luminous flux, colour temperature, life test).',
    scopeSummaryHi: 'सुरक्षा आवश्यकताएँ (Part 1: इन्सुलेशन प्रतिरोध, विद्युत सुरक्षा, यांत्रिक स्थायित्व, तापीय सुरक्षा) और प्रदर्शन आवश्यकताएँ (Part 2: वाट क्षमता, ल्यूमेन आउटपुट, रंग तापमान, जीवनकाल) निर्धारित करता है।',
    keyRequirements: [
      'Testing at a BIS-recognized laboratory as per IS 16102 (Part 1) and (Part 2)',
      'Manufacturing unit registration under BIS Compulsory Registration Scheme (CRS)',
      'Standard CRS mark with unique Registration number (R-number) on product packaging',
      'Mandatory compliance under Electronics & IT Goods (Compulsory Registration) Order',
    ],
    keyRequirementsHi: [
      'BIS से मान्यता प्राप्त प्रयोगशाला में IS 16102 (Part 1) और (Part 2) के तहत जाँच',
      'BIS अनिवार्य पंजीकरण योजना (CRS) के तहत निर्माण इकाई का पंजीकरण',
      'उत्पाद पैकेजिंग पर अद्वितीय पंजीकरण संख्या (R-number) के साथ मानक CRS मार्क',
      'इलेक्ट्रॉनिक्स व आईटी सामान अनिवार्य पंजीकरण आदेश के तहत अनिवार्य अनुपालन',
    ],
    sourceUrl: 'https://bis.gov.in/other/LEDSeries.pdf',
    sourceTitle: 'BIS LED Series Official Standards Directory',
    verifiedDate: 'Active Gazette Reference · Bureau of Indian Standards',
  },
  'IS 1417': {
    isNumber: 'IS 1417:2016',
    title: 'Gold and Gold Alloys, Jewellery/Artefacts — Fineness and Marking',
    titleHi: 'स्वर्ण और स्वर्ण मिश्र धातु, आभूषण/कलाकृतियाँ — शुद्धता और अंकन',
    scheme: 'Mandatory Hallmarking (Quality Control Order)',
    schemeHi: 'अनिवार्य हॉलमार्किंग (गुणवत्ता नियंत्रण आदेश)',
    schemeType: 'Hallmarking',
    authority: 'Bureau of Indian Standards · Hallmarking Department',
    year: '2016 (3-Mark HUID Regime)',
    scopeSummary: 'Specifies 6 standard purity/fineness grades (24K999, 23K958, 22K916, 20K833, 18K750, 14K585). Mandates three marks: 1) BIS Logo, 2) Karat & fineness grade, and 3) 6-digit laser-engraved alphanumeric HUID.',
    scopeSummaryHi: '6 मानक शुद्धता ग्रेड (24K999, 23K958, 22K916, 20K833, 18K750, 14K585) निर्दिष्ट करता है। तीन चिह्न अनिवार्य हैं: 1) BIS लोगो, 2) कैरेट व फाइननेस, और 3) 6 अंकों का लेज़र HUID कोड।',
    keyRequirements: [
      'Mandatory hallmarking in notified districts under Hallmarking QCO',
      'Three-mark regime: BIS logo + Purity grade (e.g. 22K916) + 6-digit alphanumeric HUID',
      'Assaying and laser engraving conducted exclusively at BIS-recognized AHCs',
      'Consumer verification available in BIS CARE App via "Verify HUID"',
    ],
    keyRequirementsHi: [
      'हॉलमार्किंग QCO के तहत अधिसूचित जिलों में अनिवार्य हॉलमार्किंग',
      'तीन चिह्नों की व्यवस्था: BIS लोगो + शुद्धता ग्रेड (22K916) + 6 अंकों का HUID',
      'केवल BIS मान्यता प्राप्त AHC केंद्रों पर परीक्षण व लेज़र अंकन',
      'BIS CARE ऐप में "Verify HUID" से तुरंत उपभोक्ता सत्यापन',
    ],
    sourceUrl: HALLMARKING_FAQ_URL,
    sourceTitle: 'BIS Hallmarking FAQs & Regulations',
    verifiedDate: 'Active Gazette Reference · Bureau of Indian Standards',
  },
  'IS 2112': {
    isNumber: 'IS 2112:2014',
    title: 'Silver and Silver Alloys, Jewellery/Artefacts — Fineness and Marking',
    titleHi: 'रजत (चाँदी) और रजत मिश्र धातु, आभूषण/कलाकृतियाँ — शुद्धता और अंकन',
    scheme: 'Voluntary Hallmarking Scheme',
    schemeHi: 'स्वैच्छिक हॉलमार्किंग योजना',
    schemeType: 'Voluntary',
    authority: 'Bureau of Indian Standards · Hallmarking Department',
    year: '2014',
    scopeSummary: 'Governs purity and hallmarking of silver jewellery across 6 recognized grades (999, 970, 925 Sterling Silver, 900, 835, 800). Hallmarked silver carries BIS logo, purity grade, and 6-digit HUID code.',
    scopeSummaryHi: '6 मान्यता प्राप्त ग्रेडों (999, 970, 925 स्टर्लिंग सिल्वर, 900, 835, 800) में चाँदी के आभूषणों की शुद्धता व अंकन को नियंत्रित करता है। हॉलमार्क वाली वस्तुओं पर BIS लोगो, ग्रेड और 6 अंकों का HUID कोड होता है।',
    keyRequirements: [
      'Voluntary scheme for jewellers and manufacturers under BIS Hallmarking Scheme',
      'Compliant articles receive BIS logo, purity fineness number, and 6-digit HUID',
      'Protects consumers against silver adulteration and substandard alloy compositions',
      'Verification via BIS CARE App and registered Assaying & Hallmarking Centres',
    ],
    keyRequirementsHi: [
      'BIS हॉलमार्किंग के तहत जौहरियों और निर्माताओं के लिए स्वैच्छिक योजना',
      'अनुपालन करने वाली वस्तुओं को BIS लोगो, शुद्धता संख्या और 6-अंकीय HUID मिलता है',
      'उपभोक्ताओं को चाँदी में मिलावट और घटिया मिश्र धातु से सुरक्षा प्रदान करता है',
      'BIS CARE ऐप और पंजीकृत परख केंद्रों (AHC) के माध्यम से सत्यापन',
    ],
    sourceUrl: HALLMARKING_FAQ_URL,
    sourceTitle: 'BIS Silver Hallmarking Standards Directory',
    verifiedDate: 'Active Gazette Reference · Bureau of Indian Standards',
  },
};

// ─── Roadmap Steps (LED / IS 16102) ──────────────────────────────────────────
const roadmapSteps: RoadmapStep[] = [
  {
    number: '01',
    title: 'Identify Applicable Standard',
    titleHi: 'लागू मानक पहचानें',
    description: 'Confirm that IS 16102 (Part 1 – Safety; Part 2 – Performance) applies to your LED lamp product.',
    descriptionHi: 'पुष्टि करें कि IS 16102 (Part 1 – सुरक्षा; Part 2 – प्रदर्शन) आपके LED लैंप उत्पाद पर लागू होता है।',
    duration: '—',
    evidenceNote: 'BIS LED Series · IS 16102',
    evidenceNoteHi: 'BIS LED सीरीज़ · IS 16102',
  },
  {
    number: '02',
    title: 'Check Scheme / Regulatory Status',
    titleHi: 'योजना / विनियामक स्थिति जाँचें',
    description: 'LED lamps fall under the Compulsory Registration Scheme (CRS). Confirm applicability for your specific product scope via the BIS portal.',
    descriptionHi: 'LED लैंप Compulsory Registration Scheme (CRS) के अंतर्गत आते हैं। BIS पोर्टल पर अपने उत्पाद की स्कोप की पुष्टि करें।',
    duration: '—',
    evidenceNote: 'BIS Product Certification Portal',
    evidenceNoteHi: 'BIS उत्पाद प्रमाणन पोर्टल',
  },
  {
    number: '03',
    title: 'Product Testing at BIS Laboratory',
    titleHi: 'BIS प्रयोगशाला में उत्पाद परीक्षण',
    description: 'Test at a BIS-recognised laboratory as per IS 16102 (Part 1) for safety and IS 16102 (Part 2) for performance.',
    descriptionHi: 'BIS से मान्यता प्राप्त प्रयोगशाला में IS 16102 (Part 1) सुरक्षा और IS 16102 (Part 2) प्रदर्शन के अनुसार जाँच करें।',
    duration: '10–15 working days*',
    evidenceNote: 'IS 16102 (Part 1):2012 & (Part 2):2012 · * Indicative only; confirm with your lab',
    evidenceNoteHi: 'IS 16102 (Part 1):2012 & (Part 2):2012 · * अनुमानित; अपनी प्रयोगशाला से पुष्टि करें',
  },
  {
    number: '04',
    title: 'Prepare Required Documents',
    titleHi: 'आवश्यक दस्तावेज़ तैयार करें',
    description: 'Prepare product details, test reports, and manufacturer documents as required by the BIS CRS application.',
    descriptionHi: 'BIS CRS आवेदन के अनुसार उत्पाद विवरण, परीक्षण रिपोर्ट और निर्माता दस्तावेज़ तैयार करें।',
    duration: '3–5 working days*',
    evidenceNote: '* Indicative only; document requirements confirmed via BIS portal',
    evidenceNoteHi: '* अनुमानित; दस्तावेज़ आवश्यकताएँ BIS पोर्टल से पुष्टि करें',
  },
  {
    number: '05',
    title: 'Continue via Official BIS Service',
    titleHi: 'आधिकारिक BIS सेवा से आगे बढ़ें',
    description: 'Submit your application and complete registration on the official BIS portal. SahayakBIS is a guidance tool — all official steps must be completed directly with BIS.',
    descriptionHi: 'आधिकारिक BIS पोर्टल पर आवेदन जमा करें और पंजीकरण पूर्ण करें। SahayakBIS एक मार्गदर्शन उपकरण है — सभी आधिकारिक चरण BIS के साथ सीधे पूरे करने होंगे।',
    duration: '—',
    evidenceNote: 'BIS Product Certification Online Portal',
    evidenceNoteHi: 'BIS उत्पाद प्रमाणन ऑनलाइन पोर्टल',
  },
];

// ─── Greeting Messages ────────────────────────────────────────────────────────
function getSampleMessages(language: Language): ChatMessage[] {
  return language === 'Hindi'
    ? [
      {
        id: 1,
        role: 'assistant',
        text: 'नमस्ते! मैं SahayakBIS हूँ।',
        answerText: 'नमस्ते! मैं SahayakBIS हूँ — BIS मानकों के लिए एक साक्ष्य-आधारित मार्गदर्शन सहायक।',
        nextStep: 'LED बल्ब (IS 16102) या सोने/चाँदी की हॉलमार्किंग (IS 1417, IS 2112) के बारे में पूछें।',
        followUpsHi: [
          'LED बल्ब के लिए कौन सा BIS मानक लागू होता है?',
          'सोने की हॉलमार्किंग और HUID कैसे जाँचें?',
          'चाँदी की हॉलमार्किंग मानक (IS 2112)',
        ],
      },
    ]
    : [
      {
        id: 1,
        role: 'assistant',
        text: 'Hello! I am SahayakBIS.',
        answerText: 'Hello! I am SahayakBIS — an evidence-grounded guidance assistant for Indian Standards and BIS services.',
        nextStep: 'Ask about LED bulbs (IS 16102) or Gold/Silver hallmarking (IS 1417, IS 2112). Use the intent buttons below or type your question.',
        followUps: [
          'Which BIS standard applies to LED bulbs?',
          'How do I verify gold hallmarking & HUID?',
          'What are the silver hallmarking standards (IS 2112)?',
        ],
      },
    ];
}

// ─── Language Detection (preserved exactly) ──────────────────────────────────
function classifyQueryLanguage(text: string): 'Hindi' | 'English' | 'Hinglish' {
  if (/[\u0900-\u097F]/.test(text)) return 'Hindi';

  const lower = text.toLowerCase();
  const words = lower.split(/[^a-zA-Z0-9]+/).filter(Boolean);

  const strongHinglishWords = new Set([
    'muje', 'mujhe', 'hum', 'hume', 'humko', 'ham', 'mera', 'meri', 'mere', 'apna', 'apni', 'apne',
    'karna', 'kare', 'karen', 'karo', 'karta', 'karti', 'karte', 'karne', 'karwaya', 'karwaye',
    'konse', 'kaunsa', 'kaunse', 'kaunsi', 'konsi', 'kon', 'kaun', 'kisko', 'kiske',
    'kya', 'kyu', 'kyun', 'kaise', 'kese', 'kis', 'kisi',
    'hai', 'hain', 'hoga', 'hogi', 'hoge', 'hoti', 'hota', 'hote', 'hu', 'hoon',
    'toh', 'bhi', 'aur', 'batao', 'bataye', 'batayein', 'bataiye', 'boliye', 'bolo',
    'chahiye', 'chahie', 'chahta', 'chahti',
    'nhi', 'nahi', 'mat', 'tha', 'thi', 'the',
    'kitna', 'kitne', 'kitni', 'kaha', 'kahan',
    'zaroorat', 'zarurat', 'zaruri', 'zaroori',
    'kharidna', 'khareedna', 'bechna', 'shuru', 'chandi', 'chaandi', 'sona', 'sone',
    'wali', 'wala', 'wale', 'baare', 'bare', 'liye', 'kholna',
  ]);

  const contextualHinglishWords = new Set(['ka', 'ki', 'ke', 'ko', 'se', 'par', 'pe', 'mein', 'h']);

  let strongCount = 0;
  let contextualCount = 0;
  for (const w of words) {
    if (strongHinglishWords.has(w)) strongCount++;
    if (contextualHinglishWords.has(w)) contextualCount++;
  }

  if (strongCount >= 1 || contextualCount >= 2) return 'Hinglish';
  return 'English';
}

// ─── Answer Engine (logic preserved; structured fields added) ─────────────────
function getAnswer(question: string, currentLang: Language): ChatMessage {
  const queryLang = classifyQueryLanguage(question);

  // Hinglish rejection (preserved)
  if (queryLang === 'Hinglish') {
    if (currentLang === 'Hindi') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'हिंग्लिश समर्थित नहीं है।',
        answerText: 'हिंग्लिश (Hinglish) समर्थित नहीं है।',
        nextStep: 'SahayakBIS केवल शुद्ध अंग्रेज़ी (English) या हिन्दी (देवनागरी) में प्रश्नों का उत्तर देता है। कृपया अपना प्रश्न शुद्ध अंग्रेज़ी या हिन्दी में पूछें।',
        citation: 'असमर्थित भाषा · केवल English या हिन्दी',
        hinglish: true,
      };
    }
    return {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'Hinglish is not supported.',
      answerText: 'Hinglish is not supported.',
      nextStep: 'SahayakBIS only provides responses in standard English or Hindi (हिन्दी). Please ask your question in English or Hindi (Devanagari script).',
      citation: 'Unsupported language · English or Hindi only',
      hinglish: true,
    };
  }

  const answerLang: Language = queryLang === 'Hindi' ? 'Hindi' : 'English';
  const normalized = question.toLowerCase();

  // Topic detection (preserved exactly)
  const isLed =
    normalized.includes('led') ||
    normalized.includes('bulb') ||
    normalized.includes('lamp') ||
    normalized.includes('16102') ||
    question.includes('बल्ब') ||
    question.includes('एलईडी') ||
    question.includes('लैंप');

  const isGold =
    normalized.includes('gold') ||
    normalized.includes('22k') ||
    normalized.includes('24k') ||
    normalized.includes('18k') ||
    normalized.includes('14k') ||
    normalized.includes('karat') ||
    normalized.includes('carat') ||
    question.includes('सोना') ||
    question.includes('सोने') ||
    question.includes('स्वर्ण');

  const isSilver =
    normalized.includes('silver') ||
    normalized.includes('2112') ||
    normalized.includes('sterling') ||
    question.includes('चाँदी') ||
    question.includes('चांदी') ||
    question.includes('रजत');

  const isHallmarking =
    normalized.includes('hallmark') ||
    normalized.includes('huid') ||
    question.includes('हॉलमार्क') ||
    question.includes('हॉलमार्किंग');

  // 1. Combined hallmarking / general hallmarking
  if ((isGold && isSilver) || (isHallmarking && !isLed && !isGold && !isSilver)) {
    if (answerLang === 'Hindi') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'BIS हॉलमार्किंग सोने और चाँदी की शुद्धता प्रमाणित करती है।',
        answerText: 'BIS हॉलमार्किंग सोने (IS 1417) और चाँदी (IS 2112) के आभूषणों व कलाकृतियों की शुद्धता प्रमाणित करती है। असली हॉलमार्क में तीन प्रमुख चिह्न होते हैं: 1) BIS लोगो, 2) शुद्धता/फाइननेस ग्रेड (जैसे सोने के लिए 22K916 और चाँदी के लिए 925 स्टर्लिंग), और 3) 6 अंकों का अल्फ़ान्यूमेरिक HUID कोड।',
        evidenceTitle: 'BIS हॉलमार्किंग FAQs व मानक',
        evidenceIsNumber: 'IS 1417 (Gold) · IS 2112 (Silver)',
        evidenceUrl: HALLMARKING_FAQ_URL,
        evidenceDetail: EVIDENCE_DATABASE['IS 1417'],
        nextStep: 'BIS CARE मोबाइल ऐप में "Verify HUID" फीचर से आभूषण की प्रामाणिकता तुरंत जाँचें।',
        nextStepUrl: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en',
        followUpsHi: [
          'सोने की हॉलमार्किंग और HUID कैसे जाँचें?',
          'चाँदी की हॉलमार्किंग मानक (IS 2112)',
          'BIS CARE ऐप में हॉलमार्क कैसे सत्यापित करें?',
        ],
        citation: 'BIS हॉलमार्किंग · HUID',
        sourceUrl: HALLMARKING_FAQ_URL,
      };
    }
    return {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'BIS Hallmarking certifies purity of Gold and Silver jewellery.',
      answerText: 'BIS Hallmarking certifies the purity and fineness of Gold (IS 1417) and Silver (IS 2112) jewellery and artefacts. A genuine hallmark consists of three marks: 1) BIS Logo, 2) Purity & Fineness grade (e.g., 22K916 for gold, 925 for silver), and 3) a unique 6-digit alphanumeric HUID code.',
      evidenceTitle: 'BIS Hallmarking FAQs & Standards',
      evidenceIsNumber: 'IS 1417 (Gold) · IS 2112 (Silver)',
      evidenceUrl: HALLMARKING_FAQ_URL,
      evidenceDetail: EVIDENCE_DATABASE['IS 1417'],
      nextStep: 'Verify hallmarked items using the "Verify HUID" feature in the official BIS CARE mobile app.',
      nextStepUrl: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en',
      followUps: [
        'How do I verify gold hallmarking & HUID?',
        'What are the silver hallmarking standards (IS 2112)?',
        'How does 6-digit HUID verification work?',
      ],
      citation: 'BIS Hallmarking Overview · HUID',
      sourceUrl: HALLMARKING_FAQ_URL,
    };
  }

  // 2. Gold
  if (isGold) {
    if (answerLang === 'Hindi') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'असली हॉलमार्क वाले सोने पर तीन अनिवार्य चिह्न होते हैं।',
        answerText: 'असली हॉलमार्क वाले सोने के आभूषण पर तीन अनिवार्य चिह्न होते हैं: BIS लोगो, शुद्धता या फाइननेस (जैसे 24K999, 22K916, 18K750, 14K585) और छह अंकों वाला अल्फ़ान्यूमेरिक HUID।',
        evidenceTitle: 'BIS स्वर्ण हॉलमार्किंग FAQs व मानक',
        evidenceIsNumber: 'IS 1417 (Gold & Gold Alloys)',
        evidenceUrl: HALLMARKING_FAQ_URL,
        evidenceDetail: EVIDENCE_DATABASE['IS 1417'],
        nextStep: 'खरीदने से पहले HUID की जाँच BIS CARE ऐप से करें। शुद्धता की जाँच के लिए BIS से मान्यता प्राप्त Assaying & Hallmarking Centre (AHC) से संपर्क करें।',
        nextStepUrl: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en',
        followUpsHi: [
          '6-अंकीय HUID कोड कैसे काम करता है?',
          'सोने के शुद्धता ग्रेड (22K बनाम 24K) क्या हैं?',
          'मान्यता प्राप्त AHC परख केंद्र कहाँ खोजें?',
        ],
        citation: 'BIS स्वर्ण हॉलमार्किंग · HUID',
        sourceUrl: HALLMARKING_FAQ_URL,
      };
    }
    return {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'A genuine hallmarked gold article carries three mandatory marks.',
      answerText: 'A genuine hallmarked gold article carries three mandatory marks: the BIS logo, purity or fineness grade (such as 24K999, 22K916, 18K750, 14K585), and a six-digit alphanumeric HUID. You can use the BIS CARE app to verify the HUID and jeweller details before buying.',
      evidenceTitle: 'BIS Gold Hallmarking FAQs',
      evidenceIsNumber: 'IS 1417 (Gold & Gold Alloys)',
      evidenceUrl: HALLMARKING_FAQ_URL,
      evidenceDetail: EVIDENCE_DATABASE['IS 1417'],
      nextStep: 'Purity testing can also be performed at any BIS-recognised Assaying & Hallmarking Centre (AHC). Use the BIS CARE app to verify HUID.',
      nextStepUrl: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en',
      followUps: [
        'How does 6-digit HUID verification work?',
        'What are the gold fineness grades (22K vs 24K)?',
        'Where can I find a BIS-recognised AHC?',
      ],
      citation: 'BIS Gold Hallmarking · HUID',
      sourceUrl: HALLMARKING_FAQ_URL,
    };
  }

  // 3. Silver
  if (isSilver) {
    if (answerLang === 'Hindi') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'भारत में चाँदी की हॉलमार्किंग IS 2112 के तहत होती है।',
        answerText: 'भारत में चाँदी के आभूषणों और कलाकृतियों की हॉलमार्किंग भारतीय मानक IS 2112 (Silver and Silver Alloys) के तहत की जाती है। BIS योजना के तहत चाँदी की हॉलमार्किंग स्वैच्छिक (Voluntary) है। हॉलमार्क वाली चाँदी पर तीन चिह्न होते हैं: BIS लोगो, शुद्धता/फाइननेस ग्रेड (जैसे 999, 970, 925 स्टर्लिंग सिल्वर, 900, 835, 800) और 6 अंकों का अल्फ़ान्यूमेरिक HUID कोड, जो शुद्धता का आधिकारिक तृतीय-पक्ष आश्वासन प्रदान करता है।',
        evidenceTitle: 'BIS रजत (चाँदी) हॉलमार्किंग FAQs व मानक',
        evidenceIsNumber: 'IS 2112 (Silver & Silver Alloys)',
        evidenceUrl: HALLMARKING_FAQ_URL,
        evidenceDetail: EVIDENCE_DATABASE['IS 2112'],
        nextStep: 'HUID की जाँच BIS CARE ऐप से करें। यह उपभोक्ताओं को शुद्धता और प्रामाणिकता का आधिकारिक सत्यापन प्रदान करता है।',
        nextStepUrl: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en',
        followUpsHi: [
          '925 स्टर्लिंग चाँदी की शुद्धता क्या है?',
          'क्या चाँदी की हॉलमार्किंग अनिवार्य है या स्वैच्छिक?',
          'BIS CARE ऐप में चाँदी का हॉलमार्क कैसे जाँचें?',
        ],
        citation: 'BIS रजत (चाँदी) · IS 2112',
        sourceUrl: HALLMARKING_FAQ_URL,
      };
    }
    return {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'Silver hallmarking in India is governed by IS 2112.',
      answerText: 'Silver hallmarking in India is governed by Indian Standard IS 2112 (Silver and Silver Alloys, Jewellery/Artefacts). Under the BIS Hallmarking Scheme, silver hallmarking is voluntary. Hallmarked silver carries three marks: the BIS logo, purity/fineness grade (such as 999, 970, 925 for Sterling Silver, 900, 835, 800), and a six-digit alphanumeric HUID. This provides third-party assurance of purity and authenticity.',
      evidenceTitle: 'BIS Silver Hallmarking FAQs',
      evidenceIsNumber: 'IS 2112 (Silver & Silver Alloys)',
      evidenceUrl: HALLMARKING_FAQ_URL,
      evidenceDetail: EVIDENCE_DATABASE['IS 2112'],
      nextStep: 'Verify silver HUID using the BIS CARE mobile app before purchasing.',
      nextStepUrl: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en',
      followUps: [
        'What is 925 sterling silver purity?',
        'Is silver hallmarking mandatory or voluntary?',
        'How to verify silver hallmarking in BIS CARE?',
      ],
      citation: 'BIS Silver Hallmarking · IS 2112',
      sourceUrl: HALLMARKING_FAQ_URL,
    };
  }

  // 4. LED
  if (isLed) {
    const isRoadmapQuery = normalized.includes('roadmap') || question.includes('रोडमैप');
    const isRequirementQuery =
      normalized.includes('require') ||
      normalized.includes('mandatory') ||
      question.includes('आवश्य') ||
      normalized.includes('rule');

    if (answerLang === 'Hindi') {
      let hiAnswer = 'सामान्य प्रकाश व्यवस्था के लिए सेल्फ-बैलेस्टेड LED लैंप को Compulsory Registration Scheme (CRS) के अंतर्गत BIS पंजीकरण की आवश्यकता होती है। सुरक्षा के लिए IS 16102 (Part 1):2012 और प्रदर्शन के लिए IS 16102 (Part 2):2012 लागू होता है।';
      if (isRoadmapQuery) {
        hiAnswer = 'सामान्य प्रकाश व्यवस्था के लिए सेल्फ-बैलेस्टेड LED लैंप का BIS CRS प्रमाणन 5-चरणीय रोडमैप का पालन करता है: मानक पहचान (IS 16102), CRS योजना सत्यापन, BIS प्रयोगशाला परीक्षण (सुरक्षा Part 1 व प्रदर्शन Part 2), दस्तावेज़ तैयारी, और ऑनलाइन पंजीकरण। पूरा रोडमैप देखने के लिए नीचे का बटन दबाएँ।';
      } else if (isRequirementQuery) {
        hiAnswer = 'सेल्फ-बैलेस्टेड LED लैंप के लिए Compulsory Registration Scheme (CRS) के तहत अनिवार्य BIS आवश्यकता है। निर्माताओं को IS 16102 (Part 1):2012 के तहत विद्युत सुरक्षा और IS 16102 (Part 2):2012 के तहत प्रदर्शन के लिए BIS मान्यता प्राप्त लैब में परीक्षण कराकर BIS CRS पोर्टल पर पंजीकरण कराना अनिवार्य है।';
      }

      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'सेल्फ-बैलेस्टेड LED लैंप को CRS के अंतर्गत BIS पंजीकरण की आवश्यकता होती है।',
        answerText: hiAnswer,
        evidenceTitle: 'BIS LED सीरीज़ — आधिकारिक मानक सूची',
        evidenceIsNumber: 'IS 16102 (Part 1):2012 · IS 16102 (Part 2):2012',
        evidenceUrl: 'https://bis.gov.in/other/LEDSeries.pdf',
        evidenceDetail: EVIDENCE_DATABASE['IS 16102'],
        nextStep: 'पंजीकरण से पहले उत्पाद की जाँच BIS से मान्यता प्राप्त प्रयोगशाला में की जाती है। प्रमाणन रोडमैप देखने के लिए नीचे का बटन दबाएँ।',
        nextStepUrl: BIS_CARE_URL,
        followUpsHi: [
          'IS 16102 के तहत क्या प्रयोगशाला परीक्षण आवश्यक हैं?',
          'LED लैंप BIS प्रमाणन रोडमैप देखें',
          'CRS पंजीकरण के लिए आवश्यक दस्तावेज़ क्या हैं?',
        ],
        citation: 'BIS LED सीरीज़ · IS 16102',
        sourceUrl: 'https://bis.gov.in/other/LEDSeries.pdf',
        roadmap: true,
      };
    }

    let enAnswer = 'Self-ballasted LED lamps for general lighting require BIS registration under the Compulsory Registration Scheme (CRS). The key safety standard is IS 16102 (Part 1):2012; performance requirements are covered by IS 16102 (Part 2):2012. The product is tested at a BIS-recognised laboratory before registration on the BIS CRS portal.';
    if (isRoadmapQuery) {
      enAnswer = 'The BIS certification journey for self-ballasted LED lamps under the Compulsory Registration Scheme (CRS) follows a structured 5-stage roadmap: Standard Identification (IS 16102), CRS Scheme check, Laboratory testing (IS 16102 Part 1 for safety & Part 2 for performance), Documentation, and Portal Registration. Click "View Certification Roadmap" below to explore each milestone.';
    } else if (isRequirementQuery) {
      enAnswer = 'Self-ballasted LED lamps for general lighting have mandatory BIS certification requirements under the Compulsory Registration Scheme (CRS). Manufacturers must test lamps at a BIS-recognized laboratory for electrical safety under IS 16102 (Part 1):2012 and performance parameters (wattage, lumen maintenance) under IS 16102 (Part 2):2012, followed by registration on the BIS CRS portal to obtain a valid R-number.';
    }

    return {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'Self-ballasted LED lamps require BIS registration under CRS.',
      answerText: enAnswer,
      evidenceTitle: 'BIS LED Series — Official Standards List',
      evidenceIsNumber: 'IS 16102 (Part 1):2012 · IS 16102 (Part 2):2012',
      evidenceUrl: 'https://bis.gov.in/other/LEDSeries.pdf',
      evidenceDetail: EVIDENCE_DATABASE['IS 16102'],
      nextStep: 'View the step-by-step certification roadmap for LED lamps, or proceed to the official BIS CRS portal to start your application.',
      nextStepUrl: BIS_CARE_URL,
      followUps: [
        'What testing is required under IS 16102?',
        'LED bulb BIS certification roadmap',
        'What documents are needed for CRS registration?',
      ],
      citation: 'BIS LED Series · IS 16102',
      sourceUrl: 'https://bis.gov.in/other/LEDSeries.pdf',
      roadmap: true,
    };
  }

  // 5. Safe abstention (preserved, enhanced with action fields)
  if (answerLang === 'Hindi') {
    return {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'सत्यापित BIS स्रोत नहीं मिला।',
      answerText: 'इस प्रश्न के लिए पर्याप्त सत्यापित BIS साक्ष्य नहीं मिले।',
      nextStep: 'SahayakBIS केवल LED बल्ब (IS 16102), सोने की हॉलमार्किंग (IS 1417), और चाँदी की हॉलमार्किंग (IS 2112) की सत्यापित जानकारी प्रदान करता है। इन्हीं श्रेणियों के बारे में पूछें या आधिकारिक BIS स्रोत देखें।',
      nextStepUrl: BIS_PORTAL_URL,
      followUpsHi: [
        'LED बल्ब के लिए कौन सा BIS मानक लागू होता है?',
        'सोने की हॉलमार्किंग और HUID कैसे जाँचें?',
        'चाँदी की हॉलमार्किंग मानक (IS 2112)',
      ],
      citation: 'सत्यापित स्रोत नहीं मिला',
      abstention: true,
    };
  }
  return {
    id: Date.now() + 1,
    role: 'assistant',
    text: 'Verified BIS evidence not found for that question.',
    answerText: 'I could not find sufficient verified BIS evidence to answer that question definitively.',
    nextStep: 'SahayakBIS covers LED bulbs (IS 16102), Gold hallmarking (IS 1417), and Silver hallmarking (IS 2112). Try asking about one of these supported categories, or view the official BIS sources.',
    nextStepUrl: BIS_PORTAL_URL,
    followUps: [
      'Which BIS standard applies to LED bulbs?',
      'How do I verify gold hallmarking & HUID?',
      'What are the silver hallmarking standards (IS 2112)?',
    ],
    citation: 'Verified source not found',
    abstention: true,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ExploreScreen() {
  const [language, setLanguage] = useState<Language>('English');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => getSampleMessages('English'));
  const [roadmapVisible, setRoadmapVisible] = useState(false);
  const [evidenceDrawerVisible, setEvidenceDrawerVisible] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceDetail | null>(null);
  const [sources, setSources] = useState<Source[]>(localSources);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const loadingDotOpacity = useRef(new Animated.Value(1)).current;

  // Animate loading dot
  useEffect(() => {
    if (loading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(loadingDotOpacity, { toValue: 0.2, duration: 500, useNativeDriver: true }),
          Animated.timing(loadingDotOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [loading]);

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    if (messages.length <= 2) setMessages(getSampleMessages(nextLanguage));
  };

  const sendQuestion = (value: string = question) => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setLoadingStage(0);
    const userMessage: ChatMessage = { id: Date.now(), role: 'user', text: trimmed };
    setMessages((current) => [...current, userMessage]);
    setQuestion('');

    // Cycle through 4 loading stages
    const stages = [0, 1, 2, 3];
    const stageTimers = stages.map((stage, i) =>
      setTimeout(() => setLoadingStage(stage), i * 220)
    );

    setTimeout(() => {
      stageTimers.forEach(clearTimeout);
      const answer = getAnswer(trimmed, language);
      setMessages((current) => [...current, answer]);
      setLoading(false);
      setLoadingStage(0);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 950);
  };

  const loadSources = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('sahayakbis_sources').select('title,url,citation,summary').order('created_at');
    if (data && data.length > 0) setSources(data as Source[]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <ShieldCheck color="#E3A62F" size={19} strokeWidth={2.5} />
          </View>
          <View>
            <Text style={styles.brand}>
              Sahayak<Text style={styles.brandAccent}>BIS</Text>
            </Text>
            <Text style={styles.tagline}>Standards made simple</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Language toggle */}
          <View style={styles.languagePill}>
            <Pressable
              onPress={() => changeLanguage('English')}
              style={[styles.languageButton, language === 'English' && styles.languageActive]}
              accessibilityRole="button"
              accessibilityLabel="Switch to English"
            >
              <Text style={[styles.languageText, language === 'English' && styles.languageActiveText]}>EN</Text>
            </Pressable>
            <Pressable
              onPress={() => changeLanguage('Hindi')}
              style={[styles.languageButton, language === 'Hindi' && styles.languageActive]}
              accessibilityRole="button"
              accessibilityLabel="हिन्दी में बदलें"
            >
              <Text style={[styles.languageText, language === 'Hindi' && styles.languageActiveText]}>हि</Text>
            </Pressable>
          </View>

          {/* Official BIS link */}
          <Pressable
            onPress={() => Linking.openURL(BIS_PORTAL_URL)}
            style={styles.bisLink}
            accessibilityRole="link"
            accessibilityLabel="Open official BIS website"
          >
            <Globe2 color={C.primaryLight} size={13} />
            <Text style={styles.bisLinkText}>Official BIS</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Intent Buttons ── */}
      <View style={styles.intentBar}>
        {INTENTS.map((intent) => {
          const Icon = intent.icon;
          return (
            <Pressable
              key={intent.id}
              onPress={() => sendQuestion(language === 'Hindi' ? intent.queryHi : intent.query)}
              style={styles.intentButton}
              accessibilityRole="button"
              accessibilityLabel={language === 'Hindi' ? intent.labelHi : intent.label}
            >
              <Icon color={C.primary} size={13} strokeWidth={2} />
              <Text style={styles.intentLabel} numberOfLines={1}>
                {language === 'Hindi' ? intent.labelHi : intent.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Suggested chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promptRow}
      >
        {prompts[language].map((prompt) => (
          <Pressable
            key={prompt}
            onPress={() => sendQuestion(prompt)}
            style={styles.promptChip}
            accessibilityRole="button"
          >
            <Sparkles color={C.amberDark} size={13} />
            <Text style={styles.promptText}>{prompt}</Text>
            <ChevronRight color="#89919B" size={14} />
          </Pressable>
        ))}
      </ScrollView>

      {/* ── Message List ── */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.datePill}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>

        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.messageWrap, message.role === 'user' && styles.userWrap]}
          >
            {/* Avatar */}
            <View style={[styles.avatar, message.role === 'user' && styles.userAvatar]}>
              {message.role === 'assistant' ? (
                <Bot color="#FFFFFF" size={15} />
              ) : (
                <Text style={styles.userAvatarText}>You</Text>
              )}
            </View>

            {/* Message bubble — structured for assistant, plain for user */}
            {message.role === 'user' ? (
              <View style={[styles.bubble, styles.userBubble]}>
                <Text style={[styles.messageText, styles.userMessageText]}>{message.text}</Text>
              </View>
            ) : (
              <View style={styles.assistantCard}>
                {/* Hinglish / language warning */}
                {message.hinglish && (
                  <View style={styles.warningBanner}>
                    <Globe2 color={C.amberDark} size={14} />
                    <Text style={styles.warningText}>
                      {language === 'Hindi' ? 'असमर्थित भाषा' : 'Unsupported language'}
                    </Text>
                  </View>
                )}

                {/* Safe abstention header */}
                {message.abstention && (
                  <View style={styles.abstentionBanner}>
                    <ShieldCheck color={C.muted} size={14} />
                    <Text style={styles.abstentionBannerText}>
                      {language === 'Hindi' ? 'सत्यापित साक्ष्य अपर्याप्त' : 'Verified evidence not sufficient'}
                    </Text>
                  </View>
                )}

                {/* ── ANSWER section ── */}
                {message.answerText ? (
                  <>
                    <Text style={styles.sectionLabel}>
                      {language === 'Hindi' ? 'ANSWER' : 'ANSWER'}
                    </Text>
                    <Text style={styles.answerText}>{message.answerText}</Text>
                  </>
                ) : (
                  <Text style={styles.answerText}>{message.text}</Text>
                )}

                {/* ── EVIDENCE section (IS-number Evidence Card) ── */}
                {message.evidenceTitle && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.evidenceHeaderRow}>
                      <Text style={styles.sectionLabel}>EVIDENCE</Text>
                      {message.evidenceDetail && (
                        <View
                          style={[
                            styles.schemePill,
                            message.evidenceDetail.schemeType === 'CRS' && styles.schemePillCrs,
                            message.evidenceDetail.schemeType === 'Hallmarking' && styles.schemePillHallmark,
                            message.evidenceDetail.schemeType === 'Voluntary' && styles.schemePillVoluntary,
                          ]}
                        >
                          <Text
                            style={[
                              styles.schemePillText,
                              message.evidenceDetail.schemeType === 'CRS' && styles.schemeTextCrs,
                              message.evidenceDetail.schemeType === 'Hallmarking' && styles.schemeTextHallmark,
                              message.evidenceDetail.schemeType === 'Voluntary' && styles.schemeTextVoluntary,
                            ]}
                          >
                            {language === 'Hindi'
                              ? message.evidenceDetail.schemeHi
                              : message.evidenceDetail.scheme}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.evidenceCard}>
                      <View style={styles.evidenceCardTop}>
                        <View style={styles.evidenceIconWrap}>
                          <FileText color={C.primary} size={16} />
                        </View>
                        <View style={styles.evidenceCardText}>
                          <Text style={styles.evidenceIsNumber}>{message.evidenceIsNumber}</Text>
                          <Text style={styles.evidenceTitle}>{message.evidenceTitle}</Text>
                          <View style={styles.evidenceMetaRow}>
                            <ShieldCheck color={C.teal} size={11} />
                            <Text style={styles.evidenceMetaText}>
                              Bureau of Indian Standards · Verified Grounding
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Action buttons inside card */}
                      <View style={styles.evidenceActions}>
                        {message.evidenceDetail && (
                          <Pressable
                            onPress={() => {
                              setSelectedEvidence(message.evidenceDetail!);
                              setEvidenceDrawerVisible(true);
                            }}
                            style={styles.evidenceDetailBtn}
                            accessibilityRole="button"
                            accessibilityLabel="View evidence details"
                          >
                            <BookOpen color={C.primary} size={12} />
                            <Text style={styles.evidenceDetailBtnText}>
                              {language === 'Hindi' ? 'साक्ष्य विवरण' : 'Evidence Details'}
                            </Text>
                          </Pressable>
                        )}

                        {message.evidenceUrl && (
                          <Pressable
                            onPress={() => Linking.openURL(message.evidenceUrl!)}
                            style={styles.evidenceExternalBtn}
                            accessibilityRole="link"
                            accessibilityLabel={`Open source: ${message.evidenceTitle}`}
                          >
                            <Text style={styles.evidenceExternalBtnText}>
                              {language === 'Hindi' ? 'आधिकारिक स्रोत' : 'Official BIS Source'}
                            </Text>
                            <ExternalLink color={C.muted} size={11} />
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </>
                )}

                {/* Legacy citation (fallback for simple messages) */}
                {!message.evidenceTitle && message.citation && (
                  <Pressable
                    onPress={() => message.sourceUrl && Linking.openURL(message.sourceUrl)}
                    style={styles.citationPill}
                    accessibilityRole={message.sourceUrl ? 'link' : 'text'}
                  >
                    <FileText color={C.amberDark} size={13} />
                    <Text style={styles.citationText}>{message.citation}</Text>
                    {message.sourceUrl && <ExternalLink color={C.amberDark} size={12} />}
                  </Pressable>
                )}

                {/* ── NEXT STEP section ── */}
                {message.nextStep && (
                  <>
                    <View style={styles.divider} />
                    <Text style={styles.sectionLabel}>
                      {language === 'Hindi' ? 'NEXT STEP' : 'NEXT STEP'}
                    </Text>
                    <Text style={styles.nextStepText}>{message.nextStep}</Text>
                    {message.nextStepUrl && (
                      <Pressable
                        onPress={() => Linking.openURL(message.nextStepUrl!)}
                        style={styles.nextStepButton}
                        accessibilityRole="link"
                      >
                        <Globe2 color={C.primary} size={13} />
                        <Text style={styles.nextStepButtonText}>
                          {language === 'Hindi' ? 'BIS वेबसाइट खोलें' : 'Open on BIS website'}
                        </Text>
                        <ExternalLink color={C.primary} size={12} />
                      </Pressable>
                    )}
                    {/* Abstention extra: View sources + Refine */}
                    {message.abstention && (
                      <Pressable
                        onPress={() => Linking.openURL(BIS_PORTAL_URL)}
                        style={styles.abstentionAction}
                        accessibilityRole="link"
                      >
                        <Globe2 color={C.primary} size={13} />
                        <Text style={styles.abstentionActionText}>
                          {language === 'Hindi' ? 'आधिकारिक BIS स्रोत देखें' : 'View official BIS sources'}
                        </Text>
                        <ExternalLink color={C.primary} size={12} />
                      </Pressable>
                    )}
                  </>
                )}

                {/* ── FOLLOW-UP SUGGESTIONS ── */}
                {((language === 'Hindi' ? message.followUpsHi : message.followUps) || []).length > 0 && (
                  <View style={styles.followUpWrap}>
                    <View style={styles.followUpHeader}>
                      <Sparkles color={C.amberDark} size={12} />
                      <Text style={styles.followUpTitle}>
                        {language === 'Hindi' ? 'संबंधित प्रश्न' : 'Suggested Follow-ups'}
                      </Text>
                    </View>
                    <View style={styles.followUpChips}>
                      {(language === 'Hindi' ? message.followUpsHi : message.followUps)!.map((chip, idx) => (
                        <Pressable
                          key={idx}
                          onPress={() => sendQuestion(chip)}
                          style={styles.followUpChip}
                          accessibilityRole="button"
                          accessibilityLabel={`Ask: ${chip}`}
                        >
                          <Text style={styles.followUpChipText}>{chip}</Text>
                          <ChevronRight color={C.primary} size={12} />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {/* Roadmap CTA */}
                {message.roadmap && (
                  <Pressable
                    onPress={() => setRoadmapVisible(true)}
                    style={styles.roadmapButton}
                    accessibilityRole="button"
                  >
                    <Sparkles color={C.primaryDark} size={14} />
                    <Text style={styles.roadmapText}>
                      {language === 'Hindi' ? 'प्रमाणन रोडमैप देखें' : 'View Certification Roadmap'}
                    </Text>
                    <ChevronRight color={C.primaryDark} size={15} />
                  </Pressable>
                )}
              </View>
            )}
          </View>
        ))}

        {/* ── 4-stage Loading indicator ── */}
        {loading && (
          <View style={styles.loadingWrap}>
            <View style={styles.loadingRow}>
              <Animated.View style={[styles.loadingDot, { opacity: loadingDotOpacity }]} />
              <Text style={styles.loadingText}>
                {LOADING_STAGES[language][loadingStage]}
              </Text>
            </View>
          </View>
        )}

        {/* ── Sources notice ── */}
        <Pressable onPress={loadSources} style={styles.sourceNotice} accessibilityRole="button">
          <ShieldCheck color={C.teal} size={16} />
          <Text style={styles.sourceNoticeText}>
            {language === 'Hindi' ? '3 आधिकारिक BIS स्रोत जुड़े हुए हैं' : '3 official BIS sources connected'}
          </Text>
          <ChevronRight color={C.teal} size={14} />
        </Pressable>
      </ScrollView>

      {/* ── Composer ── */}
      <View style={styles.composerWrap}>
        <View style={styles.composer}>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            onSubmitEditing={() => sendQuestion()}
            onKeyPress={(e: any) => {
              if (e?.nativeEvent?.key === 'Enter' && !e?.nativeEvent?.shiftKey) {
                e?.preventDefault?.();
                sendQuestion();
              }
            }}
            returnKeyType="send"
            placeholder={
              language === 'Hindi'
                ? 'LED बल्ब, सोना या चाँदी के मानक पूछें…'
                : 'Ask about LED bulbs, Gold or Silver standards…'
            }
            placeholderTextColor="#9AA0A7"
            style={styles.input}
            maxLength={240}
            accessibilityLabel="Query input"
          />
          <Pressable
            onPress={() => sendQuestion()}
            style={[styles.sendButton, !question.trim() && styles.sendDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Send"
          >
            <ArrowUp color="#FFFFFF" size={19} strokeWidth={2.5} />
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>
          {language === 'Hindi'
            ? 'SahayakBIS एक मार्गदर्शन उपकरण है · BIS प्राधिकरण बनी रहती है'
            : 'SahayakBIS is a guidance tool · BIS remains the authority'}
        </Text>
      </View>

      {/* ── Roadmap Modal ── */}
      <Modal
        visible={roadmapVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setRoadmapVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>
                  {language === 'Hindi' ? 'प्रमाणन रोडमैप' : 'CERTIFICATION ROADMAP'}
                </Text>
                <Text style={styles.modalTitle}>
                  {language === 'Hindi' ? 'LED लैंप · IS 16102' : 'LED Lamps · IS 16102'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {language === 'Hindi'
                    ? 'Compulsory Registration Scheme (CRS) · BIS'
                    : 'Compulsory Registration Scheme (CRS) · BIS'}
                </Text>
              </View>
              <Pressable
                onPress={() => setRoadmapVisible(false)}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close roadmap"
              >
                <X color={C.navy} size={19} />
              </Pressable>
            </View>

            <Text style={styles.modalDisclaimer}>
              {language === 'Hindi'
                ? '* यह रोडमैप सामान्य मार्गदर्शन के लिए है। आधिकारिक आवश्यकताएँ BIS पोर्टल पर सत्यापित करें।'
                : '* This roadmap is for general guidance. Verify official requirements on the BIS portal.'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {roadmapSteps.map((step, idx) => (
                <View key={step.number} style={styles.step}>
                  {/* Step line */}
                  {idx < roadmapSteps.length - 1 && <View style={styles.stepLine} />}

                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.number}</Text>
                  </View>

                  <View style={styles.stepCopy}>
                    <View style={styles.stepTitleRow}>
                      <Text style={styles.stepTitle}>
                        {language === 'Hindi' ? step.titleHi : step.title}
                      </Text>
                      {step.duration !== '—' && (
                        <View style={styles.durationBadge}>
                          <Clock3 color={C.amberDark} size={10} />
                          <Text style={styles.durationText}>{step.duration}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.stepDescription}>
                      {language === 'Hindi' ? step.descriptionHi : step.description}
                    </Text>
                    {/* Evidence note per step */}
                    {step.evidenceNote && (
                      <View style={styles.stepEvidence}>
                        <FileText color={C.primary} size={11} />
                        <Text style={styles.stepEvidenceText}>
                          {language === 'Hindi' ? step.evidenceNoteHi : step.evidenceNote}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {/* Continue on BIS CTA */}
              <Pressable
                onPress={() => Linking.openURL(BIS_CARE_URL)}
                style={styles.bisCtaButton}
                accessibilityRole="link"
              >
                <Globe2 color="#FFFFFF" size={15} />
                <Text style={styles.bisCtaText}>
                  {language === 'Hindi'
                    ? 'BIS उत्पाद प्रमाणन पोर्टल खोलें'
                    : 'Open BIS Product Certification Portal'}
                </Text>
                <ExternalLink color="#FFFFFF" size={13} />
              </Pressable>

              <Pressable
                onPress={() => setRoadmapVisible(false)}
                style={styles.doneButton}
                accessibilityRole="button"
              >
                <Check color="#FFFFFF" size={17} />
                <Text style={styles.doneText}>
                  {language === 'Hindi' ? 'समझ गया' : 'Got it'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Evidence Details Drawer Modal ── */}
      <Modal
        visible={evidenceDrawerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEvidenceDrawerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View style={styles.drawerSchemeRow}>
                  {selectedEvidence && (
                    <View
                      style={[
                        styles.schemePill,
                        selectedEvidence.schemeType === 'CRS' && styles.schemePillCrs,
                        selectedEvidence.schemeType === 'Hallmarking' && styles.schemePillHallmark,
                        selectedEvidence.schemeType === 'Voluntary' && styles.schemePillVoluntary,
                      ]}
                    >
                      <Text
                        style={[
                          styles.schemePillText,
                          selectedEvidence.schemeType === 'CRS' && styles.schemeTextCrs,
                          selectedEvidence.schemeType === 'Hallmarking' && styles.schemeTextHallmark,
                          selectedEvidence.schemeType === 'Voluntary' && styles.schemeTextVoluntary,
                        ]}
                      >
                        {language === 'Hindi' ? selectedEvidence.schemeHi : selectedEvidence.scheme}
                      </Text>
                    </View>
                  )}
                  <View style={styles.verifiedStamp}>
                    <ShieldCheck color={C.green} size={12} />
                    <Text style={styles.verifiedStampText}>Verified BIS Standard</Text>
                  </View>
                </View>
                <Text style={styles.modalTitle}>{selectedEvidence?.isNumber}</Text>
                <Text style={styles.modalSubtitle}>
                  {language === 'Hindi' ? selectedEvidence?.titleHi : selectedEvidence?.title}
                </Text>
              </View>
              <Pressable
                onPress={() => setEvidenceDrawerVisible(false)}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close evidence drawer"
              >
                <X color={C.navy} size={19} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
              {/* Metadata Grid */}
              <View style={styles.metaGrid}>
                <View style={styles.metaCell}>
                  <Text style={styles.metaLabel}>Issuing Authority</Text>
                  <Text style={styles.metaVal}>{selectedEvidence?.authority}</Text>
                </View>
                <View style={styles.metaCell}>
                  <Text style={styles.metaLabel}>Edition / Status</Text>
                  <Text style={styles.metaVal}>{selectedEvidence?.year}</Text>
                </View>
              </View>

              {/* Scope & Clause Summary */}
              <View style={styles.drawerSection}>
                <Text style={styles.drawerSectionHeader}>
                  {language === 'Hindi' ? 'मानक का दायरा व सार' : 'Standard Scope & Summary'}
                </Text>
                <Text style={styles.drawerSummaryText}>
                  {language === 'Hindi' ? selectedEvidence?.scopeSummaryHi : selectedEvidence?.scopeSummary}
                </Text>
              </View>

              {/* Key Mandatory Requirements Checklist */}
              <View style={styles.drawerSection}>
                <Text style={styles.drawerSectionHeader}>
                  {language === 'Hindi' ? 'प्रमुख विनियामक आवश्यकताएँ' : 'Key Mandatory Requirements'}
                </Text>
                {(language === 'Hindi'
                  ? selectedEvidence?.keyRequirementsHi
                  : selectedEvidence?.keyRequirements
                )?.map((req, i) => (
                  <View key={i} style={styles.reqRow}>
                    <CheckCircle2 color={C.green} size={15} style={{ marginTop: 2 }} />
                    <Text style={styles.reqText}>{req}</Text>
                  </View>
                ))}
              </View>

              {/* Evidence Gate Grounding */}
              <View style={styles.evidenceGateNotice}>
                <ShieldCheck color={C.primaryDark} size={16} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.gateNoticeTitle}>Evidence Gate Verification</Text>
                  <Text style={styles.gateNoticeSub}>
                    {selectedEvidence?.verifiedDate} · Official Gazette & BIS Portal
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              {selectedEvidence?.sourceUrl && (
                <Pressable
                  onPress={() => Linking.openURL(selectedEvidence.sourceUrl)}
                  style={styles.drawerPrimaryBtn}
                  accessibilityRole="link"
                >
                  <Globe2 color="#FFFFFF" size={15} />
                  <Text style={styles.drawerPrimaryBtnText}>
                    {language === 'Hindi'
                      ? 'आधिकारिक BIS दस्तावेज़ / पोर्टल खोलें'
                      : 'Open Official BIS Portal / Document'}
                  </Text>
                  <ExternalLink color="#FFFFFF" size={13} />
                </Pressable>
              )}

              <Pressable
                onPress={() => setEvidenceDrawerVisible(false)}
                style={styles.doneButton}
                accessibilityRole="button"
              >
                <Check color="#FFFFFF" size={17} />
                <Text style={styles.doneText}>
                  {language === 'Hindi' ? 'बंद करें' : 'Close Details'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles (design.md color system) ─────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    backgroundColor: C.navy,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: C.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  brandAccent: { color: '#E3A62F' },
  tagline: { color: '#AFC3D6', fontSize: 10, marginTop: 1, letterSpacing: 0.3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  languagePill: {
    flexDirection: 'row',
    backgroundColor: C.navyLight,
    borderRadius: 16,
    padding: 3,
  },
  languageButton: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 13 },
  languageActive: { backgroundColor: '#E3A62F' },
  languageText: { color: '#C8D5E2', fontSize: 11, fontWeight: '700' },
  languageActiveText: { color: '#17314D' },
  bisLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A5880',
  },
  bisLinkText: { color: C.primaryLight, fontSize: 10, fontWeight: '700' },

  // Intent Bar (design.md §Main Screen — 4 action buttons)
  intentBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 7,
    backgroundColor: C.bgSoft,
    borderBottomWidth: 1,
    borderBottomColor: '#DDEAF5',
  },
  intentButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 4,
    backgroundColor: C.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.navy,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  intentLabel: { color: C.primaryDark, fontSize: 9.5, fontWeight: '700', textAlign: 'center' },

  // Suggested prompts
  promptRow: { gap: 7, paddingHorizontal: 12, paddingVertical: 9 },
  promptChip: {
    backgroundColor: C.bg,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    shadowColor: C.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  promptText: { color: '#334657', fontWeight: '700', fontSize: 11.5 },

  // Messages
  content: { paddingHorizontal: 14, paddingBottom: 24, paddingTop: 6 },
  datePill: {
    alignSelf: 'center',
    backgroundColor: '#EEF4FA',
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginVertical: 8,
  },
  dateText: { color: '#6B7C8D', fontSize: 11, fontWeight: '600' },

  messageWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 12 },
  userWrap: { flexDirection: 'row-reverse' },
  avatar: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  userAvatar: { backgroundColor: C.gold },
  userAvatarText: { color: '#FFFFFF', fontSize: 8.5, fontWeight: '800' },

  // User bubble
  bubble: {
    maxWidth: '86%',
    backgroundColor: C.bg,
    borderRadius: 16,
    borderTopLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#D8E8F4',
    padding: 13,
    shadowColor: C.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  userBubble: {
    backgroundColor: C.primary,
    borderColor: C.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 5,
  },
  messageText: { color: C.text, fontSize: 14, lineHeight: 21 },
  userMessageText: { color: '#FFFFFF' },

  // Assistant structured card (Answer → Evidence → Next Step)
  assistantCard: {
    flex: 1,
    backgroundColor: C.bg,
    borderRadius: 16,
    borderTopLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#D8E8F4',
    padding: 14,
    shadowColor: C.navy,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    maxWidth: '90%',
  },
  sectionLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: C.primary,
    marginBottom: 5,
    marginTop: 2,
  },
  answerText: { color: C.text, fontSize: 14, lineHeight: 21 },
  divider: {
    height: 1,
    backgroundColor: '#D8E8F4',
    marginVertical: 12,
  },

  // Evidence section & IS-number Evidence card
  evidenceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  schemePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#EAF5FC',
  },
  schemePillCrs: { backgroundColor: '#EAF2FB', borderWidth: 1, borderColor: '#BED8F2' },
  schemePillHallmark: { backgroundColor: '#FFF6E0', borderWidth: 1, borderColor: '#F5DF9E' },
  schemePillVoluntary: { backgroundColor: '#E8F5F5', borderWidth: 1, borderColor: '#BBE3E4' },
  schemePillText: { fontSize: 10, fontWeight: '800' },
  schemeTextCrs: { color: C.primaryDark },
  schemeTextHallmark: { color: C.amberDark },
  schemeTextVoluntary: { color: C.teal },

  evidenceCard: {
    backgroundColor: C.primaryLight,
    borderColor: '#C8DEF2',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 2,
  },
  evidenceCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  evidenceIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#D7EBF8',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  evidenceCardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1 },
  evidenceCardText: { flex: 1 },
  evidenceIsNumber: {
    color: C.primaryDark,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  evidenceTitle: { color: '#1B3A5A', fontSize: 12.5, marginTop: 3, lineHeight: 17, fontWeight: '500' },
  evidenceMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  evidenceMetaText: { color: C.teal, fontSize: 10, fontWeight: '700' },

  evidenceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopColor: '#D3E5F4',
    borderTopWidth: 1,
  },
  evidenceDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderColor: '#BED8F0',
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  evidenceDetailBtnText: { color: C.primaryDark, fontSize: 11, fontWeight: '700' },
  evidenceExternalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  evidenceExternalBtnText: { color: C.muted, fontSize: 11, fontWeight: '600' },

  // Follow-up Suggestions
  followUpWrap: {
    marginTop: 14,
    paddingTop: 12,
    borderTopColor: '#E6EFF7',
    borderTopWidth: 1,
  },
  followUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  followUpTitle: {
    color: C.amberDark,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  followUpChips: {
    flexDirection: 'column',
    gap: 6,
  },
  followUpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAFD',
    borderColor: '#D4E4F4',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  followUpChipText: {
    color: C.navy,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },

  // Evidence Drawer Specific Styles
  drawerSchemeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  verifiedStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF7EE',
    borderColor: '#BFE7CB',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  verifiedStampText: {
    color: C.green,
    fontSize: 10,
    fontWeight: '800',
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F4F8FC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderColor: '#D8E8F5',
    borderWidth: 1,
  },
  metaCell: { flex: 1 },
  metaLabel: { color: C.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaVal: { color: C.navy, fontSize: 12, fontWeight: '700', marginTop: 3 },

  drawerSection: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2EEF8',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  drawerSectionHeader: {
    color: C.navy,
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  drawerSummaryText: {
    color: C.text,
    fontSize: 12.5,
    lineHeight: 18.5,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  reqText: {
    color: C.text,
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  evidenceGateNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF5FC',
    borderColor: '#BED8F0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  gateNoticeTitle: {
    color: C.primaryDark,
    fontSize: 11.5,
    fontWeight: '800',
  },
  gateNoticeSub: {
    color: C.muted,
    fontSize: 10.5,
    marginTop: 2,
  },
  drawerPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  drawerPrimaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  // Legacy citation pill (fallback)
  citationPill: {
    backgroundColor: '#FFF5D7',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  citationText: { color: C.amberDark, fontSize: 11, fontWeight: '800', flexShrink: 1 },

  // Next step
  nextStepText: { color: C.muted, fontSize: 13, lineHeight: 19 },
  nextStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 9,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.primaryLight,
  },
  nextStepButtonText: { color: C.primaryDark, fontSize: 12, fontWeight: '700' },

  // Warning / hinglish banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF8E8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 10,
  },
  warningText: { color: C.amberDark, fontSize: 11, fontWeight: '700' },

  // Safe abstention (design.md §Safe Abstention — calm card, not red error)
  abstentionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F4F7FA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 10,
  },
  abstentionBannerText: { color: C.muted, fontSize: 11, fontWeight: '700' },
  abstentionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 9,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.primaryLight,
  },
  abstentionActionText: { color: C.primaryDark, fontSize: 12, fontWeight: '700' },

  // Roadmap CTA inside chat
  roadmapButton: {
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
    backgroundColor: C.primaryLight,
  },
  roadmapText: { color: C.primaryDark, fontSize: 12, fontWeight: '800' },

  // Loading (4-stage messages)
  loadingWrap: { paddingLeft: 38, marginTop: 14 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.primary,
  },
  loadingText: { color: C.muted, fontSize: 12, fontStyle: 'italic' },

  // Source notice
  sourceNotice: {
    marginTop: 22,
    borderTopColor: '#D8E8F4',
    borderTopWidth: 1,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sourceNoticeText: { color: C.teal, fontSize: 12, fontWeight: '700', flex: 1 },

  // Composer
  composerWrap: {
    backgroundColor: C.bg,
    borderTopColor: '#D8E8F4',
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },
  composer: {
    minHeight: 48,
    backgroundColor: C.bgSoft,
    borderColor: '#C0D8EC',
    borderWidth: 1,
    borderRadius: 26,
    paddingLeft: 16,
    paddingRight: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: C.navy,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  input: { flex: 1, color: C.text, fontSize: 14, maxHeight: 65, paddingTop: 10, paddingBottom: 10 },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
  disclaimer: {
    color: '#9BA1A5',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 14,
  },

  // Roadmap Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(4, 20, 38, 0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C8D8E8',
    alignSelf: 'center',
    marginBottom: 18,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  modalEyebrow: { color: C.amberDark, fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  modalTitle: { color: C.navy, fontSize: 22, fontWeight: '800', marginTop: 4 },
  modalSubtitle: { color: C.teal, fontSize: 12, fontWeight: '700', marginTop: 3 },
  modalDisclaimer: {
    color: C.muted,
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 18,
    lineHeight: 16,
    borderLeftWidth: 2,
    borderLeftColor: C.border,
    paddingLeft: 9,
  },
  closeButton: {
    width: 33,
    height: 33,
    backgroundColor: '#EAF5FC',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Roadmap steps
  step: { flexDirection: 'row', minHeight: 72, marginBottom: 4, position: 'relative' },
  stepLine: {
    position: 'absolute',
    left: 16,
    top: 33,
    bottom: 0,
    width: 1.5,
    backgroundColor: C.border,
    zIndex: 0,
  },
  stepNumber: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    flexShrink: 0,
  },
  stepNumberText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  stepCopy: { flex: 1, paddingLeft: 12, paddingBottom: 18 },
  stepTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 },
  stepTitle: { color: C.navy, fontSize: 13.5, fontWeight: '800', flex: 1, lineHeight: 19 },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF8E1',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexShrink: 0,
  },
  durationText: { color: C.amberDark, fontSize: 9.5, fontWeight: '800' },
  stepDescription: { color: C.muted, fontSize: 12, lineHeight: 17.5, marginTop: 4 },
  stepEvidence: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 7,
    backgroundColor: C.primaryLight,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  stepEvidenceText: { color: C.primaryDark, fontSize: 10.5, fontWeight: '700' },

  // BIS portal CTA
  bisCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: C.primary,
    borderRadius: 13,
    paddingVertical: 13,
    marginTop: 10,
    marginBottom: 8,
  },
  bisCtaText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  doneButton: {
    backgroundColor: C.navy,
    borderRadius: 13,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },
  doneText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
});
