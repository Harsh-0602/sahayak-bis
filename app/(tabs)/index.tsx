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
  Search,
  RotateCcw,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { addHistoryItem } from '@/lib/historyStore';

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
  // Regulatory Basis & Legal Reference (Panel 2)
  regulatoryBasis: string;
  regulatoryBasisHi: string;
  legalOrder: string;
  legalOrderHi: string;
  applicabilityType: 'Mandatory' | 'Voluntary';
  applicabilityTypeHi: string;
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

// ─── Core Product Capabilities (Generic, Product-Level Functions) ───────────
type ProductCapability = {
  id: string;
  label: string;
  labelHi: string;
  icon: any;
  query: string;
  queryHi: string;
  description: string;
  descriptionHi: string;
};

export const PRODUCT_CAPABILITIES: ProductCapability[] = [
  {
    id: 'find_standard',
    label: 'Find My Standard',
    labelHi: 'मानक खोजें',
    icon: FileSearch,
    query: 'How do I find the applicable BIS standard for my product?',
    queryHi: 'मैं अपने उत्पाद के लिए लागू BIS मानक कैसे खोजूँ?',
    description: 'Search standards by product or technical sector',
    descriptionHi: 'उत्पाद या तकनीकी क्षेत्र के अनुसार मानक खोजें',
  },
  {
    id: 'check_requirement',
    label: 'Check BIS Requirement',
    labelHi: 'आवश्यकता जाँचें',
    icon: CheckCircle2,
    query: 'How can I check whether a BIS requirement applies?',
    queryHi: 'मैं कैसे जाँचूँ कि कोई BIS आवश्यकता लागू होती है?',
    description: 'Verify mandatory QCO / CRO applicability',
    descriptionHi: 'अनिवार्य QCO / CRO आदेश की पुष्टि करें',
  },
  {
    id: 'compliance_roadmap',
    label: 'Build Compliance Roadmap',
    labelHi: 'अनुपालन रोडमैप',
    icon: Sparkles,
    query: 'Show me how to build a BIS compliance roadmap.',
    queryHi: 'मुझे BIS अनुपालन रोडमैप बनाने का तरीका बताएं।',
    description: 'Evidence-grounded compliance roadmap',
    descriptionHi: 'साक्ष्य-आधारित अनुपालन रोडमैप',
  },
  {
    id: 'verify_understand',
    label: 'Verify / Understand',
    labelHi: 'सत्यापन व जानकारी',
    icon: ShieldCheck,
    query: 'What BIS services can help me verify a product?',
    queryHi: 'उत्पाद सत्यापन में कौन सी BIS सेवाएं मदद कर सकती हैं?',
    description: 'Understand verification, certification and BIS service information',
    descriptionHi: 'सत्यापन, प्रमाणन और BIS सेवा जानकारी समझें',
  },
  {
    id: 'explore_services',
    label: 'Explore BIS Services',
    labelHi: 'BIS सेवाएं देखें',
    icon: Globe2,
    query: 'What are the key official BIS services and portals?',
    queryHi: 'प्रमुख आधिकारिक BIS सेवाएं और पोर्टल कौन से हैं?',
    description: 'Manakonline, CRS & BIS CARE ecosystem',
    descriptionHi: 'मानकऑनलाइन, CRS व BIS केयर ऐप',
  },
];

// Representative Pilot Demonstrations (Slice of connected data)
export const DEMO_WORKFLOW_CHIPS = [
  {
    id: 'demo_led_std',
    label: 'LED Lamp Standard (IS 16102)',
    labelHi: 'LED मानक (IS 16102)',
    query: 'Which BIS standard applies to LED bulbs?',
    queryHi: 'LED बल्ब के लिए कौन सा BIS मानक लागू होता है?',
  },
  {
    id: 'demo_led_req',
    label: 'LED Mandatory CRS Order',
    labelHi: 'LED अनिवार्य CRS आदेश',
    query: 'What is the BIS certification requirement for LED lamps?',
    queryHi: 'LED लैंप के लिए BIS प्रमाणन आवश्यकता क्या है?',
  },
  {
    id: 'demo_led_roadmap',
    label: 'LED Compliance Roadmap',
    labelHi: 'LED अनुपालन रोडमैप',
    query: 'Show me the BIS compliance roadmap for LED lamps.',
    queryHi: 'LED बल्ब BIS प्रमाणन रोडमैप',
  },
  {
    id: 'demo_gold_huid',
    label: 'Gold Hallmarking & HUID',
    labelHi: 'सोना हॉलमार्किंग व HUID',
    query: 'How do I verify a 6-digit HUID on gold jewellery?',
    queryHi: 'सोने की हॉलमार्किंग और HUID कैसे जाँचें?',
  },
  {
    id: 'demo_gold_purity',
    label: '22K916 Meaning & Purity',
    labelHi: '22K916 अर्थ व शुद्धता',
    query: 'What does 22K916 mean?',
    queryHi: '22K916 का क्या मतलब है?',
  },
  {
    id: 'demo_silver_std',
    label: 'Silver Jewellery (IS 2112)',
    labelHi: 'चाँदी मानक (IS 2112)',
    query: 'What are the silver hallmarking standards (IS 2112)?',
    queryHi: 'चाँदी की हॉलमार्किंग मानक (IS 2112)',
  },
];

// ─── Suggested Questions (Concise Labels + Full Grounded Queries) ───────────
type SuggestedPrompt = {
  id: string;
  label: string;
  labelHi: string;
  query: string;
  queryHi: string;
};

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  // ── General BIS Product Capabilities (First) ──
  {
    id: 'p_find_std',
    label: 'Find applicable BIS standard',
    labelHi: 'लागू BIS मानक खोजें',
    query: 'How do I find the applicable BIS standard for my product?',
    queryHi: 'मैं अपने उत्पाद के लिए लागू BIS मानक कैसे खोजूँ?',
  },
  {
    id: 'p_check_req',
    label: 'Check whether BIS applies',
    labelHi: 'BIS आवश्यकता जाँचें',
    query: 'How can I check whether a BIS requirement applies?',
    queryHi: 'मैं कैसे जाँचूँ कि कोई BIS आवश्यकता लागू होती है?',
  },
  {
    id: 'p_testing_info',
    label: 'Find BIS testing information',
    labelHi: 'BIS परीक्षण जानकारी खोजें',
    query: 'How can I find the relevant testing information?',
    queryHi: 'परीक्षण संबंधी जानकारी कैसे प्राप्त करें?',
  },
  {
    id: 'p_roadmap',
    label: 'Build BIS compliance roadmap',
    labelHi: 'BIS अनुपालन रोडमैप बनाएं',
    query: 'Show me how to build a BIS compliance roadmap.',
    queryHi: 'मुझे BIS अनुपालन रोडमैप बनाने का तरीका बताएं।',
  },
  {
    id: 'p_services',
    label: 'Explore BIS services',
    labelHi: 'BIS सेवाएं देखें',
    query: 'What are the key official BIS services and portals?',
    queryHi: 'प्रमुख आधिकारिक BIS सेवाएं और पोर्टल कौन से हैं?',
  },

  // ── Representative Evidence Demonstrations ──
  {
    id: 'p_huid_work',
    label: 'How does HUID verification work?',
    labelHi: 'HUID सत्यापन कैसे काम करता है?',
    query: 'How do I verify a 6-digit HUID on gold jewellery?',
    queryHi: 'सोने की हॉलमार्किंग और HUID कैसे जाँचें?',
  },
  {
    id: 'p_led_std',
    label: 'What is the LED lamp standard?',
    labelHi: 'LED लैंप मानक क्या है?',
    query: 'Which BIS standard applies to LED bulbs?',
    queryHi: 'LED बल्ब के लिए कौन सा BIS मानक लागू होता है?',
  },
  {
    id: 'p_22k916',
    label: 'Decode 22K916 fineness',
    labelHi: '22K916 शुद्धता समझें',
    query: 'What does 22K916 mean?',
    queryHi: '22K916 का क्या मतलब है?',
  },
  {
    id: 'p_silver_std',
    label: 'Silver hallmarking (IS 2112)',
    labelHi: 'चाँदी हॉलमार्किंग (IS 2112)',
    query: 'What are the silver hallmarking standards (IS 2112)?',
    queryHi: 'चाँदी की हॉलमार्किंग मानक (IS 2112)',
  },
];

// ─── Official BIS Sources ─────────────────────────────────────────────────────
const HALLMARKING_FAQ_URL = 'https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq/?lang=en';
const BIS_PORTAL_URL = 'https://www.bis.gov.in/';
const BIS_CARE_URL = 'https://www.bis.gov.in/product-certification/online-information/';
const MANAKONLINE_URL = 'https://www.manakonline.in/';

const localSources: Source[] = [
  {
    title: 'BIS Standards Directory & Manakonline Portal',
    url: MANAKONLINE_URL,
    citation: 'BIS Standards Directory · e-BIS',
    summary: 'Official repository of all gazetted Indian Standards, technical committees, and e-application portals.',
  },
  {
    title: 'Indian Standards on LED (IS 16102)',
    url: 'https://bis.gov.in/other/LEDSeries.pdf',
    citation: 'BIS LED Series · IS 16102',
    summary: 'Official standards covering LED lamps: Safety (IS 16102 Part 1:2026) and Performance (IS 16102 Part 2:2012).',
  },
  {
    title: 'Gold & Silver Hallmarking Regulations',
    url: HALLMARKING_FAQ_URL,
    citation: 'BIS Hallmarking · IS 1417 & IS 2112',
    summary: 'Confirms the 3-part hallmark regime: BIS logo, purity/fineness grades, and 6-digit laser-engraved HUID.',
  },
  {
    title: 'Consumer Protection & BIS CARE HUID Lookup',
    url: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en',
    citation: 'BIS Consumer Protection · BIS CARE',
    summary: 'Citizen guidance on verifying 6-digit HUID codes and ISI marks via the official BIS CARE mobile application.',
  },
];

