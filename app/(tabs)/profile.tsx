import React from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AlertCircle, Award, CheckCircle2, ChevronRight, ExternalLink, Factory, Globe2, Layers, ShieldCheck, Sparkles, UserCheck } from 'lucide-react-native';

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

const BIS_URL = 'https://www.bis.gov.in/';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Brand & Positioning */}
        <View style={styles.avatar}>
          <ShieldCheck color="#E3A62F" size={32} strokeWidth={2.3} />
        </View>
        <Text style={styles.title}>SahayakBIS</Text>
        <Text style={styles.headline}>National Standards & Conformity Intelligence Layer</Text>
        <Text style={styles.subtitle}>
          A conversational AI system designed to democratize access to 20,000+ Indian Standards, simplify conformity assessment for Indian MSMEs, and protect citizens.
        </Text>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>Grand Finale Architecture · Smart India Hackathon 2026</Text>
        </View>

        {/* 1. Value Proposition for All Stakeholders */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Universal Value Proposition</Text>

          {/* Industry */}
          <View style={styles.valueRow}>
            <View style={[styles.valueIconWrap, { backgroundColor: '#EEF6FC' }]}>
              <Factory color={C.primary} size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.valueBody}>
              <Text style={styles.valueTitle}>For Industry & MSMEs</Text>
              <Text style={styles.valueText}>
                Automated standard identification, clear distinction between voluntary standards and mandatory QCOs, step-by-step testing roadmaps, and direct routing to Manakonline & CRS.
              </Text>
            </View>
          </View>

          {/* Consumers */}
          <View style={styles.valueRow}>
            <View style={[styles.valueIconWrap, { backgroundColor: '#FFF8E6' }]}>
              <UserCheck color={C.amberDark} size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.valueBody}>
              <Text style={styles.valueTitle}>For Citizens & Consumers</Text>
              <Text style={styles.valueText}>
                Instant decoding of hallmarking marks and 6-digit HUID codes, verification guidance for ISI marks, anti-counterfeiting awareness, and direct linkage to the official BIS CARE app.
              </Text>
            </View>
          </View>

          {/* Regulators */}
          <View style={[styles.valueRow, { marginBottom: 0 }]}>
            <View style={[styles.valueIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <ShieldCheck color={C.green} size={18} strokeWidth={2.2} />
            </View>
            <View style={styles.valueBody}>
              <Text style={styles.valueTitle}>For BIS & Regulatory Bodies</Text>
              <Text style={styles.valueText}>
                Dramatically reduces repetitive public queries at regional/branch offices, standardizes guidance strictly based on gazetted orders, and drives grassroots compliance.
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Architectural Trust Framework */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Architectural Trust Framework</Text>

          <View style={styles.row}>
            <ShieldCheck color={C.primary} size={17} strokeWidth={2.2} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Closed-Domain Evidence Architecture</Text>
              <Text style={styles.rowText}>
                Zero open-web hallucinations. Every factual assertion is bounded by indexed official BIS standards, Ministry QCOs, and gazetted notifications.
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <CheckCircle2 color={C.green} size={17} strokeWidth={2.2} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Strict Evidence Gate & Safe Abstention</Text>
              <Text style={styles.rowText}>
                If verified BIS evidence is insufficient or unavailable, the engine explicitly declines to guess, preserving absolute regulatory credibility.
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Globe2 color={C.teal} size={17} strokeWidth={2.2} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Dual-Language Devanagari Pipeline</Text>
              <Text style={styles.rowText}>
                Native English and formal Devanagari Hindi support with strict rejection of romanized Hinglish to prevent ambiguous regulatory interpretation.
              </Text>
            </View>
          </View>

          <View style={[styles.row, { marginBottom: 0 }]}>
            <Award color={C.amberDark} size={17} strokeWidth={2.2} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Strict Authority Boundary</Text>
              <Text style={styles.rowText}>
                SahayakBIS acts as an advisory intelligence companion; statutory licensing, testing grants, and enforcement remain exclusively with BIS.
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Implementation Comparison: Prototype vs Production */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Implementation vs Production Architecture</Text>
          <Text style={styles.tableIntro}>
            Honest engineering comparison between the current Grand Finale prototype and the target national production deployment:
          </Text>

          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableColHeader, { flex: 1.1 }]}>DIMENSION</Text>
              <Text style={[styles.tableColHeader, { flex: 1.4 }]}>SIH PROTOTYPE</Text>
              <Text style={[styles.tableColHeader, { flex: 1.5 }]}>PRODUCTION TARGET</Text>
            </View>

            {/* Row 1: Coverage */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellDim, { flex: 1.1 }]}>Standards Scope</Text>
              <Text style={[styles.tableCellProto, { flex: 1.4 }]}>Curated representative slice (LED IS 16102:2026, Gold IS 1417, Silver IS 2112)</Text>
              <Text style={[styles.tableCellProd, { flex: 1.5 }]}>All 20,000+ Indian Standards across 15 Division Councils</Text>
            </View>

            {/* Row 2: Evidence Store */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellDim, { flex: 1.1 }]}>Evidence Store</Text>
              <Text style={[styles.tableCellProto, { flex: 1.4 }]}>Local verified evidence database + gazette URLs</Text>
              <Text style={[styles.tableCellProd, { flex: 1.5 }]}>Distributed vector store (pgvector) + BM25 hybrid semantic search</Text>
            </View>

            {/* Row 3: Reasoning Engine */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellDim, { flex: 1.1 }]}>Reasoning Engine</Text>
              <Text style={[styles.tableCellProto, { flex: 1.4 }]}>Deterministic semantic taxonomy + bilingual generator</Text>
              <Text style={[styles.tableCellProd, { flex: 1.5 }]}>Fine-tuned bilingual LLM with grounded RAG verification</Text>
            </View>

            {/* Row 4: Ingestion */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellDim, { flex: 1.1 }]}>Data Ingestion</Text>
              <Text style={[styles.tableCellProto, { flex: 1.4 }]}>Curated official standards, LIMS records & CROs</Text>
              <Text style={[styles.tableCellProd, { flex: 1.5 }]}>Automated Gazette & Ministry QCO ETL pipeline</Text>
            </View>

            {/* Row 5: Integration */}
            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.tableCellDim, { flex: 1.1 }]}>Integrations</Text>
              <Text style={[styles.tableCellProto, { flex: 1.4 }]}>Direct links to official BIS portals & BIS CARE</Text>
              <Text style={[styles.tableCellProd, { flex: 1.5 }]}>Direct API sync with Manakonline, LIMS, and BIS CARE services</Text>
            </View>
          </View>
        </View>

        {/* 4. Statutory Disclaimer */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <AlertCircle color={C.amberDark} size={18} />
            <Text style={styles.disclaimerTitle}>Statutory Authority Disclaimer</Text>
          </View>
          <Text style={styles.disclaimerText}>
            SahayakBIS is an advisory AI companion developed as an academic and technological prototype for Smart India Hackathon 2026.
            {'\n\n'}
            SahayakBIS is NOT an official government authority, conformity assessment body, or testing laboratory. The Bureau of Indian Standards (BIS), established under the BIS Act, 2016, remains the sole statutory authority for Indian Standards, certification, and licensing.
            {'\n\n'}
            All official filings must be completed on Manakonline or the BIS CRS Portal. Consumer verification is performed on the official BIS CARE mobile application.
          </Text>
        </View>

        {/* Official BIS Gateway */}
        <Pressable
          onPress={() => Linking.openURL(BIS_URL)}
          style={styles.bisButton}
          accessibilityRole="link"
        >
          <Globe2 color="#FFFFFF" size={16} />
          <Text style={styles.bisButtonText}>Open Official BIS Main Website (bis.gov.in)</Text>
          <ExternalLink color="#FFFFFF" size={14} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 18, paddingTop: 26, alignItems: 'center', paddingBottom: 36 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.navy,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  title: { color: C.navy, fontSize: 26, fontWeight: '800', marginTop: 12 },
  headline: {
    color: C.primaryDark,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  subtitle: {
    color: C.muted,
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 340,
    marginTop: 6,
  },
  badgeWrap: {
    backgroundColor: C.primaryLight,
    borderColor: '#BED8F0',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 4,
    marginTop: 10,
  },
  badgeText: {
    color: C.primaryDark,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: C.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 15,
    width: '100%',
    marginTop: 14,
    shadowColor: C.navy,
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: { color: C.navy, fontSize: 14, fontWeight: '800', marginBottom: 12, letterSpacing: 0.3 },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  valueIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  valueBody: { flex: 1 },
  valueTitle: { color: C.navy, fontSize: 12.5, fontWeight: '700' },
  valueText: { color: '#475569', fontSize: 11.5, lineHeight: 16.5, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  rowBody: { flex: 1 },
  rowTitle: { color: C.navy, fontSize: 12.5, fontWeight: '700' },
  rowText: { color: '#475569', fontSize: 11.5, lineHeight: 16.5, marginTop: 2 },
  tableIntro: {
    color: C.muted,
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
  },
  tableColHeader: {
    color: C.navy,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'flex-start',
  },
  tableCellDim: {
    color: C.navy,
    fontSize: 10.5,
    fontWeight: '700',
    paddingRight: 6,
  },
  tableCellProto: {
    color: '#334155',
    fontSize: 10,
    lineHeight: 14,
    paddingRight: 6,
  },
  tableCellProd: {
    color: C.primaryDark,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
  },
  disclaimerCard: {
    backgroundColor: '#FFFBF0',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F5E4B5',
    padding: 14,
    width: '100%',
    marginTop: 14,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },
  disclaimerTitle: { color: C.amberDark, fontSize: 13, fontWeight: '800' },
  disclaimerText: { color: '#685419', fontSize: 11, lineHeight: 16.5 },
  bisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginTop: 16,
    width: '100%',
  },
  bisButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12.5 },
});
