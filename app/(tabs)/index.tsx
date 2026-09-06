import { useState } from 'react';
import { Linking, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowUp, Bot, Check, ChevronRight, Clock3, ExternalLink, FileText, Globe2, ShieldCheck, Sparkles, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

type Language = 'English' | 'Hindi';
type ChatMessage = { id: number; role: 'user' | 'assistant'; text: string; citation?: string; sourceUrl?: string; roadmap?: boolean };
type Source = { title: string; url: string; citation: string; summary: string };

type RoadmapStep = { number: string; title: string; titleHi: string; description: string; descriptionHi: string; duration: string };

const prompts = {
  English: [
    'LED bulb BIS certification roadmap',
    'How do I verify gold hallmarking & HUID?',
    'What are the silver hallmarking standards (IS 2112)?',
  ],
  Hindi: [
    'LED बल्ब BIS प्रमाणन रोडमैप',
    'सोने की हॉलमार्किंग और HUID कैसे जाँचें?',
    'चाँदी की हॉलमार्किंग मानक (IS 2112)',
  ],
};

const HALLMARKING_FAQ_URL = 'https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq/?lang=en';

const localSources: Source[] = [
  { title: 'Indian Standards on LED', url: 'https://bis.gov.in/other/LEDSeries.pdf', citation: 'BIS LED Series · IS 16102', summary: 'Official list covering LED lamps, modules, control gear, measurements and luminaires.' },
  { title: 'Gold & Silver Hallmarking FAQs & Standards', url: HALLMARKING_FAQ_URL, citation: 'BIS Gold & Silver · HUID', summary: 'Confirms the three-part hallmark: BIS logo, purity/fineness grades (IS 1417 & IS 2112) and six-digit HUID.' },
  { title: 'Consumer Protection & HUID Verification', url: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en', citation: 'BIS Consumer Protection', summary: 'Consumer guidance on using the BIS CARE mobile app to verify hallmarking before buying.' },
];

const roadmapSteps: RoadmapStep[] = [
  { number: '1', title: 'Product Testing', titleHi: 'उत्पाद परीक्षण', description: 'Test at a BIS-recognised laboratory as per IS 16102 (Part 1).', descriptionHi: 'BIS से मान्यता प्राप्त प्रयोगशाला में IS 16102 (Part 1) के अनुसार जाँच करें।', duration: '10–15 days' },
  { number: '2', title: 'Document Preparation', titleHi: 'दस्तावेज़ तैयारी', description: 'Prepare product details, test reports and manufacturer documents.', descriptionHi: 'उत्पाद विवरण, परीक्षण रिपोर्ट और निर्माता दस्तावेज़ तैयार करें।', duration: '3–5 days' },
  { number: '3', title: 'Online Application', titleHi: 'ऑनलाइन आवेदन', description: 'Submit the application and supporting documents on the BIS portal.', descriptionHi: 'BIS पोर्टल पर आवेदन और सहायक दस्तावेज़ जमा करें।', duration: '1 day' },
  { number: '4', title: 'BIS Review & Registration', titleHi: 'BIS समीक्षा और पंजीकरण', description: 'BIS reviews the application and grants registration when requirements are met.', descriptionHi: 'BIS आवेदन की समीक्षा करता है और आवश्यकताएँ पूरी होने पर पंजीकरण प्रदान करता है।', duration: '6–9 days' },
];

function getSampleMessages(language: Language): ChatMessage[] {
  return language === 'Hindi'
    ? [
      { id: 1, role: 'assistant', text: 'नमस्ते! मैं SahayakBIS हूँ। आप LED बल्ब (IS 16102), सोने और चाँदी की हॉलमार्किंग (HUID) के बारे में पूछ सकते हैं।' },
    ]
    : [
      { id: 1, role: 'assistant', text: 'Hello! I am SahayakBIS. You can ask about LED bulbs (IS 16102), gold, and silver hallmarking (HUID).' },
    ];
}

function classifyQueryLanguage(text: string): 'Hindi' | 'English' | 'Hinglish' {
  // If text contains Devanagari characters, it is strictly Hindi
  if (/[\u0900-\u097F]/.test(text)) {
    return 'Hindi';
  }

  const lower = text.toLowerCase();
  const words = lower.split(/[^a-zA-Z0-9]+/).filter(Boolean);

  // Strong Hinglish markers (Hindi words written in Latin script)
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
    'wali', 'wala', 'wale', 'baare', 'bare', 'liye', 'kholna'
  ]);

  // Contextual Hinglish markers (short connectors that appear in Hinglish sentences)
  const contextualHinglishWords = new Set([
    'ka', 'ki', 'ke', 'ko', 'se', 'par', 'pe', 'mein', 'h'
  ]);

  let strongCount = 0;
  let contextualCount = 0;

  for (const w of words) {
    if (strongHinglishWords.has(w)) strongCount++;
    if (contextualHinglishWords.has(w)) contextualCount++;
  }

  // If ANY strong Hinglish word is present, or 2+ contextual words: it is Hinglish!
  if (strongCount >= 1 || contextualCount >= 2) {
    return 'Hinglish';
  }

  return 'English';
}

