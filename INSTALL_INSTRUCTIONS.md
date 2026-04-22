# Installation Instructions

## ⚠️ Important: Install Dependencies First

Before running the app, you need to install the new dependency for TradingView charts.

## Step 1: Enable PowerShell Scripts (Windows Only)

If you're on Windows and get "scripts is disabled" error, run this in PowerShell as Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Step 2: Install Dependencies

Run ONE of these commands:

### Option A: Using npm
```bash
npm install
```

### Option B: Using Expo CLI
```bash
npx expo install
```

### Option C: Manual Install (if above fails)
```bash
npm install react-native-webview@13.12.2
```

## Step 3: Start the App

```bash
npm start
```

Then press:
- `w` for web
- `a` for Android  
- `i` for iOS

## What's New?

### 📈 TradingView Charts Integration

Now when you tap on any crypto or stock in the Market tab, you'll see:

- **Full TradingView Chart** with professional indicators
- **Multiple timeframes**: 1D, 1W, 1M, 3M, 1Y, ALL
- **Chart types**: Line, Candlestick, Area
- **Built-in indicators**:
  - Moving Average (MA)
  - RSI (Relative Strength Index)
  - MACD (Moving Average Convergence Divergence)
- **24h Statistics**: High, Low, Volume, Change
- **Real-time updates** every 10 seconds

### How to Use

1. Go to **Market** tab
2. Tap on any crypto (BTC, ETH, SOL, etc.) or stock
3. See full TradingView chart with indicators
4. Switch timeframes (1D, 1W, 1M, etc.)
5. Change chart type (Line, Candle, Area)
6. Scroll down to see statistics and indicator info

## Troubleshooting

### "Cannot find module 'react-native-webview'"

This means dependencies aren't installed. Run:
```bash
npm install
```

### "scripts is disabled on this system" (Windows)

Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try `npm install` again.

### Chart not loading

1. Check your internet connection
2. Wait a few seconds for TradingView to load
3. Try switching timeframes
4. Pull to refresh

### App crashes when opening chart

1. Make sure you ran `npm install`
2. Clear cache: `npm start -- --clear`
3. Restart the dev server

## Platform Support

- ✅ **Web**: Full TradingView charts with all features
- ✅ **iOS**: Full TradingView charts via WebView
- ✅ **Android**: Full TradingView charts via WebView

## Features

### Market List Screen
- Real-time crypto prices (BTC, ETH, SOL, BNB, XRP, ADA)
- Stock prices (AAPL, MSFT, NVDA, GOOGL, AMZN, TSLA)
- Mini sparkline charts
- Market statistics (Gainers/Losers/Avg Change)
- Filter by All/Crypto/Stocks
- Auto-refresh every 30 seconds

### Market Detail Screen (NEW!)
- Full TradingView professional chart
- Multiple timeframes (1D to ALL)
- Chart types (Line, Candle, Area)
- Technical indicators (MA, RSI, MACD)
- 24h statistics panel
- Real-time price updates
- High/Low/Volume data

## Next Steps

1. Install dependencies: `npm install`
2. Start the app: `npm start`
3. Go to Market tab
4. Tap on any asset to see TradingView chart
5. Enjoy professional trading charts!

## Need Help?

- Check `TROUBLESHOOTING.md` for common issues
- Check `QUICK_START.md` for basic setup
- Check console logs for error messages
