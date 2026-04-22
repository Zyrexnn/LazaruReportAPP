# Quick Start Guide

## ✅ App Works Out of the Box!

The app will run immediately with sample data. No API keys required to test it!

## 🚀 Start the App

```bash
npm start
```

Then press:
- `w` for web
- `a` for Android
- `i` for iOS

## 📱 What You'll See

### News Tab
- Sample news articles (mock data)
- Featured story at top
- Category filters
- Bookmark functionality

### Market Tab  
- **REAL crypto prices** from Binance (works without API keys!)
- Live charts
- Market statistics
- Filter by crypto/stocks

### Saved Tab
- Your bookmarked articles
- Works offline

## 🔑 Want Real News? (Optional)

### Step 1: Get a Free API Key

Pick ONE (easiest options):

**Option A: NewsData.io** (Recommended)
1. Go to https://newsdata.io/register
2. Sign up (free)
3. Copy your API key

**Option B: GNews**
1. Go to https://gnews.io/register  
2. Sign up (free)
3. Copy your API key

### Step 2: Add to .env File

Open `.env` file in the project root and replace:

```env
# If you chose NewsData.io:
NEWSDATA_API_KEY=paste_your_key_here

# OR if you chose GNews:
GNEWS_API_KEY=paste_your_key_here
```

### Step 3: Restart

Stop the dev server (Ctrl+C) and run:
```bash
npm start
```

## 🎯 That's It!

You should now see:
- ✅ Real news articles
- ✅ Live crypto prices (always works)
- ✅ Real-time updates
- ✅ Professional UI

## 📊 Console Logs

Watch the console for these messages:

**Good signs:**
```
[NewsAPI] Success with newsdata: 10 items
[MarketAPI] Fetched 6 crypto tickers
```

**Using mock data (no API keys):**
```
[NewsAPI] No real news found, returning mock data
```

**API errors (will fallback to other APIs):**
```
[NewsAPI] Failed with newsdata: Rate limited
[NewsAPI] Trying provider: gnews
```

## 🐛 Troubleshooting

### News shows "No News Available"
1. Check if you added API key correctly to `.env`
2. Make sure you restarted the dev server
3. Check console for error messages
4. Try pull-to-refresh in the app

### Market shows no data
1. Check your internet connection
2. Crypto data should ALWAYS work (uses Binance public API)
3. Try pull-to-refresh

### App won't start
```bash
# Clear cache and restart
npm start -- --clear

# Or reinstall
rm -rf node_modules
npm install
npm start
```

## 💡 Tips

1. **Start without API keys** - Test the app with mock data first
2. **Add one API key** - See real news working
3. **Add more APIs** - Better coverage and fallback
4. **Check console** - Logs show exactly what's happening
5. **Pull to refresh** - Updates data in the app

## 📚 More Info

- Full API setup: See `API_SETUP.md`
- Recent changes: See `UPDATE_NOTES.md`
- Issues: See `TROUBLESHOOTING.md`

## 🎉 Enjoy!

The app is designed to work great even without API keys. Add them when you're ready for real-time data!
