import 'dotenv/config';
import type { ConfigContext, ExpoConfig } from 'expo/config';
const appJson = require('./app.json');

const baseConfig = appJson.expo as ExpoConfig;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...baseConfig,
  ...config,
  extra: {
    ...(baseConfig.extra ?? {}),
    apiKeys: {
      newsDataApiKey: process.env.NEWSDATA_API_KEY,
      worldNewsApiKey: process.env.WORLDNEWS_API_KEY,
      finnhubApiKey: process.env.FINNHUB_API_KEY,
      gnewsApiKey: process.env.GNEWS_API_KEY,
      newsApiApiKey: process.env.NEWSAPI_API_KEY,
      marketAuxApiToken: process.env.MARKETAUX_API_TOKEN,
      cmcApiKey: process.env.CMC_API_KEY,
      geminiApiKey: process.env.GEMINI_API_KEY,
      deepseekApiKey: process.env.DEEPSEEK_API_KEY,
      zhipuApiKey: process.env.ZHIPU_API_KEY,
      localAiUrl: process.env.LOCAL_AI_URL || 'http://127.0.0.1:1234/v1',
    },
  },
});
