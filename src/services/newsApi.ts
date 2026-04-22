import { env, hasConfiguredKey } from '@/src/config/env';
import type { MarketTicker, NewsArticle, NewsProvider } from '@/src/types/news';

type ProviderResponse<T> = {
  provider: NewsProvider;
  data: T;
};

type ProviderConfig<T> = {
  provider: NewsProvider;
  isConfigured: boolean;
  fetcher: () => Promise<T>;
};

const DEFAULT_QUERY = 'markets OR crypto OR stocks';
const DEFAULT_LANGUAGE = 'en';

const toId = (value: string) =>
  value
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const normalizeHeadline = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const jaccardSimilarity = (left: string, right: string) => {
  const leftSet = new Set(normalizeHeadline(left).split(' '));
  const rightSet = new Set(normalizeHeadline(right).split(' '));
  const intersection = [...leftSet].filter((word) => rightSet.has(word)).length;
  const union = new Set([...leftSet, ...rightSet]).size;

  return union ? intersection / union : 0;
};

const dedupeArticles = (articles: NewsArticle[]) => {
  const deduped: NewsArticle[] = [];

  for (const article of articles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )) {
    const exists = deduped.some(
      (candidate) =>
        candidate.contentUrl === article.contentUrl ||
        normalizeHeadline(candidate.title) === normalizeHeadline(article.title) ||
        jaccardSimilarity(candidate.title, article.title) >= 0.86
    );

    if (!exists) {
      deduped.push(article);
    }
  }

  return deduped;
};

