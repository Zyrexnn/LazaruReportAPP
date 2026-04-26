import { env } from '@/src/config/env';
import { fetchUnifiedNews, fetchMarketSnapshot } from './newsApi';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

const callDeepSeek = async (systemPrompt: string, message: string, history: ChatMessage[]) => {
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

    if (!response.ok) throw new Error('DeepSeek API Error');
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek Fallback Failed:', error);
    throw error;
  }
};

export const sendMessageToLazarusWowo = async (
  message: string,
  history: ChatMessage[] = []
): Promise<string> => {
  // 1. Gather Context (News & Market) - RESILIENT VERSION
  let recentNews = "No news data available.";
  let marketIntel = "No market data available.";

  try {
    const [news, market] = await Promise.all([
      fetchUnifiedNews().catch(() => []),
      fetchMarketSnapshot().catch(() => []),
    ]);
    recentNews = news.slice(0, 5).map(n => `- ${n.title}`).join('\n');
    marketIntel = market.slice(0, 8).map(m => `- ${m.symbol}: $${m.price} (${m.changePercent24h.toFixed(2)}%)`).join('\n');
  } catch (e) {
    console.warn('AI Context fetch failed');
  }

  const systemPrompt = `
You are LazarusWowo, a Neo-Brutalist Financial AI Agent.
CURRENT INTEL:
${marketIntel}
TOP NEWS:
${recentNews}
DIRECTIVE: Be bold, professional, and structured. Use Markdown.
  `;

  // TRY GEMINI FIRST
  try {
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

    const response = await fetch(`${GEMINI_API_URL}?key=${env.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
      }),
    });

    if (!response.ok) throw new Error('Gemini Failed');
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (geminiError) {
    console.warn('Gemini failed, falling back to DeepSeek:', geminiError);
    
    // FALLBACK TO DEEPSEEK
    try {
      return await callDeepSeek(systemPrompt, message, history);
    } catch (deepseekError) {
      console.error('All AI services failed');
      return "SYSTEM ERROR: ALL NEURAL CORES OFFLINE. CHECK API KEYS OR CONNECTION.";
    }
  }
};
