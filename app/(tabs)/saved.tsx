import { useEffect, useState } from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExternalLink, FileText, ShieldCheck } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

type Source = { title: string; url: string; citation: string; summary: string; category: string };
const fallback: Source[] = [
  { title: 'Indian Standards on LED (IS 16102)', url: 'https://bis.gov.in/other/LEDSeries.pdf', citation: 'BIS LED Series · IS 16102', summary: 'Official list covering LED lamps, modules, control gear, safety and performance requirements.', category: 'LED Bulbs' },
  { title: 'Gold & Silver Hallmarking Overview & FAQs', url: 'https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq/?lang=en', citation: 'BIS Gold & Silver · HUID', summary: 'Covers gold and silver purity standards, 6-digit HUID verification, and assaying centres under IS 1417 & IS 2112.', category: 'Gold & Silver' },
  { title: 'Consumer Protection & HUID Verification', url: 'https://www.bis.gov.in/hallmarking-overview/consumer-protection?lang=en', citation: 'BIS Consumer Protection', summary: 'Consumer guidance on using the BIS CARE mobile app to verify hallmarking before buying.', category: 'Hallmarking' },
];

export default function SourcesScreen() {
  const [sources, setSources] = useState<Source[]>(fallback);
  useEffect(() => { (async () => { if (!supabase) return; const { data } = await supabase.from('sahayakbis_sources').select('title,url,citation,summary,category').order('created_at'); if (data?.length) setSources(data as Source[]); })(); }, []);
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.icon}><ShieldCheck color="#F5C24B" size={22} /></View>
          <View>
            <Text style={styles.eyebrow}>TRUST CENTRE</Text>
            <Text style={styles.title}>Verified sources</Text>
          </View>
        </View>
        <Text style={styles.intro}>Every answer in SahayakBIS is tied to an official BIS reference. Open any source to read the original information.</Text>
        {sources.map((source) => (
          <Pressable key={source.url} onPress={() => Linking.openURL(source.url)} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.file}><FileText color="#2C8D93" size={18} /></View>
              <View style={styles.cardCopy}>
                <Text style={styles.category}>{source.category}</Text>
                <Text style={styles.cardTitle}>{source.title}</Text>
              </View>
              <ExternalLink color="#89919B" size={17} />
            </View>
            <Text style={styles.summary}>{source.summary}</Text>
            <Text style={styles.citation}>{source.citation}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FBF8F1' },
  content: { padding: 20, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  icon: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#0C2D50', alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: '#B78012', fontSize: 10, letterSpacing: 1.4, fontWeight: '800' },
  title: { color: '#0C2D50', fontSize: 26, fontWeight: '800', marginTop: 3 },
  intro: { color: '#687681', fontSize: 14, lineHeight: 21, marginTop: 18, marginBottom: 18 },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E9E4DA', borderWidth: 1, borderRadius: 18, padding: 15, marginBottom: 11 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  file: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#EAF4F3', alignItems: 'center', justifyContent: 'center' },
  cardCopy: { flex: 1 },
  category: { color: '#2C8D93', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  cardTitle: { color: '#173650', fontSize: 15, fontWeight: '800', marginTop: 3 },
  summary: { color: '#687681', fontSize: 12, lineHeight: 18, marginTop: 12 },
  citation: { color: '#9D7314', fontSize: 11, fontWeight: '800', marginTop: 10 },
});