// ─── Evidence Database (IS-number metadata & evidence details) ───────────────
export const EVIDENCE_DATABASE: Record<string, EvidenceDetail> = {
  'IS 16102': {
    isNumber: 'IS 16102 (Part 1):2026 · IS 16102 (Part 2):2012',
    title: 'Self-Ballasted LED Lamps for General Lighting Services (Part 1: Safety; Part 2: Performance)',
    titleHi: 'सामान्य प्रकाश व्यवस्था के लिए सेल्फ-बैलेस्टेड LED लैंप (Part 1: सुरक्षा; Part 2: प्रदर्शन)',
    scheme: 'Compulsory Registration Scheme (CRS)',
    schemeHi: 'अनिवार्य पंजीकरण योजना (CRS)',
    schemeType: 'CRS',
    authority: 'Bureau of Indian Standards · Electrotechnical Division',
    year: 'Part 1: 2026 (First Revision); Part 2: 2012 [Historical: Part 1:2012]',
    scopeSummary: 'Prescribes safety requirements in Part 1:2026 (insulation resistance, electric shock protection, mechanical strength, thermal endurance) and performance requirements in Part 2:2012 (wattage, luminous flux, colour temperature, life test).',
    scopeSummaryHi: 'Part 1:2026 में सुरक्षा आवश्यकताएँ (इन्सुलेशन प्रतिरोध, विद्युत सुरक्षा, यांत्रिक मजबूती, तापीय सहनशीलता) और Part 2:2012 में प्रदर्शन आवश्यकताएँ (वाट क्षमता, ल्यूमेन आउटपुट, रंग तापमान, जीवनकाल) निर्धारित करता है।',
    keyRequirements: [
      'Testing at a BIS-recognized laboratory as per IS 16102 (Part 1):2026 and (Part 2):2012',
      'Manufacturing unit registration under BIS Compulsory Registration Scheme (CRS)',
      'Standard CRS mark with unique Registration number (R-number) on product packaging',
      'Mandatory compliance under Electronics & IT Goods (Compulsory Registration) Order',
    ],
    keyRequirementsHi: [
      'BIS से मान्यता प्राप्त प्रयोगशाला में IS 16102 (Part 1):2026 और (Part 2):2012 के तहत परीक्षण',
      'BIS अनिवार्य पंजीकरण योजना (CRS) के तहत निर्माण इकाई का पंजीकरण',
      'उत्पाद पैकेजिंग पर अद्वितीय पंजीकरण संख्या (R-number) के साथ मानक CRS मार्क',
      'इलेक्ट्रॉनिक्स व आईटी सामान अनिवार्य पंजीकरण आदेश के तहत अनिवार्य अनुपालन',
    ],
    sourceUrl: 'https://bis.gov.in/other/LEDSeries.pdf',
    sourceTitle: 'BIS LED Series Official Standards Directory & BIS LIMS',
    verifiedDate: 'Active Reference · BIS LIMS / Gazette Notification',
    regulatoryBasis: 'Standards define technical requirements; mandatory certification is enforced separately by statutory order: Electronics & Information Technology Goods (Requirement for Compulsory Registration) Order notified by MeitY, administered under Scheme II (CRS) of BIS (Conformity Assessment) Regulations.',
    regulatoryBasisHi: 'मानक तकनीकी आवश्यकताओं को परिभाषित करते हैं; अनिवार्य प्रमाणन अलग से वैधानिक आदेश द्वारा लागू होता है: इलेक्ट्रॉनिक्स और आईटी सामान (अनिवार्य पंजीकरण) आदेश (MeitY), जो BIS विनियमों की योजना II (CRS) के तहत प्रशासित है।',
    legalOrder: 'MeitY Electronics & IT Goods (Compulsory Registration) Order · Scheme-II of BIS (Conformity Assessment) Regulations',
    legalOrderHi: 'MeitY इलेक्ट्रॉनिक्स व आईटी सामान (अनिवार्य पंजीकरण) आदेश · BIS योजना-II (CRS)',
    applicabilityType: 'Mandatory',
    applicabilityTypeHi: 'MeitY आदेश द्वारा अनिवार्य (CRS)',
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
    regulatoryBasis: 'Mandatory Hallmarking regime under the Quality Control Order (QCO) issued by the Ministry of Consumer Affairs, Food & Public Distribution. Notified across designated districts in India.',
    regulatoryBasisHi: 'उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय द्वारा जारी गुणवत्ता नियंत्रण आदेश (QCO) के तहत अधिसूचित जिलों में अनिवार्य हॉलमार्किंग।',
    legalOrder: 'Hallmarking Quality Control Order (QCO) · Section 16 & Section 25 of BIS Act, 2016',
    legalOrderHi: 'हॉलमार्किंग गुणवत्ता नियंत्रण आदेश (QCO) · BIS अधिनियम 2016 की धारा 16 व 25',
    applicabilityType: 'Mandatory',
    applicabilityTypeHi: 'अनिवार्य (Mandatory in notified districts)',
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
      'Protects consumers against silver adulteration and provides third-party purity assurance',
      'Verification via BIS CARE App and registered Assaying & Hallmarking Centres',
    ],
    keyRequirementsHi: [
      'BIS हॉलमार्किंग के तहत जौहरियों और निर्माताओं के लिए स्वैच्छिक योजना',
      'अनुपालन करने वाली वस्तुओं को BIS लोगो, शुद्धता संख्या और 6-अंकीय HUID मिलता है',
      'उपभोक्ताओं को चाँदी में मिलावट से सुरक्षा और तृतीय-पक्ष शुद्धता आश्वासन देता है',
      'BIS CARE ऐप और पंजीकृत परख केंद्रों (AHC) के माध्यम से सत्यापन',
    ],
    sourceUrl: HALLMARKING_FAQ_URL,
    sourceTitle: 'BIS Silver Hallmarking Standards Directory',
    verifiedDate: 'Active Gazette Reference · Bureau of Indian Standards',
    regulatoryBasis: 'Administered under the BIS Hallmarking Scheme as a voluntary purity assurance standard. Jewellers may register to hallmark silver articles to provide official third-party purity assurance.',
    regulatoryBasisHi: 'स्वैच्छिक शुद्धता आश्वासन मानक के रूप में BIS हॉलमार्किंग योजना के तहत प्रशासित। जौहरी आधिकारिक तृतीय-पक्ष शुद्धता आश्वासन के लिए पंजीकरण कर सकते हैं।',
    legalOrder: 'BIS (Hallmarking) Regulations · Voluntary Conformity Assessment Scheme',
    legalOrderHi: 'BIS (हॉलमार्किंग) विनियम · स्वैच्छिक अनुरूपता मूल्यांकन योजना',
    applicabilityType: 'Voluntary',
    applicabilityTypeHi: 'स्वैच्छिक (Voluntary Scheme)',
  },
  'BIS_DIRECTORY': {
    isNumber: 'BIS Standards Directory (Manakonline)',
    title: 'National Standards Formulation & Search Directory',
    titleHi: 'राष्ट्रीय मानक निर्माण व खोज निर्देशिका',
    scheme: 'Indian Standards Formulation & Publication',
    schemeHi: 'भारतीय मानक निर्माण व प्रकाशन',
    schemeType: 'Voluntary',
    authority: 'Bureau of Indian Standards · Standardization Directorate',
    year: 'Active National Catalogue · 20,000+ Standards',
    scopeSummary: 'Official national repository of gazetted Indian Standards across 14 technical sectors. Standards define specifications, testing methods, tolerances, and sampling criteria.',
    scopeSummaryHi: '14 तकनीकी क्षेत्रों में भारतीय मानकों का आधिकारिक राष्ट्रीय भंडार। मानक विनिर्देशों, परीक्षण विधियों, सहिष्णुता और नमूनाकरण मानदंडों को परिभाषित करते हैं।',
    keyRequirements: [
      'Search applicable standards by product keyword, ICS classification, or Sectional Committee',
      'Verify latest published edition, revisions, and gazetted amendments',
      'Standards remain voluntary technical specifications unless notified under statutory QCO/CRO',
      'Purchase or read full-text standards on official portal manakonline.in',
    ],
    keyRequirementsHi: [
      'उत्पाद कीवर्ड, ICS वर्गीकरण या समिति द्वारा लागू मानक खोजें',
      'नवीनतम प्रकाशित संस्करण, संशोधन और राजपत्रित अधिसूचनाओं की पुष्टि करें',
      'मानक स्वैच्छिक रहते हैं जब तक कि वैधानिक QCO/CRO द्वारा अनिवार्य न किए जाएं',
      'आधिकारिक पोर्टल manakonline.in पर पूर्ण मानक पढ़ें या खरीदें',
    ],
    sourceUrl: 'https://www.manakonline.in/',
    sourceTitle: 'Manakonline — BIS Official E-Governance Portal',
    verifiedDate: 'Active National Directory · Bureau of Indian Standards',
    regulatoryBasis: 'Formulated pursuant to Section 10 of the Bureau of Indian Standards Act, 2016. An Indian Standard serves as a national benchmark; legal compulsion requires a separate statutory order.',
    regulatoryBasisHi: 'BIS अधिनियम 2016 की धारा 10 के तहत निर्मित। भारतीय मानक एक राष्ट्रीय बेंचमार्क है; कानूनी अनिवार्यता के लिए अलग वैधानिक आदेश आवश्यक है।',
    legalOrder: 'Section 10 of BIS Act, 2016 · National Standardization Framework',
    legalOrderHi: 'BIS अधिनियम 2016 की धारा 10 · राष्ट्रीय मानकीकरण ढांचा',
    applicabilityType: 'Voluntary',
    applicabilityTypeHi: 'स्वैच्छिक (Technical Specification)',
  },
  'BIS_QCO_FRAMEWORK': {
    isNumber: 'Quality Control Orders (QCO) Register',
    title: 'Mandatory Quality Control & Compulsory Registration Orders',
    titleHi: 'अनिवार्य गुणवत्ता नियंत्रण व अनिवार्य पंजीकरण आदेश',
    scheme: 'Statutory Ministerial Regulation',
    schemeHi: 'वैधानिक मंत्रालयी विनियमन',
    schemeType: 'CRS',
    authority: 'Line Ministries (DPIIT, MeitY, MoHUA, etc.) in consultation with BIS',
    year: 'Active Statutory Regime · Gazette Notifications',
    scopeSummary: 'Statutory orders issued under the BIS Act, 2016 prohibiting manufacture, import, distribution, or sale of notified goods without valid BIS certification or registration.',
    scopeSummaryHi: 'BIS अधिनियम 2016 के तहत जारी वैधानिक आदेश, जो वैध BIS प्रमाणन या पंजीकरण के बिना अधिसूचित वस्तुओं के निर्माण, आयात या बिक्री को प्रतिबंधित करते हैं।',
    keyRequirements: [
      'Statutory compliance mandatory for all domestic manufacturers and importers',
      'Mandatory use of Standard Mark (ISI Mark Scheme I or CRS Registration Scheme II)',
      'Sub-standard or uncertified goods subject to confiscation and statutory penalties',
      'Enforced by BIS quality enforcement officers and district authorities',
    ],
    keyRequirementsHi: [
      'सभी घरेलू निर्माताओं और आयातकों के लिए वैधानिक अनुपालन अनिवार्य',
      'मानक चिह्न (ISI मार्क योजना-I या CRS पंजीकरण योजना-II) का अनिवार्य उपयोग',
      'गैर-प्रमाणित सामग्री को जब्त करने और दंडात्मक कार्रवाई का कानूनी प्रावधान',
      'BIS गुणवत्ता प्रवर्तन अधिकारियों द्वारा निरीक्षण व निगरानी',
    ],
    sourceUrl: 'https://www.bis.gov.in/',
    sourceTitle: 'BIS Official QCO Directory & Notifications',
    verifiedDate: 'Active Statutory Gazette · Government of India',
    regulatoryBasis: 'Issued under Section 16 of the BIS Act, 2016 by Central Government ministries for public safety, consumer health, and prevention of deceptive practices.',
    regulatoryBasisHi: 'जन सुरक्षा और उपभोक्ता संरक्षण के लिए केंद्र सरकार के मंत्रालयों द्वारा BIS अधिनियम 2016 की धारा 16 के तहत जारी।',
    legalOrder: 'Section 16 of BIS Act, 2016 · Statutory Orders by Line Ministries',
    legalOrderHi: 'BIS अधिनियम 2016 की धारा 16 · संबंधित मंत्रालयों द्वारा वैधानिक आदेश',
    applicabilityType: 'Mandatory',
    applicabilityTypeHi: 'अनिवार्य (Statutory Law)',
  },
  'BIS_LRS_TESTING': {
    isNumber: 'Laboratory Recognition Scheme (LRS)',
    title: 'BIS Central Laboratories & Recognized Testing Network',
    titleHi: 'BIS केंद्रीय प्रयोगशालाएं व मान्यता प्राप्त परीक्षण नेटवर्क',
    scheme: 'Conformity Assessment Testing Scheme',
    schemeHi: 'अनुरूपता मूल्यांकन परीक्षण योजना',
    schemeType: 'Voluntary',
    authority: 'Bureau of Indian Standards · Central Laboratory Directorate',
    year: 'Active Pan-India Laboratory Network',
    scopeSummary: 'Network comprising BIS own laboratories and NABL-accredited third-party commercial/government laboratories officially recognized for testing products against Indian Standards.',
    scopeSummaryHi: 'BIS की अपनी प्रयोगशालाओं और NABL-मान्यता प्राप्त प्रयोगशालाओं का नेटवर्क जो भारतीय मानकों के अनुसार उत्पाद परीक्षण के लिए अधिकृत हैं।',
    keyRequirements: [
      'Testing must be performed exclusively at authorized BIS-recognized testing facilities',
      'Test reports evaluated against physical, electrical, chemical, and durability clauses of the IS',
      'Testing parameters and limits defined directly within the relevant Indian Standard',
      'Lab Information Management System (LIMS) enables online sample tracking and report delivery',
    ],
    keyRequirementsHi: [
      'परीक्षण विशेष रूप से अधिकृत BIS-मान्यता प्राप्त प्रयोगशालाओं में किया जाना अनिवार्य',
      'परीक्षण रिपोर्ट का मूल्यांकन मानक के भौतिक, विद्युत, रासायनिक और सहनशीलता खंडों पर',
      'प्रासंगिक भारतीय मानक के भीतर सीधे निर्धारित परीक्षण मापदंड और सीमाएं',
      'प्रयोगशाला प्रबंधन प्रणाली (LIMS) द्वारा नमूनों की ऑनलाइन ट्रैकिंग',
    ],
    sourceUrl: 'https://www.bis.gov.in/',
    sourceTitle: 'BIS Laboratory Information Management System (LIMS)',
    verifiedDate: 'Active Testing Network · Bureau of Indian Standards',
    regulatoryBasis: 'Conformity testing executed in accordance with Regulation 4 of the BIS (Conformity Assessment) Regulations, 2018.',
    regulatoryBasisHi: 'BIS (अनुरूपता मूल्यांकन) विनियम 2018 के विनियमन 4 के अनुसार परीक्षण।',
    legalOrder: 'Regulation 4 of BIS (Conformity Assessment) Regulations, 2018',
    legalOrderHi: 'BIS (अनुरूपता मूल्यांकन) विनियम 2018 का विनियमन 4',
    applicabilityType: 'Mandatory',
    applicabilityTypeHi: 'अनिवार्य परीक्षण (Mandatory for Certification)',
  },
  'BIS_SERVICES_CITIZEN': {
    isNumber: 'BIS Digital Services Ecosystem',
    title: 'Official Digital Services (Manakonline, CRS Portal, BIS CARE App)',
    titleHi: 'आधिकारिक डिजिटल सेवाएं (मानकऑनलाइन, CRS पोर्टल, BIS केयर ऐप)',
    scheme: 'Digital Citizen & Industry Services',
    schemeHi: 'डिजिटल नागरिक व उद्योग सेवाएं',
    schemeType: 'Voluntary',
    authority: 'Bureau of Indian Standards · IT & Citizen Services Division',
    year: 'Government of India Digital Platforms',
    scopeSummary: 'Official digital portals facilitating standard discovery, enterprise certification applications, laboratory testing tracking, consumer HUID verification, and public complaint redressal.',
    scopeSummaryHi: 'मानक खोज, लाइसेंस आवेदन, प्रयोगशाला परीक्षण ट्रैकिंग, उपभोक्ता HUID सत्यापन और शिकायत निवारण की आधिकारिक डिजिटल प्रणाली।',
    keyRequirements: [
      'Manakonline (e-BIS): Enterprise portal for standard purchase and license filing',
      'CRS Portal: Dedicated platform for IT and electronic goods compulsory registration',
      'BIS CARE App: Mobile application for citizens to verify ISI mark, Hallmarking HUID, and lodge grievances',
      'Know Your Standards: Public access portal for reading published Indian Standards',
    ],
    keyRequirementsHi: [
      'मानकऑनलाइन: मानक खरीद और लाइसेंस आवेदन के लिए उद्यम पोर्टल',
      'CRS पोर्टल: इलेक्ट्रॉनिक्स और आईटी उत्पादों के पंजीकरण के लिए समर्पित मंच',
      'BIS केयर ऐप: ISI मार्क, HUID सत्यापन और शिकायत दर्ज करने के लिए मोबाइल ऐप',
      'अपने मानक जानें: प्रकाशित भारतीय मानकों को पढ़ने के लिए सार्वजनिक पोर्टल',
    ],
    sourceUrl: 'https://www.bis.gov.in/',
    sourceTitle: 'Bureau of Indian Standards Official Portal',
    verifiedDate: 'Active Digital Ecosystem · Government of India',
    regulatoryBasis: 'Citizen empowerment and transparent governance frameworks established under the Bureau of Indian Standards Act, 2016.',
    regulatoryBasisHi: 'BIS अधिनियम 2016 के तहत नागरिक सशक्तिकरण और पारदर्शी ई-गवर्नेंस ढांचा।',
    legalOrder: 'Bureau of Indian Standards Act, 2016 (Act No. 11 of 2016)',
    legalOrderHi: 'भारतीय मानक ब्यूरो अधिनियम, 2016',
    applicabilityType: 'Voluntary',
    applicabilityTypeHi: 'नागरिक सेवा (Public Service)',
  },
};