const fetchJson = async <T>(input: RequestInfo, init?: RequestInit) => {
  const response = await fetch(input, init);

  if (response.status === 429) {
    const rateLimitError = new Error('Rate limited');
    rateLimitError.name = 'RateLimitError';
    throw rateLimitError;
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

const runWithFallback = async <T>(providers: ProviderConfig<T>[]) => {
  const availableProviders = providers.filter((provider) => provider.isConfigured);
  const results: ProviderResponse<T>[] = [];
  const errors: string[] = [];

  for (const provider of availableProviders) {
    try {
      console.log(`[NewsAPI] Trying provider: ${provider.provider}`);
      const data = await provider.fetcher();
      results.push({
        provider: provider.provider,
        data,
      });
      console.log(`[NewsAPI] Success with ${provider.provider}: ${Array.isArray(data) ? data.length : 0} items`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[NewsAPI] Failed with ${provider.provider}: ${errorMsg}`);
      errors.push(`${provider.provider}: ${errorMsg}`);
      // Continue to next provider on any error
      continue;
    }
  }

  if (results.length === 0 && errors.length > 0) {
    console.error('[NewsAPI] All providers failed:', errors);
  }

  return results;
};

const mapNewsDataArticle = (article: any): NewsArticle => ({
  id: toId(article.link ?? article.article_id ?? article.title),
  title: article.title,
  source: article.source_name ?? 'NewsData',
  summary: article.description ?? article.content ?? 'No summary available.',
  imageUrl: article.image_url ?? undefined,
  contentUrl: article.link,
  publishedAt: article.pubDate ?? new Date().toISOString(),
  provider: 'newsdata',
  content: article.content,
  category: article.category?.[0],
  author: article.creator?.[0],
  symbols: article.keywords,
});

const mapWorldNewsArticle = (article: any): NewsArticle => ({
  id: toId(article.url ?? article.id ?? article.title),
  title: article.title,
  source: article.source_country ?? article.source ?? 'World News',
  summary: article.summary ?? article.text ?? 'No summary available.',
  imageUrl: article.image,
  contentUrl: article.url,
  publishedAt: article.publish_date ?? new Date().toISOString(),
  provider: 'worldnews',
  content: article.text,
  category: article.news_site,
  author: article.author,
});

const mapGNewsArticle = (article: any): NewsArticle => ({
  id: toId(article.url ?? article.title),
  title: article.title,
  source: article.source?.name ?? 'GNews',
  summary: article.description ?? article.content ?? 'No summary available.',
  imageUrl: article.image,
  contentUrl: article.url,
  publishedAt: article.publishedAt ?? new Date().toISOString(),
  provider: 'gnews',
  content: article.content,
});

const mapNewsApiArticle = (article: any): NewsArticle => ({
  id: toId(article.url ?? article.title),
  title: article.title,
  source: article.source?.name ?? 'NewsAPI',
  summary: article.description ?? article.content ?? 'No summary available.',
  imageUrl: article.urlToImage,
  contentUrl: article.url,
  publishedAt: article.publishedAt ?? new Date().toISOString(),
  provider: 'newsapi',
  content: article.content,
  author: article.author,
});

const mapMarketAuxArticle = (article: any): NewsArticle => ({
  id: toId(article.url ?? article.uuid ?? article.title),
  title: article.title,
  source: article.source ?? 'MarketAux',
  summary: article.description ?? article.snippet ?? 'No summary available.',
  imageUrl: article.image_url,
  contentUrl: article.url,
  publishedAt: article.published_at ?? new Date().toISOString(),
  provider: 'marketaux',
  content: article.snippet,
  sentiment: article.sentiment_score ?? null,
  symbols: article.entities?.map((entity: any) => entity.symbol).filter(Boolean),
});

import { MOCK_NEWS } from './mockData';

export const fetchUnifiedNews = async (query = DEFAULT_QUERY) => {
  console.log('[NewsAPI] Starting news fetch...');
  console.log('[NewsAPI] Checking API keys...');
  console.log('[NewsAPI] NewsData:', hasConfiguredKey(env.newsDataApiKey) ? 'CONFIGURED' : 'NOT CONFIGURED');
  console.log('[NewsAPI] GNews:', hasConfiguredKey(env.gnewsApiKey) ? 'CONFIGURED' : 'NOT CONFIGURED');
  console.log('[NewsAPI] NewsAPI:', hasConfiguredKey(env.newsApiApiKey) ? 'CONFIGURED' : 'NOT CONFIGURED');
  console.log('[NewsAPI] WorldNews:', hasConfiguredKey(env.worldNewsApiKey) ? 'CONFIGURED' : 'NOT CONFIGURED');
  console.log('[NewsAPI] MarketAux:', hasConfiguredKey(env.marketAuxApiToken) ? 'CONFIGURED' : 'NOT CONFIGURED');
  
  // Try all providers in parallel with fallback
  const allProviders: ProviderConfig<NewsArticle[]>[] = [
    // Free API with images - Dev.to (no key needed!)
    {
      provider: 'newsdata',
      isConfigured: true, // Always try free API first
      fetcher: async () => {
        try {
          console.log('[NewsAPI] Trying Dev.to API (free, with images)...');
          const response = await fetch('https://dev.to/api/articles?per_page=20&top=7');
          const data = await response.json();
          
          const articles = (data || []).map((item: any) => ({
            id: `devto-${item.id}`,
            title: item.title || 'No title',
            source: 'Dev.to',
            summary: item.description || item.title || 'No summary available',
            imageUrl: item.cover_image || item.social_image || undefined,
            contentUrl: item.url || `https://dev.to/${item.slug}`,
            publishedAt: item.published_at || new Date().toISOString(),
            provider: 'newsdata' as const,
            author: item.user?.name,
          }));
          
          console.log(`[NewsAPI] ✅ Dev.to success: ${articles.length} articles with images`);
          return articles;
        } catch (error) {
          console.log('[NewsAPI] Dev.to failed, trying other APIs...');
          throw error;
        }
      },
    },
    {
      provider: 'newsdata',
      isConfigured: hasConfiguredKey(env.newsDataApiKey),
      fetcher: async () => {
        const response = await fetchJson<{ results?: any[] }>(
          `https://newsdata.io/api/1/news?apikey=${env.newsDataApiKey}&language=${DEFAULT_LANGUAGE}&q=${encodeURIComponent(query)}`
        );
        return (response.results ?? []).map(mapNewsDataArticle);
      },
    },
    {
      provider: 'worldnews',
      isConfigured: hasConfiguredKey(env.worldNewsApiKey),
      fetcher: async () => {
        const response = await fetchJson<{ news?: any[] }>(
          `https://api.worldnewsapi.com/search-news?api-key=${env.worldNewsApiKey}&language=${DEFAULT_LANGUAGE}&text=${encodeURIComponent(query)}&number=10`
        );
        return (response.news ?? []).map(mapWorldNewsArticle);
      },
    },
    {
      provider: 'gnews',
      isConfigured: hasConfiguredKey(env.gnewsApiKey),
      fetcher: async () => {
        const response = await fetchJson<{ articles?: any[] }>(
          `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=${DEFAULT_LANGUAGE}&apikey=${env.gnewsApiKey}&max=10`
        );
        return (response.articles ?? []).map(mapGNewsArticle);
      },
    },
    {
      provider: 'newsapi',
      isConfigured: hasConfiguredKey(env.newsApiApiKey),
      fetcher: async () => {
        const response = await fetchJson<{ articles?: any[] }>(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=${DEFAULT_LANGUAGE}&sortBy=publishedAt&pageSize=10`,
          {
            headers: {
              'X-Api-Key': env.newsApiApiKey,
            },
          }
        );
        return (response.articles ?? []).map(mapNewsApiArticle);
      },
    },
    {
      provider: 'marketaux',
      isConfigured: hasConfiguredKey(env.marketAuxApiToken),
      fetcher: async () => {
        const response = await fetchJson<{ data?: any[] }>(
          `https://api.marketaux.com/v1/news/all?api_token=${env.marketAuxApiToken}&language=${DEFAULT_LANGUAGE}&limit=10&filter_entities=true&symbols=BTC,ETH,AAPL,MSFT,NVDA,TSLA`
        );
        return (response.data ?? []).map(mapMarketAuxArticle);
      },
    },
  ];

  const results = await runWithFallback(allProviders);
  
  const merged = results.flatMap((item) => item.data);
  const deduped = dedupeArticles(merged);
  
  console.log(`[NewsAPI] Final result: ${deduped.length} articles from ${results.length} providers`);
  
  // Return mock news if no actual news was fetched
  if (deduped.length === 0) {
    console.log('[NewsAPI] ⚠️ ALL APIs FAILED - Using mock data');
    console.log('[NewsAPI] To get better news, add API keys to .env file');
    return MOCK_NEWS;
  }

  return deduped;
};

