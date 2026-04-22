# Changelog

## Design Overhaul - Zen Minimalist Style

### Visual Changes

#### Typography
- Reduced font weights from 800 to 600-700 for cleaner look
- Decreased letter spacing for more natural reading
- Adjusted line heights for better readability
- Removed uppercase text transforms

#### Colors
- Updated color palette to match iOS system colors
- Light mode: Pure white background (#FFFFFF) with subtle gray cards (#F5F5F7)
- Dark mode: True black background (#000000) with dark gray cards (#1C1C1E)
- Accent color changed from gold to iOS blue (#007AFF / #0A84FF)
- Added success/error colors for market indicators

#### Spacing & Layout
- Reduced padding from 20px to 16px for tighter layout
- Decreased border radius from 24-28px to 16px for subtler curves
- Removed decorative elements (lines, badges with borders)
- Simplified card shadows

#### Components

**NewsCard**
- Removed overlay and vignette effects
- Simplified to clean card with image on top
- Reduced image height from 380px to 200px
- Cleaner metadata display
- Removed pill-style source badge

**Market Cards**
- Removed heavy shadows and borders
- Simplified price change display (no background badge)
- Reduced card height and padding
- Cleaner typography

**Tab Bar**
- Changed active color from gold to iOS blue
- Simplified icon colors
- Cleaner inactive state

**News Detail**
- Reduced hero image height
- Simplified overlay controls
- Cleaner article sheet
- Better typography hierarchy

### Functional Improvements

1. **Mock Data**: App now shows mock news data when API keys are not configured
2. **API Documentation**: Added comprehensive API setup guide
3. **Better Error States**: Cleaner empty state messages
4. **Consistent Design**: All screens follow the same minimalist design language

### Files Changed

- `constants/theme.ts` - Updated color palette
- `app/(tabs)/index.tsx` - Simplified home screen design
- `app/(tabs)/market.tsx` - Cleaner market overview
- `app/(tabs)/bookmarks.tsx` - Updated bookmarks screen
- `app/(tabs)/_layout.tsx` - Simplified tab bar
- `app/news/[id].tsx` - Cleaner article detail
- `src/components/NewsCard.tsx` - Simplified card design
- `README.md` - Updated documentation
- `API_SETUP.md` - New API setup guide

### Design Principles Applied

1. **Simplicity**: Removed unnecessary decorative elements
2. **Clarity**: Improved typography hierarchy and readability
3. **Consistency**: Unified design language across all screens
4. **Whitespace**: Better use of negative space
5. **Focus**: Content-first approach
6. **Subtlety**: Reduced visual noise and distractions