// ─── Roadmap Steps (LED / IS 16102) ──────────────────────────────────────────
const roadmapSteps: RoadmapStep[] = [
  {
    number: '01',
    title: 'Identify Applicable Standard',
    titleHi: 'लागू मानक पहचानें',
    description: 'Confirm that IS 16102 (Part 1:2026 – Safety; Part 2:2012 – Performance) applies to your LED lamp product.',
    descriptionHi: 'पुष्टि करें कि IS 16102 (Part 1:2026 – सुरक्षा; Part 2:2012 – प्रदर्शन) आपके LED लैंप उत्पाद पर लागू होता है।',
    duration: '—',
    evidenceNote: 'BIS LED Series & LIMS · IS 16102',
    evidenceNoteHi: 'BIS LED सीरीज़ व LIMS · IS 16102',
  },
  {
    number: '02',
    title: 'Check Scheme / Regulatory Status',
    titleHi: 'योजना / विनियामक स्थिति जाँचें',
    description: 'LED lamps fall under the Compulsory Registration Scheme (CRS) via MeitY statutory order. Confirm scope applicability for your specific product rating via the BIS portal.',
    descriptionHi: 'MeitY वैधानिक आदेश के तहत LED लैंप Compulsory Registration Scheme (CRS) में आते हैं। BIS पोर्टल पर अपने उत्पाद की स्कोप पुष्टि करें।',
    duration: '—',
    evidenceNote: 'MeitY CRO & BIS Product Certification Portal',
    evidenceNoteHi: 'MeitY CRO व BIS उत्पाद प्रमाणन पोर्टल',
  },
  {
    number: '03',
    title: 'Product Testing at BIS Laboratory',
    titleHi: 'BIS प्रयोगशाला में उत्पाद परीक्षण',
    description: 'Test at a BIS-recognised laboratory as per IS 16102 (Part 1):2026 for safety and IS 16102 (Part 2):2012 for performance.',
    descriptionHi: 'BIS से मान्यता प्राप्त प्रयोगशाला में IS 16102 (Part 1):2026 सुरक्षा और IS 16102 (Part 2):2012 प्रदर्शन के अनुसार जाँच करें।',
    duration: '10–15 working days*',
    evidenceNote: 'IS 16102 (Part 1):2026 & (Part 2):2012 · * Indicative only; confirm with your lab',
    evidenceNoteHi: 'IS 16102 (Part 1):2026 & (Part 2):2012 · * अनुमानित; अपनी प्रयोगशाला से पुष्टि करें',
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
        text: 'नमस्ते! मैं SahayakBIS हूँ — भारतीय मानकों और सेवाओं के लिए संवादात्मक बुद्धिमत्ता।',
        answerText: 'नमस्ते! मैं SahayakBIS हूँ — भारतीय मानकों, अनिवार्य प्रमाणन, परीक्षण और उपभोक्ता सेवाओं के लिए साक्ष्य-आधारित मार्गदर्शन सहायक।',
        nextStep: 'अपने उत्पाद के लिए लागू मानक, अनिवार्य QCO आवश्यकता, अनुपालन रोडमैप या हॉलमार्किंग के बारे में पूछें।',
        followUpsHi: [
          'मैं अपने उत्पाद के लिए लागू BIS मानक कैसे खोजूँ?',
          'मैं कैसे जाँचूँ कि कोई BIS आवश्यकता लागू होती है?',
          'मुझे BIS अनुपालन रोडमैप बनाने का तरीका बताएं।',
          'उत्पाद सत्यापन में कौन सी BIS सेवाएं मदद कर सकती हैं?',
        ],
      },
    ]
    : [
      {
        id: 1,
        role: 'assistant',
        text: 'Hello! I am SahayakBIS — conversational intelligence for Indian Standards & BIS services.',
        answerText: 'Hello! I am SahayakBIS — an evidence-grounded intelligence layer for navigating Indian Standards, mandatory certification requirements, lab testing, and BIS services.',
        nextStep: 'Ask any question about standard discovery, statutory QCO requirements, compliance roadmaps, or product verification.',
        followUps: [
          'How do I find the applicable BIS standard for my product?',
          'How can I check whether a BIS requirement applies?',
          'Show me how to build a BIS compliance roadmap.',
          'What BIS services can help me verify a product?',
        ],
      },
    ];
}

// ─── Language Detection (preserved exactly) ──────────────────────────────────
// ─── Language Detection (Accurate English / Devanagari Hindi / Hinglish) ──────
function classifyQueryLanguage(text: string): 'Hindi' | 'English' | 'Hinglish' {
  if (/[\u0900-\u097F]/.test(text)) return 'Hindi';

  const lower = text.toLowerCase();
  const words = lower.split(/[^a-zA-Z0-9]+/).filter(Boolean);

  // Unambiguous romanized Hindi words (zero collision with standard English words)
  const strongHinglishWords = new Set([
    'muje', 'mujhe', 'humko', 'hume', 'mera', 'meri', 'mere', 'apna', 'apni', 'apne',
    'karna', 'kare', 'karen', 'karo', 'karta', 'karti', 'karte', 'karne', 'karwaya', 'karwaye',
    'konse', 'kaunsa', 'kaunse', 'kaunsi', 'konsi', 'kaun', 'kisko', 'kiske',
    'kya', 'kyu', 'kyun', 'kaise', 'kese',
    'hoga', 'hogi', 'hoge', 'hoti', 'hota', 'hote', 'hoon', 'hai', 'hain',
    'batao', 'bataye', 'batayein', 'bataiye', 'boliye', 'bolo',
    'chahiye', 'chahie', 'chahta', 'chahti',
    'nhi', 'nahi',
    'kitna', 'kitne', 'kitni', 'kahan', 'kaha',
    'zaroorat', 'zarurat', 'zaruri', 'zaroori',
    'kharidna', 'khareedna', 'bechna', 'shuru',
    'wali', 'wala', 'wale', 'baare', 'bare', 'liye', 'kholna',
    'milega', 'milegi', 'bante', 'banata', 'lagta', 'lagti', 'hona',
  ]);

  // Contextual particles that require at least two occurrences or companion indicators
  const contextualHinglishWords = new Set(['ka', 'ki', 'ke', 'ko', 'mein']);

  let strongCount = 0;
  let contextualCount = 0;
  for (const w of words) {
    if (strongHinglishWords.has(w)) strongCount++;
    if (contextualHinglishWords.has(w)) contextualCount++;
  }

  if (strongCount >= 1 || contextualCount >= 2) return 'Hinglish';
  return 'English';
}

// ─── Query Taxonomy & Classification ─────────────────────────────────────────
type ProductScope = 'LED' | 'GOLD' | 'SILVER' | 'GENERIC_BIS' | 'UNKNOWN_PRODUCT' | 'NONE';
type UserIntent =
  | 'DISCOVER_STANDARD'
  | 'REQUIREMENT_CHECK'
  | 'ROADMAP_REQUEST'
  | 'VERIFY_HALLMARK_HUID'
  | 'EXPLAIN_FINENESS'
  | 'GENERIC_FIND_STANDARD'
  | 'GENERIC_REQUIREMENT_CHECK'
  | 'GENERIC_ROADMAP'
  | 'GENERIC_TESTING_INFO'
  | 'GENERIC_SERVICES_OVERVIEW'
  | 'ADVERSARIAL_GUARANTEE'
  | 'UNKNOWN_PRODUCT_QUERY'
  | 'OUT_OF_SCOPE';

interface QueryClassification {
  scope: ProductScope;
  intent: UserIntent;
  unknownProductTerm?: string;
}

