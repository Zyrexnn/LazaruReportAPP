import { env } from '@/src/config/env';
import { fetchUnifiedNews, fetchMarketSnapshot } from './newsApi';

import { Platform } from 'react-native';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

const callGLM = async (systemPrompt: string, message: string, history: ChatMessage[]) => {
  if (!env.zhipuApiKey) {
    throw new Error('GLM API Key missing');
  }
  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.zhipuApiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4.5',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || response.statusText;
      throw new Error(`GLM API Error (${response.status}): ${errorMsg}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('[AI] GLM Failed:', error.message);
    throw error;
  }
};

const callDeepSeek = async (systemPrompt: string, message: string, history: ChatMessage[]) => {
  if (!env.deepseekApiKey) {
    throw new Error('DeepSeek API Key missing');
  }
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || response.statusText;
      throw new Error(`DeepSeek API Error (${response.status}): ${errorMsg}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('[AI] DeepSeek Failed:', error.message);
    throw error;
  }
};

const callLocalAI = async (systemPrompt: string, message: string, history: ChatMessage[]) => {
  try {
    let baseUrl = env.localAiUrl.endsWith('/') ? env.localAiUrl.slice(0, -1) : env.localAiUrl;
    
    // ANDROID EMULATOR FIX: Map 127.0.0.1 to 10.0.2.2
    if (Platform.OS === 'android' && (baseUrl.includes('127.0.0.1') || baseUrl.includes('localhost'))) {
      baseUrl = baseUrl.replace('127.0.0.1', '10.0.2.2').replace('localhost', '10.0.2.2');
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s for Qwen

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'qwen2.5-vl-3b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Local AI Offline (${response.status})`);
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('[AI] Local AI Failed:', error.message);
    throw error;
  }
};

/**
 * Heuristic Local Fallback
 * Used when all AI services are offline.
 */
const generateHeuristicResponse = (message: string, marketIntel: string, recentNews: string) => {
  const isMarketQuery = /price|market|stock|crypto|btc|eth|top|up|down/i.test(message);
  const isNewsQuery = /news|happen|latest|report/i.test(message);

  let response = "### ⚠️ NEURAL LINK OFFLINE\n\nAll AI processing cores are currently unavailable. I am operating in **Heuristic Emergency Mode**.\n\n";

  if (isMarketQuery) {
    response += `**MARKET INTEL (RAW):**\n${marketIntel}\n\n`;
  }

  if (isNewsQuery || !isMarketQuery) {
    response += `**TOP HEADLINES:**\n${recentNews}\n\n`;
  }

  response += "--- \n*Manual override suggested. Please check your connection or API keys (GLM, Gemini, DeepSeek).*";
  
  return response;
};

export type AIModel = 'local' | 'glm' | 'gemini' | 'deepseek';

export const sendMessageToLazarusWowo = async (
  message: string,
  history: ChatMessage[] = [],
  selectedModel: AIModel = 'local'
): Promise<string> => {
  // ── SEARCH-AUGMENTED INTELLIGENCE (SMART KEYWORD EXTRACTION) ──
  const stopwords = [
    'berita', 'tentang', 'dengan', 'gimana', 'apakah', 'masih', 'atau', 'sudah', 
    'dan', 'di', 'ke', 'dari', 'yang', 'untuk', 'ini', 'itu', 'apa', 'siapa', 
    'kapan', 'bagaimana', 'mengapa', 'kenapa', 'ada', 'terbaru', 'hari', 'saat', 'sekarang'
  ];
  
  const extractedKeywords = message
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter(w => w.length > 2 && !stopwords.includes(w))
    .slice(0, 4)
    .join(' ');

  const searchQuery = extractedKeywords || 'terkini';

  let recentNews = "No news data available.";
  let marketIntel = "No market data available.";

  try {
    // We fetch general news and specifically targeted news
    const [generalNews, targetedNews, market] = await Promise.all([
      fetchUnifiedNews().catch(() => []),
      fetchUnifiedNews(searchQuery).catch(() => []),
      fetchMarketSnapshot().catch(() => []),
    ]);

    const newsMap = new Map();
    [...generalNews, ...targetedNews].forEach(item => newsMap.set(item.title, item));
    const mergedNews = Array.from(newsMap.values()).slice(0, 15);

    recentNews = mergedNews.map(n => `[${n.source}] ${n.title}: ${n.summary.slice(0, 150)}...`).join('\n');
    marketIntel = market.slice(0, 15).map(m => `- ${m.symbol}: $${m.price} (${m.changePercent24h.toFixed(2)}%)`).join('\n');
  } catch (e) {
    console.warn('AI Context fetch failed');
  }

  const systemPrompt = `You are LazarusWowo, an elite Financial & News Analyst.
The current date is strictly ${new Date().toLocaleDateString('id-ID')} 2026. 
You MUST answer entirely in the language the user speaks (e.g., Indonesian). 
Never say your knowledge is cut off in 2023, because you have live access to 2026 data.`;

  const augmentedUserMessage = `
=== 2026 LIVE DATA & NEWS FEED ===
[MARKET INTEL]
${marketIntel}

[LATEST NEWS]
${recentNews}
==================================

INSTRUCTIONS FOR AI:
1. You MUST prioritize the LIVE DATA above to answer the user's question.
2. If the user asks about current events, prices, or news, assume the year is 2026 and use the provided data.
3. If the provided news is highly relevant, summarize it professionally.
4. If the data does not explicitly contain the answer, you can combine it with your general knowledge but DO NOT hallucinate fake news. Tell the user what you found based on the latest context.

USER QUESTION:
${message}
`;

  // Manual Model Selection
  switch (selectedModel) {
    case 'glm':
      return await callGLM(systemPrompt, augmentedUserMessage, history);
    
    case 'gemini':
      try {
        if (!env.geminiApiKey) throw new Error('Gemini API Key missing');

        const contents = [
          ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          })),
          {
            role: 'user',
            parts: [{ text: `CONTEXT_INSTRUCTION: ${systemPrompt}\n\n${augmentedUserMessage}` }]
          }
        ];

        if (contents.length > 0 && contents[0].role === 'model') {
          contents.unshift({ role: 'user', parts: [{ text: "Initialize LazarusWowo protocol." }] });
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(`${GEMINI_API_URL}?key=${env.geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.error?.message || response.statusText;
          throw new Error(`Gemini API Error (${response.status}): ${errorMsg}`);
        }
        
        const data = await response.json();
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error('Gemini returned empty response');
        }
        return data.candidates[0].content.parts[0].text;
      } catch (e: any) {
        throw e;
      }

    case 'deepseek':
      return await callDeepSeek(systemPrompt, augmentedUserMessage, history);

    case 'local':
    default:
      return await callLocalAI(systemPrompt, augmentedUserMessage, history);
  }
};

