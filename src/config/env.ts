import Constants from 'expo-constants';

type ApiKeys = {
  newsDataApiKey?: string;
  worldNewsApiKey?: string;
  finnhubApiKey?: string;
  gnewsApiKey?: string;
  newsApiApiKey?: string;
  marketAuxApiToken?: string;
  cmcApiKey?: string;
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
};

export const hasConfiguredKey = (value: string) =>
  Boolean(value && !value.includes('YOUR_') && !value.includes('<'));