function classifyUserQuery(question: string): QueryClassification {
  const norm = question.toLowerCase();

  // 1. Adversarial / Guarantee Demands / Direct Certification Claims
  const isAdversarial =
    norm.includes('guarantee') ||
    norm.includes('warranty') ||
    norm.includes('will my product pass') ||
    norm.includes('can you certify') ||
    norm.includes('certify my') ||
    norm.includes('certify our') ||
    norm.includes('issue certificate') ||
    norm.includes('give me certificate') ||
    norm.includes('100% compliant') ||
    norm.includes('zero risk') ||
    question.includes('गारंटी') ||
    question.includes('वारंटी') ||
    question.includes('सर्टिफिकेट दें') ||
    question.includes('पास होने की गारंटी') ||
    question.includes('प्रमाणपत्र जारी');

  if (isAdversarial) {
    return { scope: 'NONE', intent: 'ADVERSARIAL_GUARANTEE' };
  }

  // 2. Unknown Product Query (out of pilot scope)
  const unknownProducts = [
    { en: 'electric blanket', hi: 'इलेक्ट्रिक कंबल' },
    { en: 'blanket', hi: 'कंबल' },
    { en: 'cement', hi: 'सीमेंट' },
    { en: 'solar panel', hi: 'सोलर पैनल' },
    { en: 'solar', hi: 'सौर' },
    { en: 'steel', hi: 'स्टील' },
    { en: 'iron', hi: 'लोहा' },
    { en: 'helmet', hi: 'हेलमेट' },
    { en: 'plywood', hi: 'प्लाईवुड' },
    { en: 'water bottle', hi: 'पानी की बोतल' },
    { en: 'packaged water', hi: 'पैकेज्ड पानी' },
    { en: 'toy', hi: 'खिलौना' },
    { en: 'toys', hi: 'खिलौने' },
    { en: 'battery', hi: 'बैटरी' },
    { en: 'medical device', hi: 'चिकित्सा उपकरण' },
    { en: 'fire extinguisher', hi: 'अग्निशामक' },
    { en: 'cable', hi: 'तार' },
    { en: 'cables', hi: 'केबल' },
    { en: 'shoe', hi: 'जूता' },
    { en: 'shoes', hi: 'जूते' },
    { en: 'footwear', hi: 'फुटवियर' },
    { en: 'tyre', hi: 'टायर' },
    { en: 'tyres', hi: 'टायर्स' },
    { en: 'pvc pipe', hi: 'पाइप' },
    { en: 'air conditioner', hi: 'एसी' },
    { en: 'refrigerator', hi: 'फ्रिज' },
  ];

  for (const item of unknownProducts) {
    if (norm.includes(item.en) || question.includes(item.hi)) {
      return { scope: 'UNKNOWN_PRODUCT', intent: 'UNKNOWN_PRODUCT_QUERY', unknownProductTerm: item.en };
    }
  }

  // 3. Product Scope Detection
  let scope: ProductScope = 'NONE';
  const hasLed =
    norm.includes('led') ||
    norm.includes('bulb') ||
    norm.includes('lamp') ||
    norm.includes('16102') ||
    norm.includes('lighting') ||
    norm.includes('luminaire') ||
    question.includes('बल्ब') ||
    question.includes('एलईडी') ||
    question.includes('लैंप');

  const hasGold =
    norm.includes('gold') ||
    norm.includes('24k') ||
    norm.includes('22k') ||
    norm.includes('18k') ||
    norm.includes('14k') ||
    norm.includes('karat') ||
    norm.includes('carat') ||
    norm.includes('1417') ||
    question.includes('सोना') ||
    question.includes('सोने') ||
    question.includes('स्वर्ण');

  const hasSilver =
    norm.includes('silver') ||
    norm.includes('2112') ||
    norm.includes('sterling') ||
    question.includes('चाँदी') ||
    question.includes('चांदी') ||
    question.includes('रजत');

  const hasHallmarkTerm =
    norm.includes('hallmark') ||
    norm.includes('huid') ||
    question.includes('हॉलमार्क') ||
    question.includes('हॉलमार्किंग');

  if (hasLed) {
    scope = 'LED';
  } else if (hasGold && !hasSilver) {
    scope = 'GOLD';
  } else if (hasSilver && !hasGold) {
    scope = 'SILVER';
  } else if (hasGold && hasSilver) {
    scope = 'GOLD';
  } else if (hasHallmarkTerm) {
    scope = 'GOLD';
  }

  // 3b. Generic BIS Intelligence Queries (Category-Agnostic Product Functions)
  const isGenericStandard =
    (norm.includes('find') && (norm.includes('standard') || norm.includes('applicable') || norm.includes('my product') || norm.includes('how do i find'))) ||
    (norm.includes('search') && norm.includes('standard')) ||
    (norm.includes('applicable') && norm.includes('standard')) ||
    question.includes('मानक कैसे खोजें') ||
    question.includes('लागू मानक') ||
    question.includes('मानक खोज');

  const isGenericRequirement =
    (norm.includes('requirement') && (norm.includes('check') || norm.includes('applies') || norm.includes('whether') || norm.includes('mandatory'))) ||
    norm.includes('is bis mandatory') ||
    norm.includes('when is bis mandatory') ||
    norm.includes('qco mandatory') ||
    question.includes('आवश्यकता कैसे जाँचें') ||
    question.includes('अनिवार्य आवश्यकता') ||
    question.includes('कब अनिवार्य');

  const isGenericRoadmap =
    (norm.includes('roadmap') && (norm.includes('build') || norm.includes('compliance') || norm.includes('certification pathway') || norm.includes('how to'))) ||
    norm.includes('certification journey') ||
    norm.includes('compliance lifecycle') ||
    norm.includes('certification pathway') ||
    question.includes('रोडमैप कैसे बनाएं') ||
    question.includes('प्रमाणन मार्ग') ||
    question.includes('अनुपालन रोडमैप');

  const isGenericTesting =
    (norm.includes('testing') && (norm.includes('information') || norm.includes('lab') || norm.includes('how') || norm.includes('where') || norm.includes('find'))) ||
    norm.includes('laboratory') ||
    norm.includes('lims') ||
    norm.includes('lrs') ||
    question.includes('परीक्षण जानकारी') ||
    question.includes('प्रयोगशाला') ||
    question.includes('जाँच कहाँ');

  const isGenericServices =
    (norm.includes('service') && (norm.includes('bis') || norm.includes('verify') || norm.includes('portal') || norm.includes('what are') || norm.includes('help me'))) ||
    norm.includes('verify a product') ||
    norm.includes('manakonline') ||
    norm.includes('bis care') ||
    question.includes('सेवाएं') ||
    question.includes('सत्यापित') ||
    question.includes('पोर्टल');

  if (isGenericStandard) return { scope: 'GENERIC_BIS', intent: 'GENERIC_FIND_STANDARD' };
  if (isGenericRequirement) return { scope: 'GENERIC_BIS', intent: 'GENERIC_REQUIREMENT_CHECK' };
  if (isGenericRoadmap) return { scope: 'GENERIC_BIS', intent: 'GENERIC_ROADMAP' };
  if (isGenericTesting) return { scope: 'GENERIC_BIS', intent: 'GENERIC_TESTING_INFO' };
  if (isGenericServices) return { scope: 'GENERIC_BIS', intent: 'GENERIC_SERVICES_OVERVIEW' };

  if (scope === 'NONE') {
    return { scope: 'NONE', intent: 'OUT_OF_SCOPE' };
  }

  // 4. Intent Detection within Scope
  const isRoadmap =
    norm.includes('roadmap') ||
    norm.includes('step') ||
    norm.includes('milestone') ||
    norm.includes('process') ||
    norm.includes('procedure') ||
    norm.includes('timeline') ||
    norm.includes('how to get certified') ||
    norm.includes('how to apply') ||
    question.includes('रोडमैप') ||
    question.includes('चरण') ||
    question.includes('प्रक्रिया') ||
    question.includes('प्रमाणन कैसे');

  const isRequirement =
    norm.includes('require') ||
    norm.includes('mandatory') ||
    norm.includes('compulsory') ||
    norm.includes('obligation') ||
    norm.includes('law') ||
    norm.includes('rule') ||
    norm.includes('need') ||
    norm.includes('crs') ||
    norm.includes('qco') ||
    question.includes('आवश्यक') ||
    question.includes('अनिवार्य') ||
    question.includes('नियम') ||
    question.includes('लागू');

  const isFineness =
    norm.includes('fineness') ||
    norm.includes('purity') ||
    norm.includes('grade') ||
    norm.includes('22k916') ||
    norm.includes('916') ||
    norm.includes('999') ||
    norm.includes('925') ||
    norm.includes('750') ||
    norm.includes('meaning') ||
    norm.includes('mean') ||
    norm.includes('stand for') ||
    question.includes('शुद्धता') ||
    question.includes('फाइननेस') ||
    question.includes('ग्रेड') ||
    question.includes('अर्थ') ||
    question.includes('मतलब');

  const isVerify =
    norm.includes('verify') ||
    norm.includes('check') ||
    norm.includes('authenticate') ||
    norm.includes('huid') ||
    norm.includes('bis care') ||
    norm.includes('app') ||
    norm.includes('laser') ||
    question.includes('सत्यापित') ||
    question.includes('जाँच') ||
    question.includes('जांच') ||
    question.includes('पहचान');

  if (isRoadmap) return { scope, intent: 'ROADMAP_REQUEST' };
  if (isRequirement) return { scope, intent: 'REQUIREMENT_CHECK' };
  if (isFineness) return { scope, intent: 'EXPLAIN_FINENESS' };
  if (isVerify) return { scope, intent: 'VERIFY_HALLMARK_HUID' };

  return { scope, intent: 'DISCOVER_STANDARD' };
}

