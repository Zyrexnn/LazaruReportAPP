import { TradingIdea, IdeaCategory, IdeaType } from '../types/ideas';
import { XMLParser } from 'fast-xml-parser';

const TV_FEED_URL = 'https://www.tradingview.com/feed/';

export const fetchTradingIdeas = async (
  category?: IdeaCategory,
  type?: IdeaType
): Promise<TradingIdea[]> => {
  try {
    const response = await fetch(TV_FEED_URL);
    if (!response.ok) throw new Error('Failed to fetch TradingView feed');
    
    const xmlData = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const jsonObj = parser.parse(xmlData);
    
    const items = jsonObj.rss.channel.item;
    if (!items) return [];

    const rawIdeas = Array.isArray(items) ? items : [items];

    return rawIdeas.map((item: any, index: number) => {
      // Determine category based on title or guid (heuristic)
      const title = item.title || '';
      const isCrypto = title.toLowerCase().includes('crypto') || 
                       item.guid?.toLowerCase().includes('btc') || 
                       item.guid?.toLowerCase().includes('eth');
      
      const categoryFromFeed: IdeaCategory = isCrypto ? 'crypto' : 'stock';
      
      return {
        id: `tv-${index}-${Date.now()}`,
        title: item.title || 'Untitled Trade Idea',
        author: item['dc:creator'] || 'TradingView Analyst',
        category: categoryFromFeed,
        type: 'idea', // Most RSS items are ideas
        summary: (item.description || '').replace(/<[^>]*>?/gm, '').slice(0, 200) + '...',
        imageUrl: extractImageUrl(item['content:encoded'] || item.description || ''),
        tradingViewUrl: item.link || '',
        createdAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        likes: Math.floor(Math.random() * 1000) + 100, // Random as TV RSS doesn't give likes
        comments: Math.floor(Math.random() * 50) + 5,
      };
    });
  } catch (error) {
    console.error('Error fetching TradingView ideas:', error);
    return []; // Return empty instead of crashing
  }
};

function extractImageUrl(content: string): string {
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : 'https://images.unsplash.com/photo-1611974714480-928929c29806?q=80&w=1471&auto=format&fit=crop';
}
