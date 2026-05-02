import Constants from 'expo-constants';

type ApiKeys = {
  newsDataApiKey?: string;
  worldNewsApiKey?: string;
  finnhubApiKey?: string;
  gnewsApiKey?: string;
  newsApiApiKey?: string;
  marketAuxApiToken?: string;
  cmcApiKey?: string;
  geminiApiKey?: string;
  deepseekApiKey?: string;
  zhipuApiKey?: string;
  localAiUrl?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as { apiKeys?: ApiKeys };

export const env = {
  newsDataApiKey: extra.apiKeys?.newsDataApiKey ?? '',
  worldNewsApiKey: extra.apiKeys?.worldNewsApiKey ?? '',
  finnhubApiKey: extra.apiKeys?.finnhubApiKey ?? '',
  gnewsApiKey: extra.apiKeys?.gnewsApiKey ?? '',
  newsApiApiKey: extra.apiKeys?.newsApiApiKey ?? '',
  marketAuxApiToken: extra.apiKeys?.marketAuxApiToken ?? '',
  cmcApiKey: extra.apiKeys?.cmcApiKey ?? '',
  geminiApiKey: extra.apiKeys?.geminiApiKey ?? '',
  deepseekApiKey: extra.apiKeys?.deepseekApiKey ?? '',
  zhipuApiKey: extra.apiKeys?.zhipuApiKey ?? '',
  localAiUrl: extra.apiKeys?.localAiUrl ?? 'http://127.0.0.1:1234/v1',
  supabaseUrl: process.env.VITE_SUPABASE_URL || extra.apiKeys?.supabaseUrl || 'https://qfuzfrhqjlmtdmnpfuub.supabase.co',
  supabaseAnonKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || extra.apiKeys?.supabaseAnonKey || 'sb_publishable_alCpeChSE0nvvfIBxJOiIg_YObJC41y',
};

export const hasConfiguredKey = (value: string) =>
  Boolean(value && !value.includes('YOUR_') && !value.includes('<'));