// ─── Answer Engine (Grounded, Safe Abstention, No Hallucination) ──────────────
function getAnswer(question: string, currentLang: Language): ChatMessage {
  const queryLang = classifyQueryLanguage(question);

  // Hinglish rejection (strict policy)
  if (queryLang === 'Hinglish') {
    if (currentLang === 'Hindi') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'हिंग्लिश समर्थित नहीं है।',
        answerText: 'हिंग्लिश (Hinglish) समर्थित नहीं है।',
        nextStep: 'SahayakBIS केवल शुद्ध अंग्रेज़ी (English) या हिन्दी (देवनागरी लिपि) में प्रश्नों का उत्तर देता है। कृपया अपना प्रश्न शुद्ध अंग्रेज़ी या हिन्दी में पूछें।',
        citation: 'असमर्थित भाषा · केवल English या हिन्दी',
        hinglish: true,
      };
    }
    return {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'Hinglish is not supported.',
      answerText: 'Hinglish is not supported.',
      nextStep: 'SahayakBIS only provides responses in standard English or Hindi (हिन्दी). Please ask your question in standard English or Hindi (Devanagari script).',
      citation: 'Unsupported language · English or Hindi only',
      hinglish: true,
    };
  }

  const answerLang: Language = queryLang === 'Hindi' ? 'Hindi' : 'English';
  const classification = classifyUserQuery(question);

  // 1. Adversarial Guarantee or Direct Certification Demands
  if (classification.intent === 'ADVERSARIAL_GUARANTEE') {
    if (answerLang === 'Hindi') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'SahayakBIS एक मार्गदर्शन सहायक है, प्रमाणन निकाय नहीं।',
        answerText: 'SahayakBIS एक साक्ष्य-आधारित मार्गदर्शन सहायक है, कोई प्रमाणन प्राधिकरण, परीक्षण प्रयोगशाला या अनुमोदन निकाय नहीं। SahayakBIS किसी उत्पाद या कारखाने के लिए BIS प्रमाणन की गारंटी नहीं दे सकता और न ही प्रमाण पत्र जारी कर सकता है। सभी आधिकारिक अनुरूपता मूल्यांकन और लाइसेंस केवल भारतीय मानक ब्यूरो (BIS) और मान्यता प्राप्त प्रयोगशालाओं द्वारा प्रदान किए जाते हैं।',
        nextStep: 'आधिकारिक प्रमाणन प्रक्रिया शुरू करने के लिए BIS से मान्यता प्राप्त प्रयोगशाला में नमूना भेजें और आधिकारिक BIS पोर्टल पर आवेदन करें।',
        nextStepUrl: 'https://www.bis.gov.in/product-certification/online-information/',
        followUpsHi: [
          'LED बल्ब के लिए कौन सा BIS मानक लागू होता है?',
          'LED लैंप के लिए BIS प्रमाणन आवश्यकता क्या है?',
          'सोने की हॉलमार्किंग और HUID कैसे जाँचें?',
        ],
        citation: 'प्राधिकरण अस्वीकरण · BIS एकमात्र प्रमाणन निकाय है',
        abstention: true,
      };
    }
    return {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'SahayakBIS is an AI guidance companion, not a certification authority.',
      answerText: 'SahayakBIS is an evidence-grounded AI guidance companion, not a certification body, testing laboratory, or approval engine. SahayakBIS cannot grant compliance certificates, issue exemptions, or guarantee that any product, sample, or factory will pass BIS conformity assessment. All official conformity assessment, testing, and licensing are exclusively conducted by the Bureau of Indian Standards (BIS) and BIS-recognized laboratories.',
      nextStep: 'To initiate official conformity assessment, submit product samples to a BIS-recognized laboratory and apply via the official BIS portal.',
      nextStepUrl: 'https://www.bis.gov.in/product-certification/online-information/',
      followUps: [
        'Which BIS standard applies to LED bulbs?',
        'What is the BIS certification requirement for LED lamps?',
        'How do I verify gold hallmarking & HUID?',
      ],
      citation: 'Authority Notice · BIS is the sole certification authority',
      abstention: true,
    };
  }

  // 2. Unknown Product (Out of pilot scope)
  if (classification.intent === 'UNKNOWN_PRODUCT_QUERY') {
    const prodName = classification.unknownProductTerm || 'this product';
    if (answerLang === 'Hindi') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'यह उत्पाद वर्तमान प्रायोगिक दायरे से बाहर है।',
        answerText: 'इस प्रोटोटाइप प्रदर्शन में, SahayakBIS तीन प्रायोगिक मानक श्रेणियों पर केंद्रित है: LED लैंप (IS 16102), स्वर्ण हॉलमार्किंग (IS 1417), और रजत हॉलमार्किंग (IS 2112)। अन्य उत्पादों (जैसे कि आपका पूछा गया उत्पाद) के लिए लागू मानक और अनिवार्य QCO आधिकारिक BIS पोर्टल पर उपलब्ध हैं।',
        nextStep: 'लागू भारतीय मानक (IS संख्या) खोजने के लिए आधिकारिक BIS पोर्टल या BIS CARE ऐप पर खोजें।',
        nextStepUrl: BIS_PORTAL_URL,
        followUpsHi: [
          'LED बल्ब के लिए कौन सा BIS मानक लागू होता है?',
          'सोने की हॉलमार्किंग और HUID कैसे जाँचें?',
          'चाँदी की हॉलमार्किंग मानक (IS 2112)',
        ],
        citation: 'दायरा सीमा · केवल LED, स्वर्ण और रजत प्रायोगिक श्रेणी',
        abstention: true,
      };
    }
    return {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'This product is outside the current prototype pilot scope.',
      answerText: `In this prototype demonstration, SahayakBIS is specifically grounded on three pilot standard categories: Self-Ballasted LED Lamps (IS 16102), Gold Hallmarking (IS 1417), and Silver Hallmarking (IS 2112). For other products (such as ${prodName}), standards and mandatory Quality Control Orders (QCOs) are published on the official BIS Standards Directory.`,
      nextStep: 'Search for the applicable Indian Standard (IS number) on the official BIS portal or consult the BIS CARE app.',
      nextStepUrl: BIS_PORTAL_URL,
      followUps: [
        'Which BIS standard applies to LED bulbs?',
        'How do I verify gold hallmarking & HUID?',
        'What are the silver hallmarking standards (IS 2112)?',
      ],
      citation: 'Scope Boundary · LED, Gold & Silver pilot categories',
      abstention: true,
    };
  }

  // 3. Out of Scope non-standards query
  if (classification.intent === 'OUT_OF_SCOPE') {
    if (answerLang === 'Hindi') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'सत्यापित BIS स्रोत नहीं मिला।',
        answerText: 'इस प्रश्न के लिए पर्याप्त सत्यापित BIS साक्ष्य नहीं मिले। SahayakBIS केवल भारतीय मानकों और BIS विनियामक सेवाओं (वर्तमान में LED लैंप, सोना और चाँदी) के मार्गदर्शन के लिए समर्पित है।',
        nextStep: 'भारतीय मानकों (जैसे LED के लिए IS 16102, सोने के लिए IS 1417, या चाँदी के लिए IS 2112) के बारे में प्रश्न पूछें।',
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
      answerText: 'I could not find verified BIS evidence to answer that question. SahayakBIS is strictly dedicated to Indian Standards and BIS regulatory guidance, currently demonstrating LED Lamps (IS 16102), Gold Hallmarking (IS 1417), and Silver Hallmarking (IS 2112).',
      nextStep: 'Please ask a question regarding Indian Standards, certification requirements, or precious metals hallmarking.',
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

  // 3c. Generic BIS Platform Guidance (Category-Agnostic Product Functions)
  if (classification.scope === 'GENERIC_BIS') {
    if (answerLang === 'Hindi') {
      if (classification.intent === 'GENERIC_FIND_STANDARD') {
        return {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'लागू भारतीय मानक (IS) खोजने की प्रक्रिया।',
          answerText: 'अपने उत्पाद के लिए लागू भारतीय मानक (IS) खोजने के लिए, मानकऑनलाइन (e-BIS) पर आधिकारिक BIS मानक निर्देशिका का उपयोग करें। उत्पादों को 14 तकनीकी डिवीजनों (जैसे विद्युत तकनीकी ETD, यांत्रिक MED, रासायनिक CHD, खाद्य FAD आदि) में वर्गीकृत किया जाता है। प्रत्येक मानक उत्पाद विनिर्देशों, परीक्षण विधियों, सुरक्षा सहनशीलता और अंकन आवश्यकताओं को परिभाषित करता है।',
          evidenceTitle: 'BIS मानक निर्देशिका (मानकऑनलाइन e-BIS)',
          evidenceIsNumber: 'Bureau of Indian Standards · Standards Catalogue',
          evidenceUrl: MANAKONLINE_URL,
          evidenceDetail: EVIDENCE_DATABASE['BIS_DIRECTORY'],
          nextStep: 'उत्पाद कीवर्ड द्वारा मानक निर्देशिका में खोजें या प्रदर्शित उत्पादों (जैसे LED लैंप या स्वर्ण आभूषण) के कार्यप्रवाह देखें।',
          nextStepUrl: MANAKONLINE_URL,
          followUpsHi: [
            'LED बल्ब के लिए कौन सा BIS मानक लागू होता है?',
            'मैं कैसे जाँचूँ कि कोई BIS आवश्यकता लागू होती है?',
            'मुझे BIS अनुपालन रोडमैप बनाने का तरीका बताएं।',
          ],
          citation: 'BIS मानक निर्देशिका · मानकऑनलाइन e-BIS',
          sourceUrl: MANAKONLINE_URL,
        };
      }
      if (classification.intent === 'GENERIC_REQUIREMENT_CHECK') {
        return {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'BIS प्रमाणन अनिवार्यता की जाँच का विनियामक नियम।',
          answerText: 'भारत में भारतीय मानक डिफ़ॉल्ट रूप से स्वैच्छिक होते हैं। कोई मानक तब अनिवार्य बनता है जब केंद्र सरकार के संबंधित मंत्रालय (जैसे DPIIT, MeitY आदि) BIS अधिनियम 2016 की धारा 16 के तहत गुणवत्ता नियंत्रण आदेश (QCO) या अनिवार्य पंजीकरण आदेश (CRO) जारी करते हैं। जब कोई उत्पाद QCO में शामिल होता है, तो वैध BIS प्रमाणन/पंजीकरण के बिना निर्माण, आयात या बिक्री कानूनन दंडनीय है।',
          evidenceTitle: 'अनिवार्य गुणवत्ता नियंत्रण आदेश (QCO) निर्देशिका',
          evidenceIsNumber: 'Quality Control Orders (QCO) Register · Section 16 BIS Act',
          evidenceUrl: BIS_PORTAL_URL,
          evidenceDetail: EVIDENCE_DATABASE['BIS_QCO_FRAMEWORK'],
          nextStep: 'आधिकारिक BIS पोर्टल पर केंद्रीय QCO रजिस्टर में अपने उत्पाद की जाँच करें, या किसी विशिष्ट उत्पाद की अनिवार्यता पूछें।',
          nextStepUrl: BIS_PORTAL_URL,
          followUpsHi: [
            'LED लैंप के लिए BIS प्रमाणन आवश्यकता क्या है?',
            'सोने की हॉलमार्किंग और HUID कैसे जाँचें?',
            'मुझे BIS अनुपालन रोडमैप बनाने का तरीका बताएं।',
          ],
          citation: 'BIS विनियामक आदेश · QCO रजिस्ट्री',
          sourceUrl: BIS_PORTAL_URL,
        };
      }
      if (classification.intent === 'GENERIC_ROADMAP') {
        return {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'साक्ष्य-आधारित BIS प्रमाणन व अनुपालन रोडमैप।',
          answerText: 'एक मानक BIS अनुरूपता यात्रा साक्ष्य-आधारित अनुपालन चरणों का पालन करती है: 1) लागू मानक व दायरे की पहचान, 2) विनियामक स्थिति सत्यापन (स्वैच्छिक योजना-I बनाम अनिवार्य QCO बनाम योजना-II CRS), 3) BIS-मान्यता प्राप्त लैब में उत्पाद परीक्षण, 4) दस्तावेज़ व परीक्षण रिपोर्ट संकलन, और 5) ऑनलाइन पोर्टल पर आवेदन, कारखाना निरीक्षण (योजना-I) तथा लाइसेंस/पंजीकरण व मानक चिह्न प्राप्ति।',
          evidenceTitle: 'BIS अनुरूपता मूल्यांकन ढांचा (विनियम 2018)',
          evidenceIsNumber: 'BIS Conformity Assessment Regulations · Lifecycle Framework',
          evidenceUrl: BIS_PORTAL_URL,
          evidenceDetail: EVIDENCE_DATABASE['BIS_DIRECTORY'],
          nextStep: 'प्रदर्शित 5-चरणीय अनुपालन रोडमैप देखने के लिए नीचे का बटन दबाएँ या मानकऑनलाइन पोर्टल पर आवेदन प्रक्रिया देखें।',
          nextStepUrl: BIS_PORTAL_URL,
          followUpsHi: [
            'LED बल्ब BIS प्रमाणन रोडमैप देखें',
            'परीक्षण संबंधी जानकारी कैसे प्राप्त करें?',
            'उत्पाद सत्यापन में कौन सी BIS सेवाएं मदद कर सकती हैं?',
          ],
          citation: 'BIS अनुरूपता मूल्यांकन ढांचा · योजना I व II',
          sourceUrl: BIS_PORTAL_URL,
          roadmap: true,
        };
      }
      if (classification.intent === 'GENERIC_TESTING_INFO') {
        return {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'BIS अनुरूपता के लिए प्रयोगशाला परीक्षण की प्रक्रिया।',
          answerText: 'BIS अनुरूपता मूल्यांकन के लिए उत्पाद परीक्षण विशेष रूप से BIS प्रयोगशाला मान्यता योजना (LRS) के तहत मान्यता प्राप्त प्रयोगशालाओं या BIS की केंद्रीय/क्षेत्रीय प्रयोगशालाओं में किया जाना आवश्यक है। प्रयोगशालाएं संबंधित भारतीय मानक में निर्धारित भौतिक, विद्युत, रासायनिक और टिकाऊपन मापदंडों के अनुसार नमूनों की जाँच करती हैं और आधिकारिक परीक्षण रिपोर्ट (Test Report) जारी करती हैं।',
          evidenceTitle: 'BIS प्रयोगशाला मान्यता योजना (LRS)',
          evidenceIsNumber: 'Laboratory Recognition Scheme (LRS) · LIMS Portal',
          evidenceUrl: BIS_PORTAL_URL,
          evidenceDetail: EVIDENCE_DATABASE['BIS_LRS_TESTING'],
          nextStep: 'मान्यता प्राप्त प्रयोगशालाओं की सूची और परीक्षण मापदंड देखने के लिए BIS LIMS पोर्टल पर जाएँ।',
          nextStepUrl: BIS_PORTAL_URL,
          followUpsHi: [
            'LED लैंप के लिए कौन से परीक्षण आवश्यक हैं?',
            'मुझे BIS अनुपालन रोडमैप बनाने का तरीका बताएं।',
            'मैं अपने उत्पाद के लिए लागू BIS मानक कैसे खोजूँ?',
          ],
          citation: 'BIS LRS प्रयोगशाला नेटवर्क · LIMS',
          sourceUrl: BIS_PORTAL_URL,
        };
      }
      // GENERIC_SERVICES_OVERVIEW
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'आधिकारिक BIS डिजिटल सेवाएं और सत्यापन मंच।',
        answerText: 'भारतीय मानक ब्यूरो नागरिकों और उद्योगों के लिए चार प्रमुख डिजिटल सेवाएं संचालित करता है: 1) मानकऑनलाइन (e-BIS): मानक खोज, लाइसेंस आवेदन व नवीनीकरण पोर्टल, 2) CRS पोर्टल: इलेक्ट्रॉनिक्स व IT उत्पादों के अनिवार्य पंजीकरण का मंच, 3) BIS CARE मोबाइल ऐप: ISI मार्क लाइसेंस और 6-अंकीय हॉलमार्किंग HUID के त्वरित सत्यापन व शिकायत दर्ज करने का ऐप, और 4) अपने मानक जानें: प्रकाशित मानकों को पढ़ने की निःशुल्क सेवा।',
        evidenceTitle: 'BIS डिजिटल सेवा तंत्र (e-BIS, CRS, BIS CARE)',
        evidenceIsNumber: 'BIS Citizen & Industry Digital Ecosystem',
        evidenceUrl: BIS_PORTAL_URL,
        evidenceDetail: EVIDENCE_DATABASE['BIS_SERVICES_CITIZEN'],
        nextStep: 'नागरिक सत्यापन के लिए BIS CARE मोबाइल ऐप डाउनलोड करें या उद्योग सेवाओं के लिए manakonline.in पर जाएँ।',
        nextStepUrl: BIS_PORTAL_URL,
        followUpsHi: [
          'सोने की हॉलमार्किंग और HUID कैसे जाँचें?',
          'मैं अपने उत्पाद के लिए लागू BIS मानक कैसे खोजूँ?',
          'मैं कैसे जाँचूँ कि कोई BIS आवश्यकता लागू होती है?',
        ],
        citation: 'BIS आधिकारिक सेवा पोर्टल · e-BIS व BIS CARE',
        sourceUrl: BIS_PORTAL_URL,
      };
    }

    // English responses for GENERIC_BIS
    if (classification.intent === 'GENERIC_FIND_STANDARD') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'How to discover the applicable Indian Standard for your product.',
        answerText: 'To find the applicable Indian Standard (IS) for your product, consult the official BIS Standards Directory on Manakonline (e-BIS). Products in India are categorized under 14 technical divisions (Electrotechnical ETD, Mechanical MED, Chemical CHD, Food FAD, Metallurgical MTD, etc.) and assigned a specific standard number. Each standard defines comprehensive product specifications, safety tolerances, performance thresholds, and sampling methodologies.',
        evidenceTitle: 'BIS Standards Directory (Manakonline e-BIS)',
        evidenceIsNumber: 'Bureau of Indian Standards · Standards Catalogue',
        evidenceUrl: MANAKONLINE_URL,
        evidenceDetail: EVIDENCE_DATABASE['BIS_DIRECTORY'],
        nextStep: 'Search your product nomenclature in the BIS Standards Directory on Manakonline, or inspect representative workflows below (such as LED lamps or Gold jewellery).',
        nextStepUrl: MANAKONLINE_URL,
        followUps: [
          'Which BIS standard applies to LED bulbs?',
          'How can I check whether a BIS requirement applies?',
          'Show me how to build a BIS compliance roadmap.',
        ],
        citation: 'BIS Standards Directory · Manakonline e-BIS',
        sourceUrl: MANAKONLINE_URL,
      };
    }
    if (classification.intent === 'GENERIC_REQUIREMENT_CHECK') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Regulatory criteria determining mandatory BIS certification.',
        answerText: 'In India, an Indian Standard is voluntary by default unless the Central Government mandates it via a statutory Quality Control Order (QCO) or Compulsory Registration Order (CRO). Mandatory compliance is enforced under Section 16 of the BIS Act, 2016 by relevant line Ministries (such as DPIIT, MeitY, or Ministry of Consumer Affairs). Once a product is notified under a QCO or CRO, manufacturing, importing, distributing, or selling it without valid BIS certification or registration is legally prohibited.',
        evidenceTitle: 'Mandatory Quality Control Orders (QCO) Register',
        evidenceIsNumber: 'Quality Control Orders (QCO) Register · Section 16 BIS Act',
        evidenceUrl: BIS_PORTAL_URL,
        evidenceDetail: EVIDENCE_DATABASE['BIS_QCO_FRAMEWORK'],
        nextStep: 'Check the central QCO register on the official BIS portal or ask about a specific product (e.g. "Is BIS certification required for LED lamps?").',
        nextStepUrl: BIS_PORTAL_URL,
        followUps: [
          'Is BIS certification required for LED lamps?',
          'How do I verify gold hallmarking & HUID?',
          'Show me how to build a BIS compliance roadmap.',
        ],
        citation: 'BIS Regulatory Framework · QCO Register',
        sourceUrl: BIS_PORTAL_URL,
      };
    }
    if (classification.intent === 'GENERIC_ROADMAP') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Evidence-grounded BIS compliance roadmap.',
        answerText: 'A structured BIS conformity journey typically follows an evidence-grounded roadmap: 1) Identify Applicable Standard & Scope, 2) Verify Regulatory Scheme Applicability (Voluntary ISI Scheme I vs Mandatory QCO vs Scheme II CRS), 3) Execute Conformity Testing at a BIS-Recognized Lab, 4) Compile Technical Dossier & Portal Application (Manakonline or CRS portal), and 5) Scrutiny/Factory Audit followed by grant of license/registration and standard mark application.',
        evidenceTitle: 'BIS Conformity Assessment Regulations (2018)',
        evidenceIsNumber: 'BIS Conformity Assessment Regulations · Lifecycle Framework',
        evidenceUrl: BIS_PORTAL_URL,
        evidenceDetail: EVIDENCE_DATABASE['BIS_DIRECTORY'],
        nextStep: 'Open the interactive 5-stage demonstration roadmap for LED lamps, or proceed to the official BIS portal to initiate an enterprise application.',
        nextStepUrl: BIS_PORTAL_URL,
        followUps: [
          'Show me the BIS compliance roadmap for LED lamps.',
          'How can I find the relevant testing information?',
          'What BIS services can help me verify a product?',
        ],
        citation: 'BIS Conformity Assessment Regulations · Schemes I & II',
        sourceUrl: BIS_PORTAL_URL,
        roadmap: true,
      };
    }
    if (classification.intent === 'GENERIC_TESTING_INFO') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Laboratory testing requirements for BIS conformity.',
        answerText: 'Product testing for BIS conformity assessment must be executed exclusively at testing laboratories officially recognized under the BIS Laboratory Recognition Scheme (LRS) or BIS\'s own Central and Regional Laboratories. Recognized labs evaluate product test samples against the physical, electrical, chemical, and durability parameters prescribed in the specific Indian Standard, generating the formal test report required for application.',
        evidenceTitle: 'BIS Laboratory Recognition Scheme (LRS)',
        evidenceIsNumber: 'Laboratory Recognition Scheme (LRS) · LIMS Portal',
        evidenceUrl: BIS_PORTAL_URL,
        evidenceDetail: EVIDENCE_DATABASE['BIS_LRS_TESTING'],
        nextStep: 'Locate authorized testing facilities and test parameters on the official BIS Laboratory Information Management System (LIMS).',
        nextStepUrl: BIS_PORTAL_URL,
        followUps: [
          'What testing is required under IS 16102?',
          'Show me how to build a BIS compliance roadmap.',
          'How do I find the applicable BIS standard for my product?',
        ],
        citation: 'BIS Laboratory Network · LRS & LIMS',
        sourceUrl: BIS_PORTAL_URL,
      };
    }
    // GENERIC_SERVICES_OVERVIEW
    return {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'Official BIS citizen and enterprise digital services.',
      answerText: 'The Bureau of Indian Standards operates several official digital services for citizens and enterprises: 1) Manakonline (e-BIS): Enterprise portal for standard discovery, licensing, and renewals, 2) CRS Portal: Dedicated portal for compulsory IT & electronics registration, 3) BIS CARE Mobile App: Official mobile app for citizens to verify ISI marks, authenticate 6-digit hallmarking HUIDs, and lodge complaints, and 4) Know Your Standards: Public portal to read published Indian Standards.',
      evidenceTitle: 'BIS Digital Services Ecosystem (e-BIS, CRS, BIS CARE)',
      evidenceIsNumber: 'BIS Citizen & Industry Digital Ecosystem',
      evidenceUrl: BIS_PORTAL_URL,
      evidenceDetail: EVIDENCE_DATABASE['BIS_SERVICES_CITIZEN'],
      nextStep: 'Download the official BIS CARE mobile application from the app store or visit the official BIS portal at bis.gov.in.',
      nextStepUrl: BIS_PORTAL_URL,
      followUps: [
        'How do I verify a 6-digit HUID on gold jewellery?',
        'How do I find the applicable BIS standard for my product?',
        'How can I check whether a BIS requirement applies?',
      ],
      citation: 'BIS Official Digital Services · e-BIS & BIS CARE',
      sourceUrl: BIS_PORTAL_URL,
    };
  }

  // 4. LED Lamp Category (IS 16102)
  if (classification.scope === 'LED') {
    if (answerLang === 'Hindi') {
      let hiAnswer = 'सामान्य प्रकाश व्यवस्था के लिए सेल्फ-बैलेस्टेड LED लैंप भारतीय मानक IS 16102 के अंतर्गत आते हैं। वर्तमान आधिकारिक BIS LIMS रिकॉर्ड के अनुसार सुरक्षा आवश्यकताओं के लिए लागू मानक IS 16102 (Part 1):2026 (प्रथम संशोधन, 2012 संस्करण का स्थान लेते हुए) और प्रदर्शन आवश्यकताओं के लिए IS 16102 (Part 2):2012 है। विनियामक अंतर: भारतीय मानक तकनीकी विनिर्देश हैं; इस उत्पाद के लिए पंजीकरण MeitY के अनिवार्य पंजीकरण आदेश के तहत CRS योजना-II के माध्यम से वैधानिक रूप से अनिवार्य किया गया है।';
      if (classification.intent === 'ROADMAP_REQUEST') {
        hiAnswer = 'सामान्य प्रकाश व्यवस्था के लिए सेल्फ-बैलेस्टेड LED लैंप का BIS CRS अनुपालन मार्ग 5 प्रमुख चरणों का पालन करता है: 1) लागू मानक पहचान (IS 16102 Part 1:2026 व Part 2:2012), 2) MeitY विनियामक आदेश व CRS योजना सत्यापन, 3) मान्यता प्राप्त लैब में उत्पाद परीक्षण, 4) दस्तावेज़ तैयारी, और 5) BIS CRS पोर्टल पर ऑनलाइन पंजीकरण व R-number प्राप्ति। पूरा रोडमैप देखने के लिए नीचे का बटन दबाएँ।';
      } else if (classification.intent === 'REQUIREMENT_CHECK') {
        hiAnswer = 'हाँ, सेल्फ-बैलेस्टेड LED लैंप के लिए BIS पंजीकरण अनिवार्य है। ध्यान दें कि कोई भारतीय मानक स्वतः प्रमाणन को अनिवार्य नहीं बनाता; यह अनिवार्यता MeitY द्वारा अधिसूचित इलेक्ट्रॉनिक्स व सूचना प्रौद्योगिकी सामान (अनिवार्य पंजीकरण की आवश्यकता) आदेश द्वारा कानूनी रूप से लागू की गई है। निर्माताओं को IS 16102 (Part 1):2026 (सुरक्षा) और IS 16102 (Part 2):2012 (प्रदर्शन) के तहत मान्यता प्राप्त लैब में परीक्षण कराकर BIS CRS पोर्टल पर R-number प्राप्त करना अनिवार्य है।';
      }

      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'सेल्फ-बैलेस्टेड LED लैंप को CRS के अंतर्गत BIS पंजीकरण की आवश्यकता होती है।',
        answerText: hiAnswer,
        evidenceTitle: 'BIS LED सीरीज़ व LIMS — आधिकारिक मानक सूची',
        evidenceIsNumber: 'IS 16102 (Part 1):2026 · IS 16102 (Part 2):2012',
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

    let enAnswer = 'Self-ballasted LED lamps for general lighting services are governed by Indian Standard IS 16102. Under current official BIS LIMS records, the applicable standard for Safety Requirements is IS 16102 (Part 1):2026 (First Revision, superseding the 2012 initial edition), while Performance Requirements are covered under IS 16102 (Part 2):2012. Regulatory distinction: Indian Standards define technical specifications, whereas mandatory registration is enforced separately via statutory order (MeitY Compulsory Registration Order under Scheme II / CRS).';
    if (classification.intent === 'ROADMAP_REQUEST') {
      enAnswer = 'The BIS compliance pathway for self-ballasted LED lamps under the Compulsory Registration Scheme (CRS) follows a structured 5-stage roadmap: 1) Identify Applicable Standard (IS 16102 Part 1:2026 & Part 2:2012), 2) Check Statutory Order & CRS Applicability, 3) Sample Testing at BIS-Recognized Lab (Safety & Performance), 4) Prepare Application & Technical Documents, and 5) Portal Submission & R-number Grant. Click "View Certification Roadmap" below to explore each milestone.';
    } else if (classification.intent === 'REQUIREMENT_CHECK') {
      enAnswer = 'Yes, self-ballasted LED lamps require mandatory BIS registration. Importantly, an Indian Standard does not inherently make certification mandatory on its own; mandatory status is enforced separately by a statutory order — specifically the Electronics and Information Technology Goods (Requirement for Compulsory Registration) Order notified by MeitY. Under this order, lamps must be tested at a BIS-recognized laboratory against IS 16102 (Part 1):2026 for electrical safety and IS 16102 (Part 2):2012 for performance parameters, followed by registration on the BIS CRS portal to obtain a valid R-number before sale in India.';
    }

    return {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'Self-ballasted LED lamps require BIS registration under CRS.',
      answerText: enAnswer,
      evidenceTitle: 'BIS LED Series & LIMS — Official Standards List',
      evidenceIsNumber: 'IS 16102 (Part 1):2026 · IS 16102 (Part 2):2012',
      evidenceUrl: 'https://bis.gov.in/other/LEDSeries.pdf',
      evidenceDetail: EVIDENCE_DATABASE['IS 16102'],
      nextStep: 'View the step-by-step compliance roadmap for LED lamps, or proceed to the official BIS CRS portal to start your application.',
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

  // 5. Gold Category (IS 1417)
  if (classification.scope === 'GOLD') {
    if (classification.intent === 'EXPLAIN_FINENESS') {
      if (answerLang === 'Hindi') {
        return {
          id: Date.now() + 1,
          role: 'assistant',
          text: '22K916 का अर्थ 91.6% शुद्ध सोना है।',
          answerText: 'भारतीय मानक IS 1417:2016 के तहत सोने की शुद्धता को 6 मान्यता प्राप्त ग्रेडों में कैरेट और फाइननेस (प्रति हज़ार भाग) के रूप में व्यक्त किया जाता है: 24K999 (99.9% शुद्ध), 23K958 (95.8%), 22K916 (91.6% — पारंपरिक आभूषणों के लिए मानक), 20K833 (83.3%), 18K750 (75.0% — हीरे के आभूषणों के लिए), और 14K585 (58.5%)। 22K916 का अर्थ है 22 कैरेट सोना जिसमें प्रति 1000 भाग में 916 भाग शुद्ध सोना है।',
          evidenceTitle: 'BIS स्वर्ण हॉलमार्किंग मानक निर्देशिका',
          evidenceIsNumber: 'IS 1417:2016 (Gold & Gold Alloys)',
          evidenceUrl: HALLMARKING_FAQ_URL,
          evidenceDetail: EVIDENCE_DATABASE['IS 1417'],
          nextStep: 'खरीदते समय आभूषण पर BIS लोगो, 22K916 अंकन, और 6 अंकों का HUID कोड अवश्य देखें।',
          nextStepUrl: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en',
          followUpsHi: [
            '6-अंकीय HUID कोड कैसे काम करता है?',
            'सोने की हॉलमार्किंग और HUID कैसे जाँचें?',
            'मान्यता प्राप्त AHC परख केंद्र कहाँ खोजें?',
          ],
          citation: 'BIS स्वर्ण हॉलमार्किंग · IS 1417',
          sourceUrl: HALLMARKING_FAQ_URL,
        };
      }
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: '22K916 denotes 22 Karat gold with 91.6% purity.',
        answerText: 'Under Indian Standard IS 1417:2016, gold fineness is expressed in parts per thousand alongside karatage across 6 recognized grades: 24K999 (99.9% pure), 23K958 (95.8% pure), 22K916 (91.6% pure — standard for traditional jewellery), 20K833 (83.3% pure), 18K750 (75.0% pure — standard for diamond jewellery), and 14K585 (58.5% pure). For example, 22K916 indicates 22 Karat gold with 916 parts pure gold out of 1000.',
        evidenceTitle: 'BIS Gold Hallmarking Standards Directory',
        evidenceIsNumber: 'IS 1417:2016 (Gold & Gold Alloys)',
        evidenceUrl: HALLMARKING_FAQ_URL,
        evidenceDetail: EVIDENCE_DATABASE['IS 1417'],
        nextStep: 'When buying gold, always confirm all 3 marks: BIS Logo, Karat/Fineness (e.g., 22K916), and the 6-digit HUID code.',
        nextStepUrl: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en',
        followUps: [
          'How do I verify a 6-digit HUID on gold jewellery?',
          'What are the other gold fineness grades?',
          'Where can I find a BIS-recognised AHC?',
        ],
        citation: 'BIS Gold Hallmarking · IS 1417',
        sourceUrl: HALLMARKING_FAQ_URL,
      };
    }

    if (answerLang === 'Hindi') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'असली हॉलमार्क वाले सोने पर तीन अनिवार्य चिह्न होते हैं।',
        answerText: 'IS 1417 के तहत असली हॉलमार्क वाले सोने के आभूषण पर तीन अनिवार्य चिह्न होते हैं: 1) त्रिकोणीय BIS मानक चिह्न, 2) शुद्धता/फाइननेस ग्रेड (जैसे 22K916 या 18K750), और 3) 6 अंकों का लेज़र-उत्कीर्ण अल्फ़ान्यूमेरिक HUID कोड। प्रामाणिकता की लाइव जाँच उपभोक्ता सीधे आधिकारिक BIS CARE मोबाइल ऐप में "Verify HUID" विकल्प का उपयोग करके जौहरी का विवरण और हॉलमार्किंग तिथि से तुरंत सत्यापित कर सकते हैं।',
        evidenceTitle: 'BIS स्वर्ण हॉलमार्किंग FAQs व विनियम',
        evidenceIsNumber: 'IS 1417:2016 (Gold & Gold Alloys)',
        evidenceUrl: HALLMARKING_FAQ_URL,
        evidenceDetail: EVIDENCE_DATABASE['IS 1417'],
        nextStep: 'खरीदने से पहले HUID की जाँच आधिकारिक BIS CARE ऐप से करें। शुद्धता परीक्षण के लिए BIS मान्यता प्राप्त परख केंद्र (AHC) से संपर्क करें।',
        nextStepUrl: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en',
        followUpsHi: [
          '22K916 का क्या मतलब है?',
          '6-अंकीय HUID कोड कैसे काम करता है?',
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
      answerText: 'A genuine hallmarked gold article under IS 1417 carries three mandatory marks: 1) The BIS triangular standard mark, 2) Purity/Fineness grade (such as 22K916 or 18K750), and 3) a unique 6-digit laser-engraved alphanumeric HUID (Hallmark Unique Identification). Live consumer authenticity lookup is performed directly on the official BIS CARE mobile app using the "Verify HUID" feature, which displays jeweller registration and assaying details.',
      evidenceTitle: 'BIS Gold Hallmarking FAQs & Regulations',
      evidenceIsNumber: 'IS 1417:2016 (Gold & Gold Alloys)',
      evidenceUrl: HALLMARKING_FAQ_URL,
      evidenceDetail: EVIDENCE_DATABASE['IS 1417'],
      nextStep: 'Verify your gold jewellery HUID on the official BIS CARE mobile app before purchasing, or consult a registered Assaying & Hallmarking Centre (AHC).',
      nextStepUrl: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en',
      followUps: [
        'What does 22K916 mean?',
        'How does 6-digit HUID verification work?',
        'Where can I find a BIS-recognised AHC?',
      ],
      citation: 'BIS Gold Hallmarking · HUID',
      sourceUrl: HALLMARKING_FAQ_URL,
    };
  }

  // 6. Silver Category (IS 2112)
  if (answerLang === 'Hindi') {
    return {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'भारत में चाँदी की हॉलमार्किंग IS 2112 के तहत स्वैच्छिक है।',
      answerText: 'भारत में चाँदी के आभूषणों और कलाकृतियों की हॉलमार्किंग भारतीय मानक IS 2112 (Silver and Silver Alloys) के अंतर्गत आती है। BIS योजना के तहत चाँदी की हॉलमार्किंग वर्तमान में एक स्वैच्छिक (Voluntary) योजना है। हॉलमार्क वाली वस्तुओं पर तीन चिह्न होते हैं: BIS लोगो, शुद्धता/फाइननेस ग्रेड (जैसे 999, 970, 925 स्टर्लिंग सिल्वर, 900, 835, 800) और 6 अंकों का अल्फ़ान्यूमेरिक HUID कोड, जो उपभोक्ताओं को आधिकारिक तृतीय-पक्ष शुद्धता आश्वासन प्रदान करता है।',
      evidenceTitle: 'BIS रजत (चाँदी) हॉलमार्किंग FAQs व मानक',
      evidenceIsNumber: 'IS 2112:2014 (Silver & Silver Alloys)',
      evidenceUrl: HALLMARKING_FAQ_URL,
      evidenceDetail: EVIDENCE_DATABASE['IS 2112'],
      nextStep: 'चाँदी के HUID की जाँच BIS CARE ऐप से करें। यह उपभोक्ताओं को शुद्धता और प्रामाणिकता का आधिकारिक सत्यापन प्रदान करता है।',
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
    answerText: 'Silver hallmarking in India is governed by Indian Standard IS 2112 (Silver and Silver Alloys, Jewellery/Artefacts). Under the BIS Hallmarking Scheme, silver hallmarking is a voluntary scheme for jewellers. Compliant silver articles carry three marks: the BIS logo, purity/fineness grade (such as 999, 970, 925 for Sterling Silver, 900, 835, 800), and a six-digit alphanumeric HUID. Hallmarking provides third-party assurance of purity against adulteration.',
    evidenceTitle: 'BIS Silver Hallmarking FAQs & Standards',
    evidenceIsNumber: 'IS 2112:2014 (Silver & Silver Alloys)',
    evidenceUrl: HALLMARKING_FAQ_URL,
    evidenceDetail: EVIDENCE_DATABASE['IS 2112'],
    nextStep: 'Verify silver hallmarking details and registered Assaying & Hallmarking Centres (AHCs) via the BIS CARE mobile app.',
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
      addHistoryItem({
        query: trimmed,
        answerText: answer.answerText || answer.text,
        citation: answer.citation,
        sourceUrl: answer.sourceUrl,
        language,
        abstention: answer.abstention,
        hinglish: answer.hinglish,
      });
      setLoading(false);
      setLoadingStage(0);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 950);
  };

  const hasUserQueries = messages.some((m) => m.role === 'user') || loading;

  const resetToNewSearch = () => {
    setMessages(getSampleMessages(language));
    setQuestion('');
  };

  const loadSources = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('sahayakbis_sources').select('title,url,citation,summary').order('created_at');
    if (data && data.length > 0) setSources(data as Source[]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Product Header ── */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <ShieldCheck color="#E3A62F" size={20} strokeWidth={2.5} />
          </View>
          <View>
            <Text style={styles.brand}>
              Sahayak<Text style={styles.brandAccent}>BIS</Text>
            </Text>
            <Text style={styles.tagline}>
              {language === 'Hindi'
                ? 'BIS मानकों और सेवाओं के लिए साक्ष्य-आधारित संवादात्मक बुद्धिमत्ता'
                : 'Evidence-grounded conversational intelligence for BIS standards & services'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* New Search reset button when active in conversation */}
          {hasUserQueries && (
            <Pressable
              onPress={resetToNewSearch}
              style={styles.newSearchPill}
              accessibilityRole="button"
              accessibilityLabel="Start a new search"
            >
              <RotateCcw color="#E3A62F" size={12} />
              <Text style={styles.newSearchPillText}>
                {language === 'Hindi' ? 'नया प्रश्न' : 'New Search'}
              </Text>
            </Pressable>
          )}

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

      {/* ── End-to-End Workflow Visualization ── */}
      <View style={styles.workflowStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.workflowStripContent}>
          <View style={styles.workflowStep}>
            <Text style={styles.workflowNum}>01</Text>
            <Text style={styles.workflowLabel}>{language === 'Hindi' ? 'पूछें' : 'ASK'}</Text>
          </View>
          <ChevronRight color="#64748B" size={11} style={styles.workflowChevron} />
          <View style={styles.workflowStep}>
            <Text style={styles.workflowNum}>02</Text>
            <Text style={styles.workflowLabel}>{language === 'Hindi' ? 'समझें' : 'UNDERSTAND'}</Text>
          </View>
          <ChevronRight color="#64748B" size={11} style={styles.workflowChevron} />
          <View style={styles.workflowStep}>
            <Text style={styles.workflowNum}>03</Text>
            <Text style={styles.workflowLabel}>{language === 'Hindi' ? 'खोजें' : 'FIND'}</Text>
          </View>
          <ChevronRight color="#64748B" size={11} style={styles.workflowChevron} />
          <View style={styles.workflowStep}>
            <Text style={styles.workflowNum}>04</Text>
            <Text style={styles.workflowLabel}>{language === 'Hindi' ? 'सत्यापित करें' : 'VERIFY'}</Text>
          </View>
          <ChevronRight color="#64748B" size={11} style={styles.workflowChevron} />
          <View style={styles.workflowStep}>
            <Text style={styles.workflowNum}>05</Text>
            <Text style={styles.workflowLabel}>{language === 'Hindi' ? 'मार्गदर्शन' : 'GUIDANCE'}</Text>
          </View>
          <ChevronRight color="#64748B" size={11} style={styles.workflowChevron} />
          <View style={styles.workflowStep}>
            <Text style={styles.workflowNum}>06</Text>
            <Text style={styles.workflowLabel}>{language === 'Hindi' ? 'आधिकारिक स्रोत' : 'OFFICIAL SOURCE'}</Text>
          </View>
        </ScrollView>
      </View>

      {/* ── Hero Primary Ask / Search Bar (Empty Home State Only) ── */}
      {!hasUserQueries && (
        <View style={styles.heroAskContainer}>
          <View style={styles.heroAskBox}>
            <Search color={C.primary} size={18} />
            <TextInput
              value={question}
              onChangeText={setQuestion}
              onSubmitEditing={() => sendQuestion()}
              placeholder={
                language === 'Hindi'
                  ? 'BIS मानकों और सेवाओं के बारे में कुछ भी पूछें…'
                  : 'Ask anything about BIS standards & services…'
              }
              placeholderTextColor="#8899A6"
              style={styles.heroAskInput}
              returnKeyType="send"
              maxLength={240}
              accessibilityLabel="Primary BIS query input"
            />
            <Pressable
              onPress={() => sendQuestion()}
              style={[styles.heroAskButton, !question.trim() && styles.heroAskButtonDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Submit question"
            >
              <ArrowUp color="#FFFFFF" size={17} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Core Product Capabilities ── */}
      <View style={styles.capabilitiesContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>
            {language === 'Hindi' ? 'उत्पाद क्षमताएं' : 'CORE PRODUCT CAPABILITIES'}
          </Text>
          <Text style={styles.sectionHeaderSub}>
            {language === 'Hindi' ? 'साक्ष्य-आधारित BIS कार्यप्रवाह' : 'Evidence-Grounded BIS Workflow'}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.capabilitiesScroll}>
          {PRODUCT_CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <Pressable
                key={cap.id}
                onPress={() => sendQuestion(language === 'Hindi' ? cap.queryHi : cap.query)}
                style={styles.capabilityCard}
                accessibilityRole="button"
                accessibilityLabel={language === 'Hindi' ? cap.labelHi : cap.label}
              >
                <View style={styles.capabilityIconWrap}>
                  <Icon color={C.primary} size={15} strokeWidth={2.2} />
                </View>
                <Text style={styles.capabilityTitle} numberOfLines={2}>
                  {language === 'Hindi' ? cap.labelHi : cap.label}
                </Text>
                <Text style={styles.capabilityDesc} numberOfLines={2}>
                  {language === 'Hindi' ? cap.descriptionHi : cap.description}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Evidence & Trust Principle ── */}
      <View style={styles.trustCard}>
        <View style={styles.trustCardHeader}>
          <ShieldCheck color={C.green} size={14} strokeWidth={2.5} />
          <Text style={styles.trustCardTitle}>
            {language === 'Hindi' ? 'साक्ष्य-आधारित विश्वास ढांचा' : 'Evidence-Backed Trust Framework'}
          </Text>
        </View>
        <Text style={styles.trustCardPrinciple}>
          {language === 'Hindi'
            ? 'प्रत्येक उत्तर सत्यापित BIS मानकों, राजपत्र अधिसूचनाओं या आधिकारिक विनियामक आदेशों पर आधारित है। पर्याप्त सत्यापित साक्ष्य नहीं → कोई निश्चित दावा नहीं।'
            : 'Every answer is grounded in verified BIS standards, gazette notifications, or official regulatory orders. No sufficient verified evidence → No definitive compliance claim.'}
        </Text>
        <View style={styles.trustBadgesRow}>
          <View style={styles.trustBadge}>
            <CheckCircle2 color={C.green} size={10} />
            <Text style={styles.trustBadgeText}>{language === 'Hindi' ? 'राजपत्र व QCO सत्यापन' : 'Gazette & QCO Verification'}</Text>
          </View>
          <View style={styles.trustBadge}>
            <CheckCircle2 color={C.green} size={10} />
            <Text style={styles.trustBadgeText}>{language === 'Hindi' ? 'योजना व लैब मैपिंग' : 'Scheme & Lab Mapping'}</Text>
          </View>
          <View style={styles.trustBadge}>
            <CheckCircle2 color={C.green} size={10} />
            <Text style={styles.trustBadgeText}>{language === 'Hindi' ? 'सुरक्षित अपवर्जन (Safe Abstention)' : 'Safe Abstention'}</Text>
          </View>
          <View style={styles.trustBadge}>
            <CheckCircle2 color={C.green} size={10} />
            <Text style={styles.trustBadgeText}>{language === 'Hindi' ? 'आधिकारिक BIS पोर्टल लिंक' : 'Official BIS Portals'}</Text>
          </View>
        </View>
      </View>

      {/* ── Suggested Questions Carousel ── */}
      <View style={styles.suggestedSection}>
        <View style={styles.suggestedHeaderRow}>
          <Sparkles color={C.amberDark} size={12} />
          <Text style={styles.suggestedHeaderTitle}>
            {language === 'Hindi' ? 'सुझाए गए प्रश्न' : 'SUGGESTED QUESTIONS'}
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promptRow}
        >
          {SUGGESTED_PROMPTS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => sendQuestion(language === 'Hindi' ? item.queryHi : item.query)}
              style={styles.promptChip}
              accessibilityRole="button"
            >
              <Text style={styles.promptText}>
                {language === 'Hindi' ? item.labelHi : item.label}
              </Text>
              <ChevronRight color="#89919B" size={13} />
            </Pressable>
          ))}
        </ScrollView>
      </View>

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
                    {/* Abstention dual actions: Refine Question + View official BIS sources */}
                    {message.abstention && (
                      <View style={styles.abstentionActionsWrap}>
                        <Pressable
                          onPress={() => {
                            setQuestion('');
                            sendQuestion(
                              language === 'Hindi'
                                ? 'LED बल्ब के लिए कौन सा BIS मानक लागू होता है?'
                                : 'Which BIS standard applies to LED bulbs?'
                            );
                          }}
                          style={styles.abstentionRefineBtn}
                          accessibilityRole="button"
                          accessibilityLabel="Refine question with sample"
                        >
                          <Sparkles color={C.primaryDark} size={12} />
                          <Text style={styles.abstentionRefineBtnText}>
                            {language === 'Hindi' ? 'सुझाया गया प्रश्न पूछें' : 'Refine Question'}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => Linking.openURL(BIS_PORTAL_URL)}
                          style={styles.abstentionSourceBtn}
                          accessibilityRole="link"
                          accessibilityLabel="Open official BIS portal"
                        >
                          <Globe2 color="#FFFFFF" size={12} />
                          <Text style={styles.abstentionSourceBtnText}>
                            {language === 'Hindi' ? 'आधिकारिक BIS स्रोत देखें' : 'View Official BIS Sources'}
                          </Text>
                          <ExternalLink color="#FFFFFF" size={11} />
                        </Pressable>
                      </View>
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
            {language === 'Hindi' ? 'आधिकारिक BIS स्रोत व साक्ष्य पुस्तकालय देखें' : 'View official BIS sources & evidence library'}
          </Text>
          <ChevronRight color={C.teal} size={14} />
        </Pressable>
      </ScrollView>

      {/* ── Compact Follow-up Composer (Active Conversation State Only) ── */}
      {hasUserQueries && (
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
                  ? 'आगे का प्रश्न पूछें…'
                  : 'Ask a follow-up…'
              }
              placeholderTextColor="#9AA0A7"
              style={styles.input}
              maxLength={240}
              accessibilityLabel="Follow-up query input"
            />
            <Pressable
              onPress={() => sendQuestion()}
              style={[styles.sendButton, !question.trim() && styles.sendDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Send follow-up"
            >
              <ArrowUp color="#FFFFFF" size={19} strokeWidth={2.5} />
            </Pressable>
          </View>
          <View style={styles.composerMetaRow}>
            <Text style={styles.disclaimer}>
              {language === 'Hindi'
                ? 'साक्ष्य-आधारित संवादात्मक मार्गदर्शन · BIS ही अंतिम प्राधिकरण है'
                : 'Evidence-grounded conversational guidance · BIS remains the authority'}
            </Text>
          </View>
        </View>
      )}

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
              {/* PANEL 1: Technical Standard Specification */}
              <View style={styles.drawerSection}>
                <View style={styles.panelBadgeTech}>
                  <Text style={styles.panelBadgeText}>PANEL 1 · TECHNICAL SPECIFICATION</Text>
                </View>
                <View style={styles.metaGrid}>
                  <View style={styles.metaCell}>
                    <Text style={styles.metaLabel}>Indian Standard</Text>
                    <Text style={styles.metaVal}>{selectedEvidence?.isNumber}</Text>
                  </View>
                  <View style={styles.metaCell}>
                    <Text style={styles.metaLabel}>Edition / Status</Text>
                    <Text style={styles.metaVal}>{selectedEvidence?.year}</Text>
                  </View>
                </View>

                <Text style={styles.drawerSectionHeader}>
                  {language === 'Hindi' ? 'मानक का दायरा व परीक्षण मापदंड' : 'Standard Scope & Test Parameters'}
                </Text>
                <Text style={styles.drawerSummaryText}>
                  {language === 'Hindi' ? selectedEvidence?.scopeSummaryHi : selectedEvidence?.scopeSummary}
                </Text>

                <Text style={[styles.drawerSectionHeader, { marginTop: 14 }]}>
                  {language === 'Hindi' ? 'प्रमुख अनिवार्य परीक्षण आवश्यकताएँ' : 'Key Mandatory Testing Parameters'}
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

              {/* PANEL 2: Regulatory Basis & Legal Order */}
              <View style={[styles.drawerSection, styles.drawerSectionReg]}>
                <View style={styles.panelBadgeReg}>
                  <Text style={styles.panelBadgeTextReg}>PANEL 2 · REGULATORY LEGAL BASIS</Text>
                </View>
                <View style={styles.metaGrid}>
                  <View style={styles.metaCell}>
                    <Text style={styles.metaLabel}>Issuing Authority</Text>
                    <Text style={styles.metaVal}>{selectedEvidence?.authority}</Text>
                  </View>
                  <View style={styles.metaCell}>
                    <Text style={styles.metaLabel}>Applicability</Text>
                    <Text
                      style={[
                        styles.metaVal,
                        { color: selectedEvidence?.applicabilityType === 'Mandatory' ? C.primaryDark : C.teal },
                      ]}
                    >
                      {language === 'Hindi' ? selectedEvidence?.applicabilityTypeHi : selectedEvidence?.applicabilityType}
                    </Text>
                  </View>
                </View>

                <Text style={styles.drawerSectionHeader}>
                  {language === 'Hindi' ? 'वैधानिक आदेश (Statutory Order)' : 'Statutory / Regulatory Order'}
                </Text>
                <Text style={styles.drawerSummaryText}>
                  {language === 'Hindi' ? selectedEvidence?.legalOrderHi : selectedEvidence?.legalOrder}
                </Text>

                <Text style={[styles.drawerSectionHeader, { marginTop: 14 }]}>
                  {language === 'Hindi' ? 'विनियामक योजना व कानूनी स्थिति' : 'Scheme & Legal Applicability'}
                </Text>
                <Text style={styles.drawerSummaryText}>
                  {language === 'Hindi' ? selectedEvidence?.regulatoryBasisHi : selectedEvidence?.regulatoryBasis}
                </Text>
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
  newSearchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.navyLight,
    borderColor: '#E3A62F',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  newSearchPillText: {
    color: '#E3A62F',
    fontSize: 10.5,
    fontWeight: '700',
  },
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

  // End-to-End Workflow Visualization
  workflowStrip: {
    backgroundColor: '#1E293B',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  workflowStripContent: {
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 8,
  },
  workflowStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workflowNum: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#E3A62F',
    letterSpacing: 0.5,
  },
  workflowLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#CBD5E1',
    letterSpacing: 0.5,
  },
  workflowChevron: {
    opacity: 0.6,
  },

  // Hero Primary Ask / Search Bar (Visually Primary)
  heroAskContainer: {
    backgroundColor: C.bgSoft,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDEAF5',
  },
  heroAskBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#0070C0',
    paddingHorizontal: 12,
    paddingVertical: 3,
    gap: 8,
    shadowColor: C.navy,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  heroAskInput: {
    flex: 1,
    fontSize: 13,
    color: C.text,
    paddingVertical: 8,
    fontWeight: '500',
  },
  heroAskButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAskButtonDisabled: {
    backgroundColor: '#BEDAF4',
  },

  // Core Product Capabilities
  capabilitiesContainer: {
    backgroundColor: C.bgSoft,
    borderBottomWidth: 1,
    borderBottomColor: '#DDEAF5',
    paddingVertical: 10,
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  sectionHeaderTitle: {
    color: C.navy,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sectionHeaderSub: {
    color: C.muted,
    fontSize: 9.5,
    fontWeight: '600',
  },
  capabilitiesScroll: {
    paddingHorizontal: 14,
    paddingRight: 20,
    gap: 8,
  },
  capabilityCard: {
    width: 168,
    minHeight: 112,
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 11,
    gap: 5,
    shadowColor: C.navy,
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  capabilityIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#EEF6FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  capabilityTitle: {
    color: C.navy,
    fontSize: 11.5,
    fontWeight: '800',
    lineHeight: 15.5,
    minHeight: 31,
  },
  capabilityDesc: {
    color: C.muted,
    fontSize: 9.5,
    lineHeight: 13,
  },

  // Evidence & Trust Principle Card
  trustCard: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 5,
  },
  trustCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustCardTitle: {
    color: C.navy,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  trustCardPrinciple: {
    color: '#475569',
    fontSize: 10,
    lineHeight: 14.5,
    fontStyle: 'italic',
  },
  trustBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  trustBadgeText: {
    color: '#065F46',
    fontSize: 9,
    fontWeight: '700',
  },

  // Suggested Questions Section
  suggestedSection: {
    backgroundColor: '#FAFCFE',
    borderBottomWidth: 1,
    borderBottomColor: '#E2EAF2',
    paddingVertical: 8,
    gap: 6,
  },
  suggestedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
  },
  suggestedHeaderTitle: {
    color: '#475569',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  promptRow: {
    gap: 8,
    paddingHorizontal: 14,
    paddingRight: 24, // Generous padding so chips do not abruptly clip
  },
  promptChip: {
    backgroundColor: C.bg,
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    shadowColor: C.navy,
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  promptText: {
    color: C.navy,
    fontWeight: '700',
    fontSize: 11,
  },

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
  drawerSectionReg: {
    borderColor: '#C6DFDF',
    backgroundColor: '#F7FCFC',
  },
  panelBadgeTech: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF5FC',
    borderColor: '#BED8F0',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 10,
  },
  panelBadgeText: {
    color: C.primaryDark,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  panelBadgeReg: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5F5',
    borderColor: '#BBE3E4',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 10,
  },
  panelBadgeTextReg: {
    color: C.teal,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  abstentionActionsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  abstentionRefineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F6FC',
    borderColor: '#C0D8EC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  abstentionRefineBtnText: {
    color: C.primaryDark,
    fontSize: 11.5,
    fontWeight: '700',
  },
  abstentionSourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  abstentionSourceBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },

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
  composerMetaRow: {
    marginTop: 4,
    alignItems: 'center',
  },
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
