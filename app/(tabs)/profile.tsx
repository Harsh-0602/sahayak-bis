import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExternalLink, Globe2, ShieldCheck, Sparkles, AlertCircle, Layers } from 'lucide-react-native';

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

const BIS_URL = 'https://www.bis.gov.in/';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Brand */}
        <View style={styles.avatar}>
          <ShieldCheck color="#E3A62F" size={32} />
        </View>
        <Text style={styles.title}>SahayakBIS</Text>
        <Text style={styles.subtitle}>
          Conversational Guidance Layer for Indian Standards & BIS Services
        </Text>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>Grand Finale Prototype · SIH 2026</Text>
        </View>

        {/* Architecture & Principles */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Core Design Principles</Text>

          <View style={styles.row}>
            <ShieldCheck color={C.primary} size={18} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Evidence Gate Verification</Text>
              <Text style={styles.rowText}>
                Dual-pass grounded answers: no verified BIS citation → safe abstention. Zero unsupported compliance claims.
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Globe2 color={C.teal} size={18} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Bilingual Guidance (EN / हिन्दी)</Text>
              <Text style={styles.rowText}>
                Complete English and Devanagari Hindi support, with strict rejection of Hinglish transliteration.
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Sparkles color={C.amberDark} size={18} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Industry & Consumer Dual Scope</Text>
              <Text style={styles.rowText}>
                Demonstrates technical compliance roadmaps for manufacturers alongside hallmarking purity verification for consumers.
              </Text>
            </View>
          </View>
        </View>

        {/* Demonstration Scope */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pilot Scope (Extensible Framework)</Text>
          <Text style={styles.scopeIntro}>
            This prototype demonstrates three representative Indian Standard categories across regulatory regimes:
          </Text>
          {[
            {
              cat: 'Industry: LED Lamps',
              std: 'IS 16102 (Part 1 & 2):2012',
              scheme: 'Compulsory Registration Scheme (CRS) · Mandatory',
            },
            {
              cat: 'Consumer: Gold Jewellery',
              std: 'IS 1417:2016',
              scheme: 'Quality Control Order (QCO) · Mandatory Hallmarking + HUID',
            },
            {
              cat: 'Consumer: Silver Jewellery',
              std: 'IS 2112:2014',
              scheme: 'BIS Hallmarking Scheme · Voluntary Third-Party Assurance',
            },
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

        {/* Non-Government Disclaimer */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <AlertCircle color={C.amberDark} size={17} />
            <Text style={styles.disclaimerTitle}>Statutory Authority & Disclaimer</Text>
          </View>
          <Text style={styles.disclaimerText}>
            SahayakBIS is an advisory AI companion created as an academic prototype for Smart India Hackathon 2026.
            {'\n\n'}
            SahayakBIS is NOT a certification body, testing laboratory, or approval authority.
            The Bureau of Indian Standards (BIS) remains the sole statutory authority for Indian Standards,
            licensing, and conformity assessment.
            {'\n\n'}
            Official applications must be filed directly on the BIS portal, and consumer hallmarking
            lookup is performed on the official BIS CARE mobile app.
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
  content: { padding: 20, paddingTop: 32, alignItems: 'center', paddingBottom: 36 },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.navy,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  title: { color: C.navy, fontSize: 26, fontWeight: '800', marginTop: 14 },
  subtitle: {
    color: C.muted,
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 320,
    marginTop: 6,
  },
  badgeWrap: {
    backgroundColor: C.primaryLight,
    borderColor: '#BED8F0',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  badgeText: {
    color: C.primaryDark,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: C.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    width: '100%',
    marginTop: 16,
    shadowColor: C.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: { color: C.navy, fontSize: 15, fontWeight: '800', marginBottom: 12 },
  scopeIntro: { color: C.muted, fontSize: 12, lineHeight: 17, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, marginBottom: 14 },
  rowBody: { flex: 1 },
  rowTitle: { color: C.navy, fontSize: 13, fontWeight: '700' },
  rowText: { color: C.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },

  standardRow: {
    backgroundColor: '#F5F8FC',
    borderRadius: 10,
    padding: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D8E8F5',
  },
  standardCat: { color: C.navy, fontSize: 13, fontWeight: '800' },
  standardStd: { color: C.muted, fontSize: 11.5, marginTop: 2 },
  schemeBadge: {
    backgroundColor: '#EAF5FC',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  schemeText: { color: C.primaryDark, fontSize: 10, fontWeight: '800' },

  disclaimerCard: {
    backgroundColor: '#FFFBF0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F5E4B5',
    padding: 16,
    width: '100%',
    marginTop: 16,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },
  disclaimerTitle: { color: C.amberDark, fontSize: 13.5, fontWeight: '800' },
  disclaimerText: { color: '#685419', fontSize: 11.5, lineHeight: 17 },

  bisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 24,
    marginTop: 20,
    width: '100%',
  },
  bisButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
});
