export type NewsProvider =
  | 'newsdata'
  | 'worldnews'
  | 'gnews'
  | 'newsapi'
  | 'marketaux'
  | 'binance'
  | 'finnhub';

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  summary: string;
  imageUrl?: string;
  contentUrl: string;
  publishedAt: string;
  provider: NewsProvider;
  content?: string;
  category?: string;
  author?: string;
  sentiment?: number | null;
  symbols?: string[];
}

export interface BookmarkRecord {
  id: string;
  title: string;
  source: string;
  imageUrl?: string;
  contentUrl: string;
  publishedAt: string;
  summary: string;
}

export interface MarketTicker {
  id: string;
  symbol: string;
  name: string;
  price: number;
  changePercent24h: number;
  sparkline: { timestamp: number; value: number }[];
  sentimentLabel?: string;
  type: 'crypto' | 'stock';
  volume24h?: number;
  high24h?: number;
  low24h?: number;
}
