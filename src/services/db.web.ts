import * as Haptics from 'expo-haptics';
import type { BookmarkRecord } from '@/src/types/news';

type WatchlistItem = { symbol: string; name: string; type: 'crypto' | 'stock' };

const BOOKMARKS_KEY = 'lazarus-report-bookmarks';
const WATCHLIST_KEY = 'lazarus-report-watchlist';

const readStorage = <T>(key: string): T[] => {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  const raw = localStorage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
};

const writeStorage = <T>(key: string, value: T[]) => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
};

const triggerBookmarkHaptic = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
  }
};

export const initializeDatabase = async () => undefined;

export const addBookmark = async (bookmark: BookmarkRecord) => {
  const bookmarks = readStorage<BookmarkRecord>(BOOKMARKS_KEY).filter((item) => item.id !== bookmark.id);
  bookmarks.unshift(bookmark);
  writeStorage(BOOKMARKS_KEY, bookmarks);
  await triggerBookmarkHaptic();
};

export const removeBookmark = async (id: string) => {
  const bookmarks = readStorage<BookmarkRecord>(BOOKMARKS_KEY).filter((item) => item.id !== id);
  writeStorage(BOOKMARKS_KEY, bookmarks);
  await triggerBookmarkHaptic();
};

export const isBookmarked = async (id: string) =>
  readStorage<BookmarkRecord>(BOOKMARKS_KEY).some((item) => item.id === id);

export const getBookmarks = async () =>
  readStorage<BookmarkRecord>(BOOKMARKS_KEY).sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  );

export const addWatchlistSymbol = async (symbol: string, name: string, type: 'crypto' | 'stock') => {
  const watchlist = readStorage<WatchlistItem>(WATCHLIST_KEY).filter((item) => item.symbol !== symbol);
  watchlist.push({ symbol, name, type });
  writeStorage(WATCHLIST_KEY, watchlist);
};

export const removeWatchlistSymbol = async (symbol: string) => {
  const watchlist = readStorage<WatchlistItem>(WATCHLIST_KEY).filter((item) => item.symbol !== symbol);
  writeStorage(WATCHLIST_KEY, watchlist);
};

export const getWatchlistSymbols = async () =>
  readStorage<WatchlistItem>(WATCHLIST_KEY).sort((left, right) => left.symbol.localeCompare(right.symbol));
