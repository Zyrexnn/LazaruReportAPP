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
  // ── SEARCH-AUGMENTED INTELLIGENCE ──────────────────────────────
  const queryWords = message.split(' ').filter(w => w.length > 3).slice(0, 5).join(' ');
  const searchQuery = queryWords || message;

  let recentNews = "No news data available.";
  let marketIntel = "No market data available.";

  try {
    const [generalNews, targetedNews, market] = await Promise.all([
      fetchUnifiedNews().catch(() => []),
      fetchUnifiedNews(searchQuery).catch(() => []),
      fetchMarketSnapshot().catch(() => []),
    ]);

    const newsMap = new Map();
    [...generalNews, ...targetedNews].forEach(item => newsMap.set(item.title, item));
    const mergedNews = Array.from(newsMap.values()).slice(0, 12);

    recentNews = mergedNews.map(n => `[${n.source}] ${n.title}: ${n.summary.slice(0, 150)}...`).join('\n');
    marketIntel = market.slice(0, 12).map(m => `- ${m.symbol}: $${m.price} (${m.changePercent24h.toFixed(2)}%)`).join('\n');
  } catch (e) {
    console.warn('AI Context fetch failed');
  }

  const systemPrompt = `
You are LazarusWowo, an elite 2026 Financial & News Analyst.
Current Date: ${new Date().toLocaleDateString('id-ID')} Mei 2026.

MISSION:
- Provide sharp, data-backed analysis on Markets and Global News.
- Use the 2026 DATA provided below for all real-time queries.
- If the user asks in Indonesian, you MUST respond in Indonesian.
- Be helpful and professional.

[2026 LIVE DATA FEED]
MARKET: ${marketIntel}
NEWS: ${recentNews}
`;

  // Manual Model Selection (No Auto-Fallback as requested)
  switch (selectedModel) {
    case 'glm':
      return await callGLM(systemPrompt, message, history);
    
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
            parts: [{ text: `CONTEXT_INSTRUCTION: ${systemPrompt}\n\nUSER_QUERY: ${message}` }]
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
      return await callDeepSeek(systemPrompt, message, history);

    case 'local':
    default:
      return await callLocalAI(systemPrompt, message, history);
  }
};