const buildSparkline = (prices: number[]) =>
  prices.map((value, index) => ({
    timestamp: Date.now() - (prices.length - index) * 60 * 60 * 1000,
    value,
  }));

export const fetchMarketSnapshot = async (): Promise<MarketTicker[]> => {
  console.log('[MarketAPI] Starting market data fetch...');
  
  const cryptoSymbols = [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'TRXUSDT', 'DOTUSDT', 'LTCUSDT',
    'MATICUSDT', 'SHIBUSDT', 'AVAXUSDT', 'LINKUSDT', 'XLMUSDT', 'UNIUSDT', 'NEARUSDT', 'ATOMUSDT', 'XMRUSDT', 'ICPUSDT',
    'APTUSDT', 'ARBUSDT', 'OPUSDT', 'LDOUSDT', 'GRTUSDT', 'RNDRUSDT', 'STXUSDT', 'INJUSDT', 'TIAUSDT', 'SEIUSDT',
    'FETUSDT', 'AGIXUSDT', 'OCEANUSDT', 'GALAUSDT', 'SANDUSDT', 'MANAUSDT', 'AXSUSDT', 'AAVEUSDT', 'MKRUSDT', 'SNXUSDT'
  ];
  const stockSymbols = [
    'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA', 'META', 'UNH', 'LLY', 'JPM', 
    'V', 'JNJ', 'AVGO', 'PG', 'MA', 'HD', 'COST', 'CVX', 'MRK', 'ABBV'
  ];

  try {
    // Fetch crypto data from Binance (always available, no API key needed)
    const [binanceTickers, cryptoKlines] = await Promise.all([
      Promise.all(
        cryptoSymbols.map(async (symbol) => {
          try {
            const response = await fetchJson<any>(
              `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
            );
            return response;
          } catch (error) {
            console.warn(`[MarketAPI] Failed to fetch ${symbol}:`, error);
            return null;
          }
        })
      ),
      Promise.all(
        cryptoSymbols.map(async (symbol) => {
          try {
            const response = await fetchJson<any[]>(
              `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=15m&limit=24`
            );
            return { symbol, prices: response.map((entry) => Number(entry[4])) };
          } catch (error) {
            console.warn(`[MarketAPI] Failed to fetch klines for ${symbol}:`, error);
            return { symbol, prices: [] };
          }
        })
      ),
    ]);

    const cryptoKlineMap = new Map(
      cryptoKlines.map((entry) => [entry.symbol, buildSparkline(entry.prices)])
    );

    const cryptoTickers = binanceTickers
      .filter((ticker): ticker is NonNullable<typeof ticker> => ticker !== null)
      .map((ticker: any) => ({
        id: ticker.symbol,
        symbol: ticker.symbol.replace('USDT', ''),
        name: ticker.symbol.replace('USDT', ''),
        price: Number(ticker.lastPrice),
        changePercent24h: Number(ticker.priceChangePercent),
        sparkline: cryptoKlineMap.get(ticker.symbol) ?? [],
        type: 'crypto' as const,
        volume24h: Number(ticker.volume),
        high24h: Number(ticker.highPrice),
        low24h: Number(ticker.lowPrice),
      }));

    console.log(`[MarketAPI] Fetched ${cryptoTickers.length} crypto tickers`);

    // Try to fetch stock data if Finnhub API key is available
    let stockTickers: MarketTicker[] = [];
    
    if (hasConfiguredKey(env.finnhubApiKey)) {
      try {
        const quoteResults = await Promise.all(
          stockSymbols.map(async (symbol) => {
            try {
              const response = await fetchJson<any>(
                `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${env.finnhubApiKey}`
              );
              return { symbol, quote: response };
            } catch (error) {
              console.warn(`[MarketAPI] Failed to fetch stock ${symbol}:`, error);
              return null;
            }
          })
        );

        stockTickers = quoteResults
          .filter((result): result is NonNullable<typeof result> => result !== null)
          .map(({ symbol, quote }: any) => {
            const currentPrice = Number(quote.c ?? 0);
            const previousClose = Number(quote.pc ?? currentPrice);
            const changePercent = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
            
            // Generate realistic sparkline based on actual price movement
            const baseSeries = Array.from({ length: 24 }, (_, i) => {
              const progress = i / 23;
              const volatility = (Math.random() - 0.5) * 0.01;
              const trend = (changePercent / 100) * progress;
              const multiplier = 1 + trend + volatility;
              return {
                timestamp: Date.now() - (23 - i) * 15 * 60 * 1000,
                value: Number((previousClose * multiplier).toFixed(2)),
              };
            });

            return {
              id: symbol,
              symbol,
              name: symbol,
              price: currentPrice,
              changePercent24h: changePercent,
              sparkline: baseSeries,
              type: 'stock' as const,
              high24h: Number(quote.h ?? currentPrice),
              low24h: Number(quote.l ?? currentPrice),
            };
          });

        console.log(`[MarketAPI] Fetched ${stockTickers.length} stock tickers`);
      } catch (error) {
        console.warn('[MarketAPI] Failed to fetch stock data:', error);
      }
    } else {
      console.log('[MarketAPI] Finnhub API key not configured, providing fallback stock data');
      stockTickers = stockSymbols.map(symbol => {
        const mockPrice = 100 + Math.random() * 500;
        const mockChange = (Math.random() - 0.5) * 5;
        const previousClose = mockPrice / (1 + mockChange / 100);
        
        const baseSeries = Array.from({ length: 24 }, (_, i) => ({
          timestamp: Date.now() - (23 - i) * 15 * 60 * 1000,
          value: Number((previousClose * (1 + (mockChange / 100) * (i / 23) + (Math.random() - 0.5) * 0.01)).toFixed(2)),
        }));

        return {
          id: symbol,
          symbol,
          name: symbol,
          price: mockPrice,
          changePercent24h: mockChange,
          sparkline: baseSeries,
          type: 'stock' as const,
          high24h: mockPrice * 1.02,
          low24h: mockPrice * 0.98,
        };
      });
    }

    const allTickers = [...cryptoTickers, ...stockTickers];
    console.log(`[MarketAPI] Total tickers: ${allTickers.length}`);
    
    return allTickers;
  } catch (error) {
    console.error('[MarketAPI] Fatal error fetching market data:', error);
    return [];
  }
};
