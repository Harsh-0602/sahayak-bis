import { useEffect, useState } from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExternalLink, FileText, Globe2, ShieldCheck } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

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
};

type Source = { title: string; url: string; citation: string; summary: string; category: string };

const fallback: Source[] = [
  {
    title: 'Indian Standards on LED (IS 16102)',
    url: 'https://bis.gov.in/other/LEDSeries.pdf',
    citation: 'BIS LED Series · IS 16102',
    summary: 'Official list covering LED lamps, modules, control gear, safety (Part 1) and performance (Part 2) requirements under the Compulsory Registration Scheme (CRS).',
    category: 'LED Bulbs · CRS',
  },
  {
    title: 'Gold & Silver Hallmarking FAQs',
    url: 'https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq/?lang=en',
    citation: 'BIS Gold & Silver · HUID',
    summary: 'Covers gold (IS 1417) and silver (IS 2112) purity standards, 6-digit HUID verification, fineness grades and assaying centres.',
    category: 'Hallmarking · IS 1417 & IS 2112',
  },
  {
    title: 'Consumer Protection & HUID Verification',
    url: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en',
    citation: 'BIS Consumer Protection',
    summary: 'Official guidance on using BIS CARE mobile app to verify hallmarked gold and silver jewellery by HUID before buying.',
    category: 'Consumer · BIS CARE',
  },
  {
    title: 'BIS Product Certification Portal',
    url: 'https://www.bis.gov.in/product-certification/online-information/',
    citation: 'BIS Product Certification',
    summary: 'BIS information for manufacturers and applicants about product certification, CRS registration and online services.',
    category: 'Certification · Manufacturers',
  },
];

export default function SourcesScreen() {
  const [sources, setSources] = useState<Source[]>(fallback);

  useEffect(() => {
    (async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from('sahayakbis_sources')
        .select('title,url,citation,summary,category')
        .order('created_at');
      if (data?.length) setSources(data as Source[]);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.icon}>
            <ShieldCheck color="#E3A62F" size={22} />
          </View>
          <View>
            <Text style={styles.eyebrow}>TRUST CENTRE</Text>
            <Text style={styles.title}>Verified Sources</Text>
          </View>
        </View>

        <Text style={styles.intro}>
          Every answer in SahayakBIS is tied to an official BIS reference below.
          SahayakBIS is a guidance tool — BIS remains the authority.
        </Text>

        {/* Evidence Gate notice */}
        <View style={styles.evidenceNotice}>
          <ShieldCheck color={C.primaryDark} size={14} />
          <Text style={styles.evidenceNoticeText}>
            Evidence Gate: answers are only provided when verified BIS evidence exists. No evidence → safe abstention.
          </Text>
        </View>

        {/* Source cards */}
        {sources.map((source) => (
          <Pressable
            key={source.url}
            onPress={() => Linking.openURL(source.url)}
            style={styles.card}
            accessibilityRole="link"
            accessibilityLabel={`Open ${source.title}`}
          >
            <View style={styles.cardTop}>
              <View style={styles.file}>
                <FileText color={C.primary} size={18} />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.category}>{source.category}</Text>
                <Text style={styles.cardTitle}>{source.title}</Text>
              </View>
              <ExternalLink color="#89919B" size={16} />
            </View>
            <Text style={styles.summary}>{source.summary}</Text>
            <View style={styles.citationRow}>
              <Text style={styles.citation}>{source.citation}</Text>
            </View>
          </Pressable>
        ))}

        {/* Official BIS link */}
        <Pressable
          onPress={() => Linking.openURL('https://www.bis.gov.in/')}
          style={styles.bisButton}
          accessibilityRole="link"
        >
          <Globe2 color="#FFFFFF" size={15} />
          <Text style={styles.bisButtonText}>Open Official BIS Website</Text>
          <ExternalLink color="#FFFFFF" size={13} />
        </Pressable>

        <Text style={styles.disclaimer}>
          SahayakBIS is a guidance tool for Indian Standards and BIS services.
          It is not a certification authority, approval engine or replacement for BIS Care.
          Always verify with BIS directly.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: { color: C.amberDark, fontSize: 10, letterSpacing: 1.4, fontWeight: '800' },
  title: { color: C.navy, fontSize: 25, fontWeight: '800', marginTop: 3 },
  intro: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 16,
    marginBottom: 14,
  },
  evidenceNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: C.primaryLight,
    borderRadius: 10,
    padding: 11,
    marginBottom: 18,
  },
  evidenceNoticeText: {
    flex: 1,
    color: C.primaryDark,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  card: {
    backgroundColor: C.bg,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    shadowColor: C.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  file: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: { flex: 1 },
  category: {
    color: C.teal,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardTitle: { color: C.navy, fontSize: 14.5, fontWeight: '800', marginTop: 3, lineHeight: 20 },
  summary: { color: C.muted, fontSize: 12.5, lineHeight: 18.5, marginTop: 12 },
  citationRow: { marginTop: 10 },
  citation: { color: C.amberDark, fontSize: 11, fontWeight: '800' },
  bisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 13,
    paddingVertical: 13,
    marginTop: 6,
    marginBottom: 18,
  },
  bisButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  disclaimer: {
    color: '#9BA1A5',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
