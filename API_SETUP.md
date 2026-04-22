# API Setup Guide

This app uses multiple news and market data APIs. You can use the app without API keys (it will show mock data), but for real-time news and market data, you need to configure API keys.

## Quick Start (No API Keys Required)

The app works out of the box with mock data. Just run:

```bash
npm start
```

## Getting Real Data (Optional)

To get real news and market data, you need to sign up for free API keys from these providers:

### News APIs (Choose at least one)

1. **NewsData.io** (Recommended - Free tier: 200 requests/day)
   - Sign up: https://newsdata.io/register
   - Get your API key from dashboard
   - Add to `.env`: `NEWSDATA_API_KEY=your_key_here`

2. **GNews** (Free tier: 100 requests/day)
   - Sign up: https://gnews.io/register
   - Get your API key
   - Add to `.env`: `GNEWS_API_KEY=your_key_here`

3. **NewsAPI.org** (Free tier: 100 requests/day)
   - Sign up: https://newsapi.org/register
   - Get your API key
   - Add to `.env`: `NEWSAPI_API_KEY=your_key_here`

### Market Data APIs (Optional)

1. **Finnhub** (Free tier: 60 calls/minute)
   - Sign up: https://finnhub.io/register
   - Get your API key
   - Add to `.env`: `FINNHUB_API_KEY=your_key_here`

2. **MarketAux** (Free tier: 100 requests/day)
   - Sign up: https://www.marketaux.com/account/signup
   - Get your API token
   - Add to `.env`: `MARKETAUX_API_TOKEN=your_key_here`

## Setup Steps

1. Copy `.env` file (already exists in project)
2. Replace `YOUR_*_API_KEY` with your actual API keys
3. Restart the development server:
   ```bash
   npm start
   ```

## Notes

- The app uses multiple providers with automatic fallback
- If one API fails or hits rate limit, it tries the next one
- Crypto market data works without API keys (uses Binance public API)
- Stock market data requires Finnhub API key
- You don't need ALL API keys - just add the ones you want to use
