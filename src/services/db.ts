import { Platform } from 'react-native';

// Dynamically export based on platform to ensure web doesn't load native SQLite
const db = Platform.OS === 'web' ? require('./db.web') : require('./db.native');

export const initializeDatabase = db.initializeDatabase;
export const addBookmark = db.addBookmark;
export const removeBookmark = db.removeBookmark;
export const isBookmarked = db.isBookmarked;
export const getBookmarks = db.getBookmarks;
export const addWatchlistSymbol = db.addWatchlistSymbol;
export const removeWatchlistSymbol = db.removeWatchlistSymbol;
export const getWatchlistSymbols = db.getWatchlistSymbols;