function getAnswer(question: string, currentLang: Language): ChatMessage {
  const queryLang = classifyQueryLanguage(question);

  // If Hinglish is detected -> Strictly reject! Response only allowed in English or Hindi.
  if (queryLang === 'Hinglish') {
    if (currentLang === 'Hindi') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'हिंग्लिश (Hinglish) समर्थित नहीं है। SahayakBIS केवल शुद्ध अंग्रेज़ी (English) या हिन्दी (देवनागरी) में प्रश्नों का उत्तर देता है। कृपया अपना प्रश्न शुद्ध अंग्रेज़ी या हिन्दी में पूछें।',
        citation: 'असमर्थित भाषा · केवल English या हिन्दी',
      };
    } else {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Hinglish is not supported. SahayakBIS only provides responses in standard English or Hindi (हिन्दी). Please ask your question in English or Hindi (Devanagari script).',
        citation: 'Unsupported language · English or Hindi only',
      };
    }
  }

  const answerLang: Language = queryLang === 'Hindi' ? 'Hindi' : 'English';
  const normalized = question.toLowerCase();

  // Check LED Bulbs / Lamps / IS 16102
  const isLed =
    normalized.includes('led') ||
    normalized.includes('bulb') ||
    normalized.includes('lamp') ||
    normalized.includes('16102') ||
    question.includes('बल्ब') ||
    question.includes('एलईडी') ||
    question.includes('लैंप');

  // Check Gold
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

  // Check Silver
  const isSilver =
    normalized.includes('silver') ||
    normalized.includes('2112') ||
    normalized.includes('sterling') ||
    question.includes('चाँदी') ||
    question.includes('चांदी') ||
    question.includes('रजत');

  // Check General Hallmarking / HUID
  const isHallmarking =
    normalized.includes('hallmark') ||
    normalized.includes('huid') ||
    question.includes('हॉलमार्क') ||
    question.includes('हॉलमार्किंग');

  // 1. Both Gold and Silver OR General Hallmarking query
  if ((isGold && isSilver) || (isHallmarking && !isLed && !isGold && !isSilver)) {
    if (answerLang === 'Hindi') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'BIS हॉलमार्किंग सोने (IS 1417) और चाँदी (IS 2112) के आभूषणों व कलाकृतियों की शुद्धता प्रमाणित करती है। असली हॉलमार्क में तीन प्रमुख चिह्न होते हैं: 1) BIS लोगो, 2) शुद्धता/फाइननेस ग्रेड (जैसे सोने के लिए 22K916 और चाँदी के लिए 925 स्टर्लिंग), और 3) 6 अंकों का अल्फ़ान्यूमेरिक HUID कोड। उपभोक्ता BIS CARE मोबाइल ऐप में "Verify HUID" फीचर से आभूषण की प्रामाणिकता तुरंत जाँच सकते हैं।',
        citation: 'BIS हॉलमार्किंग · HUID',
        sourceUrl: HALLMARKING_FAQ_URL,
      };
    } else {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'BIS Hallmarking certifies the purity and fineness of Gold (IS 1417) and Silver (IS 2112) jewellery and artefacts. A genuine hallmark consists of three marks: 1) BIS Logo, 2) Purity & Fineness grade (e.g., 22K916 for gold, 925 for silver), and 3) a unique 6-digit alphanumeric HUID code. Consumers can verify hallmarked items using the "Verify HUID" feature in the official BIS CARE mobile app.',
        citation: 'BIS Hallmarking Overview · HUID',
        sourceUrl: HALLMARKING_FAQ_URL,
      };
    }
  }

  // 2. Gold queries
  if (isGold) {
    if (answerLang === 'Hindi') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'असली हॉलमार्क वाले सोने के आभूषण पर तीन अनिवार्य चिह्न होते हैं: BIS लोगो, शुद्धता या फाइननेस (जैसे 24K999, 22K916, 18K750, 14K585) और छह अंकों वाला अल्फ़ान्यूमेरिक HUID। खरीदने से पहले HUID की जाँच BIS CARE ऐप से की जा सकती है। शुद्धता की जाँच के लिए BIS से मान्यता प्राप्त Assaying & Hallmarking Centre (AHC) आभूषण की जाँच करके रिपोर्ट जारी कर सकता है।',
        citation: 'BIS स्वर्ण हॉलमार्किंग · HUID',
        sourceUrl: HALLMARKING_FAQ_URL,
      };
    } else {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'A genuine hallmarked gold article carries three mandatory marks: the BIS logo, purity or fineness grade (such as 24K999, 22K916, 18K750, 14K585), and a six-digit alphanumeric HUID. You can use the BIS CARE app to verify the HUID and jeweller details before buying. Purity testing can also be performed at any BIS-recognised Assaying & Hallmarking Centre (AHC).',
        citation: 'BIS Gold Hallmarking · HUID',
        sourceUrl: HALLMARKING_FAQ_URL,
      };
    }
  }

  // 3. Silver queries
  if (isSilver) {
    if (answerLang === 'Hindi') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'भारत में चाँदी के आभूषणों और कलाकृतियों की हॉलमार्किंग भारतीय मानक IS 2112 (Silver and Silver Alloys) के तहत की जाती है। हॉलमार्क वाली चाँदी पर BIS लोगो, शुद्धता/फाइननेस ग्रेड (जैसे 999, 970, 925 स्टर्लिंग सिल्वर, 900, 835, 800) और 6 अंकों का अल्फ़ान्यूमेरिक HUID कोड अंकित होता है। यह उपभोक्ताओं को शुद्धता और मिलावट से सुरक्षा की गारंटी देता है।',
        citation: 'BIS रजत (चाँदी) · IS 2112',
        sourceUrl: HALLMARKING_FAQ_URL,
      };
    } else {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Silver hallmarking in India is governed by Indian Standard IS 2112 (Silver and Silver Alloys, Jewellery/Artefacts). Hallmarked silver carries three marks: the BIS logo, purity/fineness grade (such as 999, 970, 925 for Sterling Silver, 900, 835, 800), and a six-digit alphanumeric HUID. This guarantees authenticity and protects buyers from adulteration.',
        citation: 'BIS Silver Hallmarking · IS 2112',
        sourceUrl: HALLMARKING_FAQ_URL,
      };
    }
  }

  // 4. LED Bulbs / Lamps queries
  if (isLed) {
    if (answerLang === 'Hindi') {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'सामान्य प्रकाश व्यवस्था के लिए सेल्फ-बैलेस्टेड LED लैंप को Compulsory Registration Scheme (CRS) के अंतर्गत BIS पंजीकरण की आवश्यकता होती है। सुरक्षा के लिए IS 16102 (Part 1):2012 और प्रदर्शन के लिए IS 16102 (Part 2):2012 लागू होता है। पंजीकरण से पहले उत्पाद की जाँच BIS से मान्यता प्राप्त प्रयोगशाला में की जाती है।',
        citation: 'BIS LED सीरीज़ · IS 16102',
        sourceUrl: localSources[0].url,
        roadmap: true,
      };
    } else {
      return {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Self-ballasted LED lamps for general lighting require BIS registration under the Compulsory Registration Scheme (CRS). The key safety standard is IS 16102 (Part 1):2012; performance requirements are covered by IS 16102 (Part 2):2012. The product is tested at a BIS-recognised laboratory before registration on the BIS CRS portal.',
        citation: 'BIS LED Series · IS 16102',
        sourceUrl: localSources[0].url,
        roadmap: true,
      };
    }
  }

  // 5. ANY OTHER category or query: strictly return "Could not find" message
  if (answerLang === 'Hindi') {
    return {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'इस प्रश्न के लिए मुझे सत्यापित BIS स्रोत नहीं मिला। SahayakBIS केवल LED बल्ब (IS 16102), सोने की हॉलमार्किंग (HUID), और चाँदी की हॉलमार्किंग (IS 2112) की सत्यापित जानकारी प्रदान करता है। कृपया इन्हीं श्रेणियों के बारे में पूछें।',
      citation: 'सत्यापित स्रोत नहीं मिला',
    };
  } else {
    return {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'I could not find a verified BIS source for that question. SahayakBIS only covers verified information for LED bulbs (IS 16102), Gold hallmarking (HUID), and Silver hallmarking (IS 2112). Try asking about these supported categories.',
      citation: 'Verified source not found',
    };
  }
}

