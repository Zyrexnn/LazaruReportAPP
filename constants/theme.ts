/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#E60000'; // Red
const tintColorDark = '#FFD700'; // Gold for Obsidian Dossier feel

export const Colors = {
  light: {
    text: '#000000',
    background: '#F9F9FB', // Soft white/grey background
    surface: '#FFFFFF',
    tint: tintColorLight,
    icon: '#8E8E93',
    tabIconDefault: '#999999',
    tabIconSelected: tintColorLight,
    tabBackground: '#FFFFFF',
    card: '#FFFFFF',
    border: '#EAEAEC',
    accent: '#E60000',
    primary: '#000000',
    secondary: '#8E8E93',
    success: '#00C853',
    error: '#FF3B30',
    muted: '#F2F2F7',
    chartLine: '#000000',
    chartBackground: '#F9F9FB',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000', // Pure Black
    surface: '#1A1A1A', // Dark Grey Card
    tint: tintColorDark,
    icon: '#A1A1AA',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#FFFFFF', 
    tabBackground: '#000000',
    card: '#111111',
    border: '#222222',
    accent: '#FFD700', 
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    success: '#22C55E', 
    error: '#EF4444', 
    muted: '#222222',
    chartLine: '#FFFFFF',
    chartBackground: '#000000',
  },
};
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
