# Lazarus Report App

A minimalist news and market analysis app built with Expo and React Native. Features a clean, zen-inspired design similar to iOS apps.

## Features

- 📰 Real-time news aggregation from multiple sources
- 📈 Live market data for crypto and stocks with charts
- 🔖 Offline bookmarks
- 🌓 Dark/Light mode
- 📱 Cross-platform (iOS, Android, Web)
- ⚡ Fast and responsive

## Quick Start

```bash
# Install dependencies
npm install

# Start the app
npm start

# Or run on specific platform
npm run ios
npm run android
npm run web
```

The app works immediately with mock data. For real-time data, see [API_SETUP.md](./API_SETUP.md).

## Tech Stack

- Expo 54
- React Native
- TypeScript
- Zustand (state management)
- TanStack Query (data fetching)
- Expo Router (navigation)
- SQLite (offline storage)

## Design Philosophy

Clean, minimalist design inspired by iOS and Japanese zen aesthetics:
- Simple typography with SF Pro system fonts
- Generous whitespace
- Subtle animations
- Focus on content
- Intuitive navigation

## Project Structure

```
app/              # Expo Router pages
  (tabs)/         # Tab navigation screens
  news/           # News detail screen
src/
  components/     # Reusable components
  services/       # API and database services
  store/          # Zustand stores
  types/          # TypeScript types
constants/        # Theme and constants
```

## License

MIT
