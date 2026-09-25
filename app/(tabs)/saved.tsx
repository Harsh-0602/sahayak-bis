import React from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Award, BookOpen, CheckCircle2, ChevronRight, ExternalLink, FileCheck, FileText, Globe2, Layers, ShieldCheck, Sparkles } from 'lucide-react-native';

const C = {
  primary: '#0070C0',
  primaryDark: '#005B96',
  primaryLight: '#EAF5FC',
  navy: '#0C2D50',
  teal: '#2C8D93',
  text: '#111111',
  muted: '#555555',
  bg: '#FFFFFF',
  bgSoft: '#F5F8FC',
  border: '#B7D3EA',
  amber: '#E3A62F',
  amberDark: '#9D6E00',
  green: '#1E7E34',
};

type EvidenceItem = {
  id: string;
  category: string;
  title: string;
  citation: string;
  summary: string;
  url: string;
  status: 'ACTIVE_GAZETTE' | 'STATUTORY_ORDER' | 'OFFICIAL_PORTAL';
};

const EVIDENCE_CATEGORIES: {
  id: string;
  title: string;
  description: string;
  icon: any;
  items: EvidenceItem[];
}[] = [
  {
    id: 'standards_spec',
    title: '1. Standards Specifications (IS Codes)',
    description: 'Technical requirements, testing criteria, and safety/performance parameters gazetted by BIS technical committees.',
    icon: FileText,
    items: [
      {
        id: 'is16102',
        category: 'Electrotechnical · Lighting',
        title: 'IS 16102 (Part 1):2026 & IS 16102 (Part 2):2012 — Self-Ballasted LED Lamps',
        citation: 'BIS CRS Registry · IS 16102 · Bureau of Indian Standards',
        summary: 'Part 1:2026 (First Revision) specifies safety requirements (electric shock protection, thermal endurance, insulation resistance). Part 2:2012 specifies performance (wattage, luminous flux, colour temperature, life test).',
        url: 'https://www.crsbis.in/BIS/products.do',
        status: 'ACTIVE_GAZETTE',
      },
      {
        id: 'is1417',
        category: 'Metallurgical · Precious Metals',
        title: 'IS 1417:2016 — Gold and Gold Alloys, Jewellery/Artefacts — Fineness & Marking',
        citation: 'BIS Hallmarking · IS 1417:2016 · Hallmarking Department',
        summary: 'Specifies 6 recognized purity grades (24K999, 23K958, 22K916, 20K833, 18K750, 14K585). Prescribes the 3-mark regime: BIS logo, karat/fineness, and 6-digit laser-engraved HUID.',
        url: 'https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq/?lang=en',
        status: 'ACTIVE_GAZETTE',
      },
      {
        id: 'is2112',
        category: 'Metallurgical · Precious Metals',
        title: 'IS 2112:2014 — Silver and Silver Alloys, Jewellery/Artefacts — Fineness & Marking',
        citation: 'BIS Hallmarking · IS 2112:2014 · Hallmarking Department',
        summary: 'Prescribes standards for silver purity across 6 grades (999, 970, 925 sterling silver, 900, 835, 800) under the voluntary hallmarking regime with laser-engraved HUID.',
        url: 'https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq/?lang=en',
        status: 'ACTIVE_GAZETTE',
      },
    ],
  },
  {
    id: 'regulatory_orders',
    title: '2. Regulatory & Mandatory Orders (QCO / CRO)',
    description: 'Statutory orders issued by Ministries enforcing mandatory conformity assessment under the BIS Act, 2016.',
    icon: FileCheck,
    items: [
      {
        id: 'meity_cro',
        category: 'Ministry of Electronics & IT (MeitY)',
        title: 'Electronics & IT Goods (Compulsory Registration) Order',
        citation: 'Gazette of India · MeitY CRO Statutory Notification',
        summary: 'Enforces mandatory registration for electronics & IT products (including LED lamps) under Scheme-II (CRS) of BIS Conformity Assessment Regulations. No product may be sold without valid R-number.',
        url: 'https://www.bis.gov.in/product-certification/online-information/',
        status: 'STATUTORY_ORDER',
      },
      {
        id: 'hallmarking_qco',
        category: 'Ministry of Consumer Affairs, Food & Public Distribution',
        title: 'Mandatory Hallmarking Quality Control Order (QCO)',
        citation: 'Gazette of India · Hallmarking QCO · Sec 16 & 25 BIS Act 2016',
        summary: 'Mandates compulsory hallmarking of gold jewellery in notified districts across India. Prohibits sale of non-hallmarked gold jewellery by registered jewellers.',
        url: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en',
        status: 'STATUTORY_ORDER',
      },
    ],
  },
  {
    id: 'conformity_schemes',
    title: '3. Conformity Assessment Schemes',
    description: 'Statutory frameworks established under the Bureau of Indian Standards (Conformity Assessment) Regulations, 2018.',
    icon: Layers,
    items: [
      {
        id: 'scheme_2_crs',
        category: 'Scheme-II · Electronics & IT',
        title: 'Compulsory Registration Scheme (CRS)',
        citation: 'BIS Regulations 2018 · Scheme-II (CRS)',
        summary: 'Manufacturer registration model based on testing from BIS-recognized laboratories. Standard mark: "CRS" with registration number and standard reference.',
        url: 'https://www.bis.gov.in/product-certification/online-information/',
        status: 'STATUTORY_ORDER',
      },
      {
        id: 'scheme_4_hallmarking',
        category: 'Scheme-IV · Precious Metals',
        title: 'Hallmarking Scheme for Gold & Silver Articles',
        citation: 'BIS Regulations 2018 · Scheme-IV (Hallmarking)',
        summary: 'Independent assaying and laser engraving performed exclusively at BIS-recognized Assaying & Hallmarking Centres (AHCs) with tamper-proof 6-digit alphanumeric HUID.',
        url: 'https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq/?lang=en',
        status: 'STATUTORY_ORDER',
      },
    ],
  },
  {
    id: 'digital_services',
    title: '4. Digital Services & Citizen Verification',
    description: 'Official Government of India portals and applications for licensing, standard purchase, and consumer verification.',
    icon: Globe2,
    items: [
      {
        id: 'manakonline',
        category: 'National Standards Portal',
        title: 'Manakonline Portal (e-BIS)',
        citation: 'https://www.manakonline.in/ · Bureau of Indian Standards',
        summary: 'Single-window enterprise platform for Indian Standards e-sales, online application for ISI mark, CRS registration, and laboratory recognition services.',
        url: 'https://www.manakonline.in/',
        status: 'OFFICIAL_PORTAL',
      },
      {
        id: 'bis_care',
        category: 'Citizen Mobile Application',
        title: 'BIS CARE App & Consumer Protection',
        citation: 'BIS CARE · Verify ISI & HUID · Consumer Redressal',
        summary: 'Official mobile application enabling citizens to verify 6-digit HUID codes on jewellery, authenticate ISI license numbers on consumer goods, and file statutory grievances.',
        url: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en',
        status: 'OFFICIAL_PORTAL',
      },
    ],
  },
];

