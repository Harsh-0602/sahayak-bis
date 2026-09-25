export type HistoryItem = {
  id: string;
  query: string;
  answerText: string;
  citation?: string;
  sourceUrl?: string;
  timestamp: number;
  language?: 'English' | 'Hindi';
  abstention?: boolean;
  hinglish?: boolean;
};

const STORAGE_KEY = 'sahayakbis_user_query_history';

let inMemoryHistory: HistoryItem[] = [];

// Initialize from localStorage if running in browser / web environment
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      inMemoryHistory = JSON.parse(raw);
    }
  } catch (e) {
    inMemoryHistory = [];
  }
}

type Listener = (items: HistoryItem[]) => void;
const listeners = new Set<Listener>();

export function getHistory(): HistoryItem[] {
  return [...inMemoryHistory];
}

export function addHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'> & { id?: string; timestamp?: number }): HistoryItem {
  const newItem: HistoryItem = {
    id: item.id || `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    query: item.query,
    answerText: item.answerText,
    citation: item.citation,
    sourceUrl: item.sourceUrl,
    timestamp: item.timestamp || Date.now(),
    language: item.language,
    abstention: item.abstention,
    hinglish: item.hinglish,
  };

  // Prepend new query to history (most recent first)
  inMemoryHistory = [newItem, ...inMemoryHistory.filter(h => h.id !== newItem.id)];

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inMemoryHistory));
    } catch (e) {
      // Storage unavailable or quota exceeded
    }
  }

  listeners.forEach((fn) => {
    try {
      fn(inMemoryHistory);
    } catch (e) {}
  });

  return newItem;
}

export function clearHistory(): void {
  inMemoryHistory = [];
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }
  listeners.forEach((fn) => {
    try {
      fn(inMemoryHistory);
    } catch (e) {}
  });
}

export function subscribeHistory(listener: Listener): () => void {
  listeners.add(listener);
  // Initial callback with current data
  listener(inMemoryHistory);
  return () => {
    listeners.delete(listener);
  };
}
