import React, { useEffect, useState } from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock3, ExternalLink, MessageSquare, RotateCcw, Search, ShieldCheck, Sparkles, Trash2 } from 'lucide-react-native';
import { clearHistory, getHistory, HistoryItem, subscribeHistory } from '@/lib/historyStore';

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
  red: '#DC2626',
};

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today at ${timeStr}`;
  return `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })} at ${timeStr}`;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Initial fetch
    setHistoryItems(getHistory());
    // Subscribe to live updates as the user searches in the home tab
    const unsubscribe = subscribeHistory((items) => {
      setHistoryItems([...items]);
    });
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.icon}>
            <Clock3 color="#E3A62F" size={22} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>USER SEARCH HISTORY</Text>
            <Text style={styles.title}>Search History</Text>
            <Text style={styles.subtitle}>
              {historyItems.length === 0
                ? 'Your asked questions and verified BIS answers will appear here.'
                : `${historyItems.length} ${historyItems.length === 1 ? 'query' : 'queries'} recorded in your active session.`}
            </Text>
          </View>

          {historyItems.length > 0 && (
            <Pressable
              onPress={() => clearHistory()}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear history"
            >
              <Trash2 color={C.red} size={14} />
              <Text style={styles.clearButtonText}>Clear</Text>
            </Pressable>
          )}
        </View>

        {/* Empty State */}
        {historyItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Search color={C.primaryDark} size={32} strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>No Searches Yet</Text>
            <Text style={styles.emptyDesc}>
              You have not asked any questions yet. Go to the Explore tab and search any question about Indian Standards, certification, or hallmarking.
            </Text>
            <Pressable
              onPress={() => router.replace('/')}
              style={styles.startSearchButton}
              accessibilityRole="button"
              accessibilityLabel="Start asking questions"
            >
              <MessageSquare color="#FFFFFF" size={16} />
              <Text style={styles.startSearchText}>Ask a Question</Text>
            </Pressable>
          </View>
        ) : (
          /* Live Dynamic Query List */
          <View style={styles.listContainer}>
            {historyItems.map((item) => (
              <View key={item.id} style={styles.card}>
                {/* Meta Header */}
                <View style={styles.cardMetaRow}>
                  <View style={styles.timeWrap}>
                    <Clock3 color={C.muted} size={11} />
                    <Text style={styles.timeText}>{formatTimestamp(item.timestamp)}</Text>
                  </View>
                  <View style={styles.langPill}>
                    <Text style={styles.langText}>{item.language === 'Hindi' ? 'हिन्दी' : 'English'}</Text>
                  </View>
                </View>

                {/* User Query */}
                <View style={styles.queryWrap}>
                  <Text style={styles.queryPrefix}>Q</Text>
                  <Text style={styles.queryText}>"{item.query}"</Text>
                </View>

                {/* Answer Content */}
                <View style={styles.answerWrap}>
                  <Text style={styles.answerPrefix}>ANSWER</Text>
                  <Text style={styles.answerText}>{item.answerText}</Text>
                </View>

                {/* Citation & Source Info */}
                {item.citation && (
                  <View style={styles.citationRow}>
                    <ShieldCheck color={C.green} size={13} />
                    <Text style={styles.citationText} numberOfLines={1}>
                      {item.citation}
                    </Text>
                    {item.sourceUrl && (
                      <Pressable
                        onPress={() => Linking.openURL(item.sourceUrl!)}
                        style={styles.sourceLink}
                        accessibilityRole="link"
                      >
                        <ExternalLink color={C.primary} size={12} />
                      </Pressable>
                    )}
                  </View>
                )}

                {/* Card Footer: Ask again / Continue in chat */}
                <View style={styles.cardFooter}>
                  <Pressable
                    onPress={() => router.replace('/')}
                    style={styles.continueAction}
                    accessibilityRole="button"
                    accessibilityLabel="Open in conversation"
                  >
                    <RotateCcw color={C.primary} size={12} />
                    <Text style={styles.continueActionText}>Open in Conversation</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Evidence Trust Note */}
        <View style={styles.gateNotice}>
          <ShieldCheck color={C.green} size={16} strokeWidth={2.2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.gateTitle}>Evidence Grounding Verification</Text>
            <Text style={styles.gateText}>
              All recorded answers are verified against official BIS documentation. No ungrounded LLM hallucination is retained.
            </Text>
          </View>
        </View>
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
  subtitle: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 16.5,
    marginTop: 2,
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 6,
  },
  clearButtonText: {
    color: C.red,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 30,
    marginTop: 24,
    marginBottom: 20,
    gap: 10,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF6FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    color: C.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyDesc: {
    color: C.muted,
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 320,
  },
  startSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
  },
  startSearchText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  listContainer: {
    marginTop: 16,
    gap: 12,
  },
  card: {
    backgroundColor: C.bg,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    shadowColor: C.navy,
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '600',
  },
  langPill: {
    backgroundColor: '#EEF6FC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  langText: {
    color: C.primaryDark,
    fontSize: 9.5,
    fontWeight: '700',
  },
  queryWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 9,
    marginBottom: 10,
  },
  queryPrefix: {
    color: C.primaryDark,
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: '#E0EEF9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  queryText: {
    flex: 1,
    color: C.navy,
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 17,
  },
  answerWrap: {
    paddingHorizontal: 2,
    marginBottom: 8,
  },
  answerPrefix: {
    color: C.teal,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  answerText: {
    color: '#334155',
    fontSize: 12,
    lineHeight: 17,
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  citationText: {
    flex: 1,
    color: '#166534',
    fontSize: 10.5,
    fontWeight: '700',
  },
  sourceLink: {
    padding: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 4,
  },
  continueAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  continueActionText: {
    color: C.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  gateNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 18,
  },
  gateTitle: {
    color: '#166534',
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  gateText: {
    color: '#166534',
    fontSize: 11,
    lineHeight: 16,
  },
});