export default function ExploreScreen() {
  const [language, setLanguage] = useState<Language>('English');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => getSampleMessages('English'));
  const [roadmapVisible, setRoadmapVisible] = useState(false);
  const [sources, setSources] = useState<Source[]>(localSources);
  const [loading, setLoading] = useState(false);

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    if (messages.length <= 2) setMessages(getSampleMessages(nextLanguage));
  };

  const sendQuestion = (value: string = question) => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    const userMessage: ChatMessage = { id: Date.now(), role: 'user', text: trimmed };
    setMessages((current) => [...current, userMessage]);
    setQuestion('');
    setTimeout(() => {
      const answer = getAnswer(trimmed, language);
      setMessages((current) => [...current, answer]);
      setLoading(false);
    }, 350);
  };

  const loadSources = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('sahayakbis_sources').select('title,url,citation,summary').order('created_at');
    if (data && data.length > 0) setSources(data as Source[]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}><ShieldCheck color="#F5C24B" size={19} strokeWidth={2.5} /></View>
          <View><Text style={styles.brand}>Sahayak<Text style={styles.brandAccent}>BIS</Text></Text><Text style={styles.tagline}>Standards made simple</Text></View>
        </View>
        <View style={styles.languagePill}>
          <Pressable onPress={() => changeLanguage('English')} style={[styles.languageButton, language === 'English' && styles.languageActive]}><Text style={[styles.languageText, language === 'English' && styles.languageActiveText]}>English</Text></Pressable>
          <Pressable onPress={() => changeLanguage('Hindi')} style={[styles.languageButton, language === 'Hindi' && styles.languageActive]}><Text style={[styles.languageText, language === 'Hindi' && styles.languageActiveText]}>हिन्दी</Text></Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptRow}>
          {prompts[language].map((prompt) => <Pressable key={prompt} onPress={() => sendQuestion(prompt)} style={styles.promptChip}><Sparkles color="#B78012" size={14} /><Text style={styles.promptText}>{prompt}</Text><ChevronRight color="#89919B" size={15} /></Pressable>)}
        </ScrollView>
        <View style={styles.datePill}><Text style={styles.dateText}>{language === 'Hindi' ? `आज, ${new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}` : `Today, ${new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`}</Text></View>

        {messages.length === 0 && <View style={styles.emptyCard}><View style={styles.emptyIcon}><Bot color="#0C355C" size={28} /></View><Text style={styles.emptyTitle}>{language === 'Hindi' ? 'मैं आपकी कैसे सहायता करूँ?' : 'What can I help you find?'}</Text><Text style={styles.emptyText}>{language === 'Hindi' ? 'अंग्रेज़ी या हिन्दी में पूछें। केवल LED बल्ब, सोना और चाँदी के सत्यापित BIS स्रोत उपलब्ध हैं।' : 'Ask in English or Hindi. Grounded strictly in verified BIS sources for LED bulbs, Gold and Silver.'}</Text><View style={styles.categoryRow}><View style={styles.category}><Text style={styles.categoryTitle}>{language === 'Hindi' ? 'LED बल्ब' : 'LED Bulbs'}</Text><Text style={styles.categorySub}>CRS · IS 16102</Text></View><View style={[styles.category, styles.categoryGold]}><Text style={styles.categoryTitle}>{language === 'Hindi' ? 'सोना एवं चाँदी' : 'Gold & Silver'}</Text><Text style={styles.categorySub}>{language === 'Hindi' ? 'हॉलमार्किंग · HUID' : 'Hallmarking · HUID'}</Text></View></View></View>}

        {messages.map((message) => <View key={message.id} style={[styles.messageWrap, message.role === 'user' && styles.userWrap]}><View style={[styles.avatar, message.role === 'user' && styles.userAvatar]}>{message.role === 'assistant' ? <Bot color="#FFFFFF" size={16} /> : <Text style={styles.userAvatarText}>You</Text>}</View><View style={[styles.bubble, message.role === 'user' && styles.userBubble]}><Text style={[styles.messageText, message.role === 'user' && styles.userMessageText]}>{message.text}</Text>{message.citation && <Pressable onPress={() => message.sourceUrl && Linking.openURL(message.sourceUrl)} style={styles.citation}><FileText color="#9D7314" size={14} /><Text style={styles.citationText}>{message.citation}</Text>{message.sourceUrl && <ExternalLink color="#9D7314" size={13} />}</Pressable>}{message.roadmap && <Pressable onPress={() => setRoadmapVisible(true)} style={styles.roadmapButton}><Text style={styles.roadmapText}>{language === 'Hindi' ? 'प्रमाणन रोडमैप देखें' : 'Generate Certification Roadmap'}</Text><ChevronRight color="#0C355C" size={16} /></Pressable>}</View></View>)}
        {loading && <View style={styles.loading}><View style={styles.loadingDot} /><Text style={styles.loadingText}>{language === 'Hindi' ? 'सत्यापित BIS स्रोत जाँचे जा रहे हैं…' : 'Checking verified BIS sources…'}</Text></View>}
        <Pressable onPress={loadSources} style={styles.sourceNotice}><Globe2 color="#2C8D93" size={17} /><Text style={styles.sourceNoticeText}>{language === 'Hindi' ? '3 आधिकारिक BIS स्रोत जुड़े हुए हैं' : '3 official BIS sources connected'}</Text><ChevronRight color="#2C8D93" size={15} /></Pressable>
      </ScrollView>

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
            placeholder={language === 'Hindi' ? 'LED बल्ब, सोना या चाँदी के मानक पूछें…' : 'Ask about LED bulbs, Gold or Silver…'}
            placeholderTextColor="#9AA0A7"
            style={styles.input}
            maxLength={240}
          />
          <Pressable onPress={() => sendQuestion()} style={[styles.sendButton, !question.trim() && styles.sendDisabled]}>
            <ArrowUp color="#FFFFFF" size={20} strokeWidth={2.5} />
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>
          {language === 'Hindi' ? 'केवल अंग्रेज़ी या हिन्दी में पूछें · केवल LED बल्ब, सोना और चाँदी के स्रोत' : 'Please ask in English or Hindi only · Verified sources for LED, Gold & Silver'}
        </Text>
      </View>

      <Modal visible={roadmapVisible} animationType="slide" transparent onRequestClose={() => setRoadmapVisible(false)}><View style={styles.modalBackdrop}><View style={styles.modalSheet}><View style={styles.modalHandle} /><View style={styles.modalHeader}><View><Text style={styles.modalEyebrow}>{language === 'Hindi' ? 'प्रमाणन रोडमैप' : 'CERTIFICATION ROADMAP'}</Text><Text style={styles.modalTitle}>{language === 'Hindi' ? 'LED बल्ब · IS 16102' : 'LED Bulbs · IS 16102'}</Text></View><Pressable onPress={() => setRoadmapVisible(false)} style={styles.closeButton}><X color="#0C355C" size={20} /></Pressable></View><Text style={styles.modalIntro}>{language === 'Hindi' ? 'उत्पाद परीक्षण से BIS पंजीकरण तक की व्यावहारिक प्रक्रिया।' : 'A practical path from product testing to BIS registration.'}</Text>{roadmapSteps.map((step) => <View key={step.number} style={styles.step}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{step.number}</Text></View><View style={styles.stepLine} /><View style={styles.stepCopy}><View style={styles.stepTitleRow}><Text style={styles.stepTitle}>{language === 'Hindi' ? step.titleHi : step.title}</Text><Text style={styles.stepDuration}>{step.duration}</Text></View><Text style={styles.stepDescription}>{language === 'Hindi' ? step.descriptionHi : step.description}</Text></View></View>)}<View style={styles.total}><Clock3 color="#9D7314" size={17} /><Text style={styles.totalText}>{language === 'Hindi' ? 'कुल: 20–30 कार्य दिवस' : 'Total: 20–30 working days'}</Text></View><Pressable onPress={() => setRoadmapVisible(false)} style={styles.doneButton}><Check color="#FFFFFF" size={18} /><Text style={styles.doneText}>{language === 'Hindi' ? 'समझ गया' : 'Got it'}</Text></Pressable></View></View></Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBF8F1' },
  header: { backgroundColor: '#0C2D50', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#173E67', alignItems: 'center', justifyContent: 'center' },
  brand: { color: '#FFFFFF', fontSize: 21, fontWeight: '800', letterSpacing: -0.6 },
  brandAccent: { color: '#F5C24B' },
  tagline: { color: '#AFC3D6', fontSize: 10, marginTop: 1, letterSpacing: 0.3 },
  languagePill: { flexDirection: 'row', backgroundColor: '#173E67', borderRadius: 18, padding: 3 },
  languageButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15 },
  languageActive: { backgroundColor: '#F5C24B' },
  languageText: { color: '#C8D5E2', fontSize: 11, fontWeight: '700' },
  languageActiveText: { color: '#17314D' },
  content: { paddingHorizontal: 14, paddingBottom: 28 },
  datePill: { alignSelf: 'center', backgroundColor: '#EEECE6', borderRadius: 15, paddingHorizontal: 11, paddingVertical: 6, marginTop: 3, marginBottom: 12 },
  dateText: { color: '#69737B', fontSize: 11, fontWeight: '700' },
  promptRow: { gap: 8, paddingBottom: 10, paddingTop: 8 },
  promptChip: { backgroundColor: '#FFFFFF', borderColor: '#E9E5DD', borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6, shadowColor: '#102C48', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  promptText: { color: '#334657', fontWeight: '700', fontSize: 12 },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#ECE8DF', padding: 20, alignItems: 'center', marginTop: 2 },
  emptyIcon: { width: 56, height: 56, borderRadius: 20, backgroundColor: '#EAF1F4', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { color: '#0C2D50', fontWeight: '800', fontSize: 18 },
  emptyText: { color: '#71808D', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6, maxWidth: 280 },
  categoryRow: { flexDirection: 'row', gap: 8, width: '100%', marginTop: 18 },
  category: { flex: 1, padding: 12, borderRadius: 15, backgroundColor: '#EEF5F6' },
  categoryGold: { backgroundColor: '#FFF5D9' },
  categoryTitle: { color: '#0C355C', fontSize: 13, fontWeight: '800' },
  categorySub: { color: '#71808D', fontSize: 11, marginTop: 4 },
  messageWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 12 },
  userWrap: { flexDirection: 'row-reverse' },
  avatar: { width: 30, height: 30, borderRadius: 11, backgroundColor: '#0C2D50', alignItems: 'center', justifyContent: 'center', marginTop: 3 },
  userAvatar: { backgroundColor: '#C99A17' },
  userAvatarText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  bubble: { maxWidth: '86%', backgroundColor: '#FFFFFF', borderRadius: 18, borderTopLeftRadius: 5, borderWidth: 1, borderColor: '#EAE6DF', padding: 14, shadowColor: '#102C48', shadowOpacity: 0.04, shadowRadius: 7, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  userBubble: { backgroundColor: '#0C355C', borderColor: '#0C355C', borderTopLeftRadius: 18, borderTopRightRadius: 5 },
  messageText: { color: '#3E4C58', fontSize: 14, lineHeight: 21 },
  userMessageText: { color: '#FFFFFF' },
  citation: { backgroundColor: '#FFF5D7', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 7, flexDirection: 'row', gap: 6, alignItems: 'center', alignSelf: 'flex-start', marginTop: 12 },
  citationText: { color: '#8A6410', fontSize: 11, fontWeight: '800', flexShrink: 1 },
  roadmapButton: { borderColor: '#0C6B72', borderWidth: 1, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12 },
  roadmapText: { color: '#0C5860', fontSize: 12, fontWeight: '800' },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 39, marginTop: 13 },
  loadingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C99A17' },
  loadingText: { color: '#7B8791', fontSize: 12, fontStyle: 'italic' },
  sourceNotice: { marginTop: 22, borderTopColor: '#E7E1D7', borderTopWidth: 1, paddingTop: 15, flexDirection: 'row', alignItems: 'center', gap: 7 },
  sourceNoticeText: { color: '#2C8D93', fontSize: 12, fontWeight: '700', flex: 1 },
  composerWrap: { backgroundColor: '#FBF8F1', borderTopColor: '#EEE9DF', borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 11, paddingBottom: 10 },
  composer: { minHeight: 50, backgroundColor: '#FFFFFF', borderColor: '#E3DED4', borderWidth: 1, borderRadius: 27, paddingLeft: 17, paddingRight: 5, flexDirection: 'row', alignItems: 'center', shadowColor: '#102C48', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  input: { flex: 1, color: '#243A4F', fontSize: 14, maxHeight: 65, paddingTop: 10, paddingBottom: 10 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0C2D50', alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.45 },
  disclaimer: { color: '#9BA1A5', fontSize: 10, textAlign: 'center', marginTop: 6 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(4, 20, 38, 0.48)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FBF8F1', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 28 },
  modalHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: '#D6D1C8', alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalEyebrow: { color: '#B78012', fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  modalTitle: { color: '#0C2D50', fontSize: 23, fontWeight: '800', marginTop: 5 },
  closeButton: { width: 35, height: 35, backgroundColor: '#EAF1F4', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalIntro: { color: '#71808D', fontSize: 13, marginTop: 9, marginBottom: 20 },
  step: { flexDirection: 'row', minHeight: 67 },
  stepNumber: { width: 27, height: 27, borderRadius: 14, backgroundColor: '#0C2D50', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  stepNumberText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  stepLine: { position: 'absolute', left: 13, top: 27, bottom: 0, width: 1, backgroundColor: '#C9D2D8' },
  stepCopy: { flex: 1, paddingLeft: 12, paddingBottom: 16 },
  stepTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  stepTitle: { color: '#173650', fontSize: 14, fontWeight: '800', flex: 1 },
  stepDuration: { color: '#B78012', fontSize: 10, fontWeight: '800' },
  stepDescription: { color: '#71808D', fontSize: 12, lineHeight: 17, marginTop: 4 },
  total: { backgroundColor: '#FFF0C7', borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, marginTop: 3 },
  totalText: { color: '#8A6410', fontWeight: '800', fontSize: 13 },
  doneButton: { backgroundColor: '#0C2D50', borderRadius: 20, paddingVertical: 13, marginTop: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  doneText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});
