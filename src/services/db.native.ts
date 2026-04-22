import * as Haptics from 'expo-haptics';
import * as SQLite from 'expo-sqlite';
import type { BookmarkRecord } from '@/src/types/news';

const databasePromise = SQLite.openDatabaseAsync('lazarus-report.db');

const triggerBookmarkHaptic = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
  }
};

export const initializeDatabase = async () => {
  const db = await databasePromise;

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      source TEXT NOT NULL,
      imageUrl TEXT,
      contentUrl TEXT NOT NULL,
      publishedAt TEXT NOT NULL,
      summary TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS watchlist (
      symbol TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL
    );
  `);

  return db;
};

export const addBookmark = async (bookmark: BookmarkRecord) => {
  const db = await initializeDatabase();

  await db.runAsync(
    `INSERT OR REPLACE INTO bookmarks (id, title, source, imageUrl, contentUrl, publishedAt, summary)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    bookmark.id,
    bookmark.title,
    bookmark.source,
    bookmark.imageUrl ?? null,
    bookmark.contentUrl,
    bookmark.publishedAt,
    bookmark.summary
  );

  await triggerBookmarkHaptic();
};

export const removeBookmark = async (id: string) => {
  const db = await initializeDatabase();
  await db.runAsync('DELETE FROM bookmarks WHERE id = ?', id);
  await triggerBookmarkHaptic();
};

export const isBookmarked = async (id: string) => {
  const db = await initializeDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM bookmarks WHERE id = ?',
    id
  );

  return Boolean(result?.count);
};

export const getBookmarks = async () => {
  const db = await initializeDatabase();
  return db.getAllAsync<BookmarkRecord>(
    'SELECT id, title, source, imageUrl, contentUrl, publishedAt, summary FROM bookmarks ORDER BY publishedAt DESC'
  );
};

export const addWatchlistSymbol = async (symbol: string, name: string, type: 'crypto' | 'stock') => {
  const db = await initializeDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO watchlist (symbol, name, type) VALUES (?, ?, ?)',
    symbol,
    name,
    type
  );
};

export const removeWatchlistSymbol = async (symbol: string) => {
  const db = await initializeDatabase();
  await db.runAsync('DELETE FROM watchlist WHERE symbol = ?', symbol);
};

export const getWatchlistSymbols = async () => {
  const db = await initializeDatabase();
  return db.getAllAsync<{ symbol: string; name: string; type: 'crypto' | 'stock' }>(
    'SELECT symbol, name, type FROM watchlist ORDER BY type ASC, symbol ASC'
  );
};
