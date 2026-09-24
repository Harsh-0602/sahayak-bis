import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExternalLink, Globe2, ShieldCheck, Sparkles } from 'lucide-react-native';

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

const BIS_URL = 'https://www.bis.gov.in/';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Brand */}
        <View style={styles.avatar}>
          <ShieldCheck color="#E3A62F" size={30} />
        </View>
        <Text style={styles.title}>SahayakBIS</Text>
        <Text style={styles.subtitle}>
          An evidence-grounded guidance assistant for Indian Standards and BIS services.
        </Text>
        <Text style={styles.badge}>Prototype · Smart India Hackathon 2026</Text>

        {/* About card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>

          <View style={styles.row}>
            <Globe2 color={C.teal} size={18} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Bilingual support</Text>
              <Text style={styles.rowText}>Ask in English or Hindi (हिन्दी · Devanagari)</Text>
            </View>
          </View>

          <View style={styles.row}>
            <ShieldCheck color={C.primary} size={18} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Evidence-first answers</Text>
              <Text style={styles.rowText}>No verified BIS evidence → safe abstention, not a guess</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Sparkles color={C.amberDark} size={18} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Certification Roadmap</Text>
              <Text style={styles.rowText}>Step-by-step guidance from standard to BIS registration</Text>
            </View>
          </View>
        </View>

        {/* Covered standards */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Covered in this prototype</Text>
          {[
            { cat: 'LED Bulbs', std: 'IS 16102 (Part 1):2012 · IS 16102 (Part 2):2012', scheme: 'CRS' },
            { cat: 'Gold Hallmarking', std: 'IS 1417 (Gold & Gold Alloys)', scheme: 'Hallmarking + HUID' },
            { cat: 'Silver Hallmarking', std: 'IS 2112 (Silver & Silver Alloys)', scheme: 'Hallmarking + HUID' },
          ].map((item) => (
            <View key={item.cat} style={styles.standardRow}>
              <Text style={styles.standardCat}>{item.cat}</Text>
              <Text style={styles.standardStd}>{item.std}</Text>
              <View style={styles.schemeBadge}>
                <Text style={styles.schemeText}>{item.scheme}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Important Notice</Text>
          <Text style={styles.disclaimerText}>
            SahayakBIS is a guidance tool. It is not a certification authority, approval engine,
            legal authority or replacement for BIS Care. BIS remains the sole authority on Indian
            Standards and certification.{'\n\n'}
            All answers are grounded in official BIS sources. Verify with BIS directly before
            making compliance decisions.
          </Text>
        </View>

        {/* Official BIS link */}
        <Pressable
          onPress={() => Linking.openURL(BIS_URL)}
          style={styles.bisButton}
          accessibilityRole="link"
        >
          <Globe2 color="#FFFFFF" size={15} />
          <Text style={styles.bisButtonText}>Open Official BIS Website</Text>
          <ExternalLink color="#FFFFFF" size={13} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, paddingTop: 40, alignItems: 'center', paddingBottom: 36 },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 24,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: C.navy, fontSize: 28, fontWeight: '800', marginTop: 16 },
  subtitle: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 300,
    marginTop: 7,
  },
  badge: {
    color: C.teal,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: C.bg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    width: '100%',
    padding: 16,
    marginTop: 20,
    gap: 14,
    shadowColor: C.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: { color: C.navy, fontWeight: '800', fontSize: 14, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  rowBody: { flex: 1 },
  rowTitle: { color: C.navy, fontWeight: '800', fontSize: 13.5 },
  rowText: { color: C.muted, fontSize: 12, marginTop: 3, lineHeight: 17 },

  // Standards
  standardRow: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 11,
    gap: 3,
  },
  standardCat: { color: C.navy, fontWeight: '800', fontSize: 13 },
  standardStd: { color: C.muted, fontSize: 11.5 },
  schemeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 4,
  },
  schemeText: { color: C.primaryDark, fontSize: 10.5, fontWeight: '700' },

  // Disclaimer
  disclaimerCard: {
    backgroundColor: '#F5F8FC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    width: '100%',
    padding: 15,
    marginTop: 20,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
  },
  disclaimerTitle: { color: C.primaryDark, fontWeight: '800', fontSize: 13, marginBottom: 7 },
  disclaimerText: { color: C.muted, fontSize: 12, lineHeight: 18 },

  bisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 13,
    paddingVertical: 13,
    marginTop: 20,
    width: '100%',
  },
  bisButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
});
