import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Clock3, ShieldCheck, Sparkles, Zap } from 'lucide-react-native';

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
  green: '#43A982',
};

type DemoQuery = {
  query: string;
  category: 'industry' | 'consumer' | 'safety';
  categoryLabel: string;
  description: string;
};

const DEMO_QUERIES: DemoQuery[] = [
  {
    query: 'Which BIS standard applies to LED bulbs?',
    category: 'industry',
    categoryLabel: 'Industry · Standard Discovery',
    description: 'Returns IS 16102 (Part 1 & 2):2012, CRS scheme, and lab testing parameters.',
  },
  {
    query: 'Is BIS certification required for LED lamps?',
    category: 'industry',
    categoryLabel: 'Industry · CRS Requirement',
    description: 'Grounds mandatory requirement under Electronics & IT Goods Order.',
  },
  {
    query: 'Show me the BIS compliance roadmap for LED lamps.',
    category: 'industry',
    categoryLabel: 'Industry · Milestone Roadmap',
    description: 'Interactive 5-stage certification roadmap from lab testing to R-number grant.',
  },
  {
    query: 'How do I verify a 6-digit HUID on gold jewellery?',
    category: 'consumer',
    categoryLabel: 'Consumer · HUID Verification',
    description: 'Explains the 3 mandatory marks and directs consumer to official BIS CARE app.',
  },
  {
    query: 'What does 22K916 mean?',
    category: 'consumer',
    categoryLabel: 'Consumer · Fineness Explanation',
    description: 'Details 6 fineness grades and parts-per-thousand purity under IS 1417:2016.',
  },
  {
    query: 'What are the silver hallmarking standards (IS 2112)?',
    category: 'consumer',
    categoryLabel: 'Consumer · Silver Hallmarking',
    description: 'Explains IS 2112, 6 fineness grades, voluntary scheme status, and purity assurance.',
  },
  {
    query: 'Can you guarantee that my product is BIS compliant?',
    category: 'safety',
    categoryLabel: 'Safety · Adversarial Abstention',
    description: 'Refuses guarantee, clarifies SahayakBIS advisory scope vs BIS sole authority.',
  },
  {
    query: 'I make electric blankets, what BIS standard applies?',
    category: 'safety',
    categoryLabel: 'Safety · Out of Pilot Scope',
    description: 'Explains pilot scope limits and directs user to official BIS Standards Directory.',
  },
];

export default function HistoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.icon}>
            <Clock3 color="#E3A62F" size={22} />
          </View>
          <View>
            <Text style={styles.eyebrow}>EVALUATOR QUICK-START</Text>
            <Text style={styles.title}>Demonstration Queries</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Select any verified golden test case below to inspect SahayakBIS evidence grounding,
          roadmaps, consumer guidance, and safe abstention.
        </Text>

        {/* Industry Group */}
        <View style={styles.sectionHeaderRow}>
          <View style={[styles.sectionDot, { backgroundColor: C.primary }]} />
          <Text style={styles.sectionHeaderText}>INDUSTRY PILOT (LED · IS 16102)</Text>
        </View>

        {DEMO_QUERIES.filter((q) => q.category === 'industry').map((item, idx) => (
          <Pressable
            key={idx}
            onPress={() => router.replace('/')}
            style={styles.queryCard}
            accessibilityRole="button"
            accessibilityLabel={`Test: ${item.query}`}
          >
            <View style={styles.queryCardTop}>
              <View style={styles.queryCategoryPill}>
                <Text style={styles.queryCategoryText}>{item.categoryLabel}</Text>
              </View>
              <ChevronRight color={C.primary} size={15} />
            </View>
            <Text style={styles.queryTitle}>"{item.query}"</Text>
            <Text style={styles.queryDesc}>{item.description}</Text>
          </Pressable>
        ))}

        {/* Consumer Group */}
        <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
          <View style={[styles.sectionDot, { backgroundColor: C.amberDark }]} />
          <Text style={[styles.sectionHeaderText, { color: C.amberDark }]}>CONSUMER PROTECTION (GOLD & SILVER)</Text>
        </View>

        {DEMO_QUERIES.filter((q) => q.category === 'consumer').map((item, idx) => (
          <Pressable
            key={idx}
            onPress={() => router.replace('/')}
            style={[styles.queryCard, styles.queryCardConsumer]}
            accessibilityRole="button"
            accessibilityLabel={`Test: ${item.query}`}
          >
            <View style={styles.queryCardTop}>
              <View style={[styles.queryCategoryPill, styles.queryCategoryPillConsumer]}>
                <Text style={[styles.queryCategoryText, { color: C.amberDark }]}>{item.categoryLabel}</Text>
              </View>
              <ChevronRight color={C.amberDark} size={15} />
            </View>
            <Text style={styles.queryTitle}>"{item.query}"</Text>
            <Text style={styles.queryDesc}>{item.description}</Text>
          </Pressable>
        ))}

        {/* Safety & Abstention Group */}
        <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
          <View style={[styles.sectionDot, { backgroundColor: C.teal }]} />
          <Text style={[styles.sectionHeaderText, { color: C.teal }]}>SAFETY & SAFE ABSTENTION</Text>
        </View>

        {DEMO_QUERIES.filter((q) => q.category === 'safety').map((item, idx) => (
          <Pressable
            key={idx}
            onPress={() => router.replace('/')}
            style={styles.queryCard}
            accessibilityRole="button"
            accessibilityLabel={`Test: ${item.query}`}
          >
            <View style={styles.queryCardTop}>
              <View style={[styles.queryCategoryPill, { backgroundColor: '#E8F5F5' }]}>
                <Text style={[styles.queryCategoryText, { color: C.teal }]}>{item.categoryLabel}</Text>
              </View>
              <ChevronRight color={C.teal} size={15} />
            </View>
            <Text style={styles.queryTitle}>"{item.query}"</Text>
            <Text style={styles.queryDesc}>{item.description}</Text>
          </Pressable>
        ))}

        {/* Evidence Gate Banner */}
        <View style={styles.gateNotice}>
          <ShieldCheck color={C.primaryDark} size={16} />
          <View style={{ flex: 1 }}>
            <Text style={styles.gateTitle}>Evidence Gate Guarantee</Text>
            <Text style={styles.gateText}>
              SahayakBIS operates on strict evidence grounding: no verified BIS citation → safe abstention.
              No ungrounded LLM hallucination is permitted.
            </Text>
          </View>
        </View>
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
  title: { color: C.navy, fontSize: 24, fontWeight: '800', marginTop: 3 },
  subtitle: {
    color: C.muted,
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    marginTop: 8,
  },
  sectionDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  sectionHeaderText: {
    color: C.navy,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  queryCard: {
    backgroundColor: C.bg,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: C.navy,
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  queryCardConsumer: {
    borderColor: '#E8D6A7',
    backgroundColor: '#FCFAF6',
  },
  queryCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  queryCategoryPill: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  queryCategoryPillConsumer: {
    backgroundColor: '#FFF6DF',
  },
  queryCategoryText: {
    color: C.primaryDark,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  queryTitle: {
    color: C.navy,
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 19,
  },
  queryDesc: {
    color: C.muted,
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 5,
  },
  gateNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EEF6FC',
    borderColor: '#BED8F0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
  },
  gateTitle: {
    color: C.primaryDark,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },
  gateText: {
    color: '#345270',
    fontSize: 11,
    lineHeight: 16,
  },
});
