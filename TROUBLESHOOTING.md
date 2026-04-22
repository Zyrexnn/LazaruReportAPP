# Troubleshooting Guide

## Common Issues

### News Not Showing

**Problem**: App shows "No News Available" or only mock data

**Solutions**:
1. Check if you have configured API keys in `.env` file
2. Make sure you restarted the dev server after adding API keys
3. Verify API keys are valid by testing them directly
4. Check if you've hit API rate limits (most free tiers have daily limits)

**Note**: The app will show mock data if no API keys are configured. This is normal behavior.

### Market Charts Not Displaying

**Problem**: Market data shows but charts are blank

**Solutions**:
1. Check console for errors
2. Verify Binance API is accessible (crypto data)
3. For stock data, ensure Finnhub API key is configured
4. Try refreshing the market screen (pull down)

### App Crashes on Startup

**Problem**: App crashes immediately after launch

**Solutions**:
1. Clear cache: `npm start -- --clear`
2. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```
3. Clear Expo cache:
   ```bash
   npx expo start -c
   ```

### Bookmarks Not Saving

**Problem**: Bookmarks disappear after app restart

**Solutions**:
1. Check if SQLite is properly initialized
2. On web, check browser storage permissions
3. Try clearing app data and re-bookmarking

### Styling Issues

**Problem**: Colors or fonts look wrong

**Solutions**:
1. Check if device is in dark/light mode
2. Force restart the app
3. Clear cache and restart

### API Rate Limits

**Problem**: "Rate limited" errors in console

**Solutions**:
1. Wait for rate limit to reset (usually 24 hours for free tiers)
2. Add more API providers to `.env` for automatic fallback
3. Consider upgrading to paid API tiers if needed

## Platform-Specific Issues

### iOS
- If fonts look wrong, try restarting the simulator
- For permission issues, reset simulator: Device > Erase All Content and Settings

### Android
- If app won't start, try: `npx expo run:android --clear`
- For network issues, check Android emulator network settings

### Web
- Clear browser cache if styles are broken
- Check browser console for CORS errors
- Some features (like SQLite) work differently on web

## Getting Help

If you're still having issues:

1. Check the [Expo documentation](https://docs.expo.dev/)
2. Look for similar issues in the project's issue tracker
3. Check API provider status pages
4. Verify your development environment meets requirements:
   - Node.js 18+
   - npm or yarn
   - Expo CLI

## Debug Mode

To see more detailed logs:

```bash
# Enable debug mode
EXPO_DEBUG=true npm start

# Or with specific log level
EXPO_LOG_LEVEL=debug npm start
```

## Useful Commands

```bash
# Clear all caches
npx expo start -c

# Reset project (careful: removes node_modules)
npm run reset-project

# Check for outdated packages
npm outdated

# Update Expo SDK
npx expo install --fix
```
