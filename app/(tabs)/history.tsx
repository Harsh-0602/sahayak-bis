import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Clock3, MessageCircle } from 'lucide-react-native';

const C = {
  primary: '#0070C0',
  primaryDark: '#005B96',
  primaryLight: '#EAF5FC',
  navy: '#0C2D50',
  text: '#111111',
  muted: '#555555',
  bg: '#FFFFFF',
  border: '#B7D3EA',
};

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Clock3 color="#E3A62F" size={22} />
        </View>
        <Text style={styles.title}>Your Questions</Text>
        <Text style={styles.subtitle}>
          Recent queries will appear here as you explore BIS standards.
        </Text>

        <View style={styles.empty}>
          <MessageCircle color={C.primary} size={26} />
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptyText}>
            Start by asking a question on the Explore tab — for example, ask about LED bulb certification or gold hallmarking verification.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Supported topics</Text>
          <View style={styles.topicRow}>
            <View style={styles.topicBadge}>
              <Text style={styles.topicText}>LED Bulbs · IS 16102</Text>
            </View>
            <View style={styles.topicBadge}>
              <Text style={styles.topicText}>Gold Hallmarking · IS 1417</Text>
            </View>
            <View style={styles.topicBadge}>
              <Text style={styles.topicText}>Silver Hallmarking · IS 2112</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, paddingTop: 36 },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: C.navy, fontSize: 27, fontWeight: '800', marginTop: 16 },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  empty: {
    backgroundColor: C.bg,
    borderRadius: 20,
    borderColor: C.border,
    borderWidth: 1,
    alignItems: 'center',
    padding: 26,
    marginTop: 28,
    shadowColor: C.navy,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  emptyTitle: { color: C.navy, fontSize: 16, fontWeight: '800', marginTop: 12 },
  emptyText: {
    color: C.muted,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    maxWidth: 280,
  },
  infoCard: {
    backgroundColor: C.primaryLight,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  infoTitle: { color: C.primaryDark, fontWeight: '800', fontSize: 13, marginBottom: 10 },
  topicRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  topicBadge: {
    backgroundColor: C.bg,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  topicText: { color: C.primaryDark, fontSize: 11, fontWeight: '700' },
});