export default function SourcesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.icon}>
            <BookOpen color="#E3A62F" size={22} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>CLOSED-DOMAIN EVIDENCE REPOSITORY</Text>
            <Text style={styles.title}>BIS Evidence Library</Text>
            <Text style={styles.subtitle}>Official Gazette Notifications, Indian Standards & Regulatory Orders</Text>
          </View>
        </View>

        {/* Framing Description */}
        <Text style={styles.intro}>
          SahayakBIS operates on a closed-domain evidence architecture. All responses are derived from and verified against official BIS documentation, Ministry Quality Control Orders, and published Indian Standards.
        </Text>

        {/* Prototype Scope Banner */}
        <View style={styles.prototypeNotice}>
          <View style={styles.prototypeNoticeHeader}>
            <Sparkles color={C.primaryDark} size={14} />
            <Text style={styles.prototypeNoticeTitle}>PROTOTYPE EVIDENCE COVERAGE</Text>
          </View>
          <Text style={styles.prototypeNoticeText}>
            Currently connected to selected primary BIS standards, CRO orders, and hallmarking frameworks. The architecture is designed to index all 20,000+ Indian Standards across 15 technical divisions in the Bureau of Indian Standards.
          </Text>
        </View>

        {/* Evidence Gate Principle */}
        <View style={styles.evidenceNotice}>
          <ShieldCheck color={C.green} size={16} strokeWidth={2.2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.evidenceNoticeHeading}>The Evidence Gate Principle</Text>
            <Text style={styles.evidenceNoticeText}>
              Every answer requires verified BIS evidence. If evidence is unverified or insufficient, SahayakBIS safely abstains rather than generating speculative claims.
            </Text>
          </View>
        </View>

        {/* Categorized Evidence Sections */}
        {EVIDENCE_CATEGORIES.map((cat) => {
          const CatIcon = cat.icon;
          return (
            <View key={cat.id} style={styles.catSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.catIconWrap}>
                  <CatIcon color={C.primary} size={15} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionHeaderText}>{cat.title}</Text>
                  <Text style={styles.sectionHeaderDesc}>{cat.description}</Text>
                </View>
              </View>

              {cat.items.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => Linking.openURL(item.url)}
                  style={styles.card}
                  accessibilityRole="link"
                  accessibilityLabel={`Open ${item.title}`}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.file}>
                      <FileText color={C.primary} size={17} />
                    </View>
                    <View style={styles.cardCopy}>
                      <View style={styles.badgeRow}>
                        <Text style={styles.category}>{item.category}</Text>
                        <View style={styles.statusBadge}>
                          <CheckCircle2 color={C.green} size={10} />
                          <Text style={styles.statusBadgeText}>
                            {item.status === 'ACTIVE_GAZETTE'
                              ? 'Active Gazette'
                              : item.status === 'STATUTORY_ORDER'
                              ? 'Statutory Order'
                              : 'Official Portal'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                    </View>
                    <ExternalLink color="#89919B" size={15} />
                  </View>
                  <Text style={styles.summary}>{item.summary}</Text>
                  <View style={styles.citationRow}>
                    <Text style={styles.citation}>{item.citation}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          );
        })}

        {/* Official BIS Gateway */}
        <Pressable
          onPress={() => Linking.openURL('https://www.bis.gov.in/')}
          style={styles.bisButton}
          accessibilityRole="link"
        >
          <Globe2 color="#FFFFFF" size={16} />
          <Text style={styles.bisButtonText}>Open Official BIS Main Portal (bis.gov.in)</Text>
          <ExternalLink color="#FFFFFF" size={14} />
        </Pressable>

        <Text style={styles.disclaimer}>
          SahayakBIS is an evidence-grounded guidance companion for Indian Standards and BIS services. It is not a statutory certification authority, approval engine, or replacement for BIS CARE. Always verify with BIS directly before making compliance decisions.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 18, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 8 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  eyebrow: { color: C.amberDark, fontSize: 9.5, letterSpacing: 1.2, fontWeight: '800' },
  title: { color: C.navy, fontSize: 23, fontWeight: '800', marginTop: 2 },
  subtitle: { color: C.muted, fontSize: 12, fontWeight: '600', marginTop: 2, lineHeight: 16 },
  intro: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
    marginBottom: 12,
  },
  prototypeNotice: {
    backgroundColor: '#EEF6FC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7E1F5',
    padding: 12,
    marginBottom: 10,
    gap: 4,
  },
  prototypeNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prototypeNoticeTitle: {
    color: C.primaryDark,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  prototypeNoticeText: {
    color: '#2A4E6F',
    fontSize: 11.5,
    lineHeight: 16.5,
  },
  evidenceNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  evidenceNoticeHeading: {
    color: '#166534',
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  evidenceNoticeText: {
    color: '#166534',
    fontSize: 11,
    lineHeight: 16,
  },
  catSection: {
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  catIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#EEF6FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  sectionHeaderText: {
    color: C.navy,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  sectionHeaderDesc: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  card: {
    backgroundColor: C.bg,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    shadowColor: C.navy,
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  file: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: { flex: 1 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  category: {
    color: C.teal,
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusBadgeText: {
    color: '#065F46',
    fontSize: 8.5,
    fontWeight: '700',
  },
  cardTitle: { color: C.navy, fontSize: 13.5, fontWeight: '800', marginTop: 3, lineHeight: 18.5 },
  summary: { color: '#475569', fontSize: 12, lineHeight: 17, marginTop: 8 },
  citationRow: { marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  citation: { color: C.amberDark, fontSize: 10.5, fontWeight: '700' },
  bisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 8,
    marginBottom: 16,
  },
  bisButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12.5 },
  disclaimer: {
    color: '#94A3B8',
    fontSize: 10.5,
    lineHeight: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
