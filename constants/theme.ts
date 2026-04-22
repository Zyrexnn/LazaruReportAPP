/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#C5A059';
const tintColorDark = '#C5A059';

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#8E8E93',
    tabIconDefault: '#C7C7CC',
    tabIconSelected: tintColorLight,
    card: '#F5F5F7',
    border: '#E5E5EA',
    gold: '#C5A059',
    accent: '#007AFF',
    success: '#34C759',
    error: '#FF3B30',
    muted: '#F2F2F7',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: tintColorDark,
    icon: '#8E8E93',
    tabIconDefault: '#48484A',
    tabIconSelected: tintColorDark,
    card: '#1C1C1E',  
    border: '#38383A',
    gold: '#C5A059',
    accent: '#0A84FF',
    success: '#30D158',
    error: '#FF453A',
    muted: '#1C1C1E',
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
