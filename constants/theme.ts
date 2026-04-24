/**
 * Lazarus Report — Bento Grid Design System
 * 4 themes: Snow (default white), Obsidian (dark), Ocean (midnight blue), Forest (green)
 * Brutalist accents: bold borders, raw typography, chunky controls
 */

import { Platform } from 'react-native';

// ─── Theme Names ─────────────────────────────────────────────
export type ThemeName = 'snow' | 'obsidian' | 'ocean' | 'forest';

export const THEME_LABELS: Record<ThemeName, string> = {
  snow: 'Snow',
  obsidian: 'Obsidian',
  ocean: 'Ocean',
  forest: 'Forest',
};

export const THEME_PREVIEW_COLORS: Record<ThemeName, { bg: string; accent: string; text: string }> = {
  snow: { bg: '#FFFFFF', accent: '#FF2D55', text: '#1A1A1A' },
  obsidian: { bg: '#0A0A0A', accent: '#FFD700', text: '#FFFFFF' },
  ocean: { bg: '#0B1929', accent: '#38BDF8', text: '#E2E8F0' },
  forest: { bg: '#0C1F0F', accent: '#4ADE80', text: '#ECFDF5' },
};

// ─── Color Palettes ──────────────────────────────────────────
export type ThemeColors = {
  // Core
  text: string;
  textSecondary: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  
  // Brand
  accent: string;
  accentSoft: string;
  primary: string;
  
  // Borders (brutalist)
  border: string;
  borderStrong: string;
  
  // Status
  success: string;
  error: string;
  warning: string;
  
  // UI
  icon: string;
  iconActive: string;
  muted: string;
  overlay: string;
  skeleton: string;
  
  // Tab Bar
  tabBg: string;
  tabBorder: string;
  tabActive: string;
  tabInactive: string;
  
  // Cards (bento)
  cardBg: string;
  cardBorder: string;
  
  // Chart
  chartLine: string;
  chartBg: string;
  
  // Special
  badge: string;
  badgeText: string;
};

export const Colors: Record<ThemeName, ThemeColors> = {
  // ── Snow (Neo-Brutalist Light) ──────────────────────────────
  snow: {
    text: '#000000',
    textSecondary: '#333333',
    background: '#F0F0F0',
    surface: '#FFFFFF',
    surfaceElevated: '#FFE600', // Yellow accent surface
    
    accent: '#FF3366', // Bright Pink
    accentSoft: 'rgba(255, 51, 102, 0.1)',
    primary: '#000000',
    
    border: '#000000',
    borderStrong: '#000000',
    
    success: '#00FF66',
    error: '#FF0033',
    warning: '#FFCC00',
    
    icon: '#000000',
    iconActive: '#FF3366',
    muted: '#E0E0E0',
    overlay: 'rgba(0, 0, 0, 0.4)',
    skeleton: '#D0D0D0',
    
    tabBg: '#FFFFFF',
    tabBorder: '#000000',
    tabActive: '#FF3366',
    tabInactive: '#000000',
    
    cardBg: '#FFFFFF',
    cardBorder: '#000000',
    
    chartLine: '#000000',
    chartBg: '#FFFFFF',
    
    badge: '#000000',
    badgeText: '#FFFFFF',
  },
  
  // ── Obsidian (Neo-Brutalist Dark) ──────────────────────────
  obsidian: {
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    background: '#000000',
    surface: '#1A1A1A',
    surfaceElevated: '#2A2A2A',
    
    accent: '#FFD700', // Cyber Yellow
    accentSoft: 'rgba(255, 215, 0, 0.1)',
    primary: '#FFFFFF',
    
    border: '#FFFFFF',
    borderStrong: '#FFFFFF',
    
    success: '#00FF66',
    error: '#FF0033',
    warning: '#FFCC00',
    
    icon: '#FFFFFF',
    iconActive: '#FFD700',
    muted: '#2A2A2A',
    overlay: 'rgba(0, 0, 0, 0.8)',
    skeleton: '#333333',
    
    tabBg: '#000000',
    tabBorder: '#FFFFFF',
    tabActive: '#FFD700',
    tabInactive: '#FFFFFF',
    
    cardBg: '#1A1A1A',
    cardBorder: '#FFFFFF',
    
    chartLine: '#FFFFFF',
    chartBg: '#000000',
    
    badge: '#FFD700',
    badgeText: '#000000',
  },
  
  // ── Ocean (Midnight Neo) ───────────────────────────────────
  ocean: {
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    background: '#0B1929',
    surface: '#0F2237',
    surfaceElevated: '#38BDF8',
    
    accent: '#38BDF8',
    accentSoft: 'rgba(56, 189, 248, 0.1)',
    primary: '#FFFFFF',
    
    border: '#FFFFFF',
    borderStrong: '#38BDF8',
    
    success: '#00FFCC',
    error: '#FF3366',
    warning: '#FCD34D',
    
    icon: '#FFFFFF',
    iconActive: '#38BDF8',
    muted: '#132D46',
    overlay: 'rgba(11, 25, 41, 0.8)',
    skeleton: '#1E3A5F',
    
    tabBg: '#0B1929',
    tabBorder: '#FFFFFF',
    tabActive: '#38BDF8',
    tabInactive: '#FFFFFF',
    
    cardBg: '#0F2237',
    cardBorder: '#FFFFFF',
    
    chartLine: '#38BDF8',
    chartBg: '#0B1929',
    
    badge: '#38BDF8',
    badgeText: '#0B1929',
  },
  
  // ── Forest (Emerald Brutalist) ──────────────────────────────
  forest: {
    text: '#ECFDF5',
    textSecondary: '#A7F3D0',
    background: '#064E3B',
    surface: '#065F46',
    surfaceElevated: '#34D399',
    
    accent: '#34D399',
    accentSoft: 'rgba(52, 211, 153, 0.1)',
    primary: '#ECFDF5',
    
    border: '#ECFDF5',
    borderStrong: '#34D399',
    
    success: '#00FF66',
    error: '#FF4D4D',
    warning: '#FBBF24',
    
    icon: '#ECFDF5',
    iconActive: '#34D399',
    muted: '#065F46',
    overlay: 'rgba(6, 78, 59, 0.8)',
    skeleton: '#065F46',
    
    tabBg: '#064E3B',
    tabBorder: '#ECFDF5',
    tabActive: '#34D399',
    tabInactive: '#ECFDF5',
    
    cardBg: '#065F46',
    cardBorder: '#ECFDF5',
    
    chartLine: '#34D399',
    chartBg: '#064E3B',
    
    badge: '#34D399',
    badgeText: '#064E3B',
  },
};

// ─── Spacing Scale ───────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// ─── Border Radius (Bento Grid) ──────────────────────────────
export const Radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 999,
} as const;

// ─── Border Widths (Brutalist) ───────────────────────────────
export const BorderWidth = {
  thin: 1,
  normal: 2,
  thick: 3,
  brutalist: 4,
} as const;

// ─── Typography ──────────────────────────────────────────────
export const Typography = {
  // Display — Hero / Featured
  display: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '900' as const,
    letterSpacing: -1.5,
  },
  // H1 — Section Titles
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800' as const,
    letterSpacing: -1,
  },
  // H2 — Card Titles
  h2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.6,
  },
  // H3 — Sub-headers
  h3: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  // Body
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  // Caption
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  // Overline — Badges, Labels
  overline: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '900' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  // Mono — Numbers, Stats
  mono: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  
} as const;

// ─── Shadows (Neo-Brutalist: Hard, Offset, Black) ────────────
export const Shadows = Platform.select({
  web: {
    sm: { boxShadow: '2px 2px 0px 0px #000' },
    md: { boxShadow: '4px 4px 0px 0px #000' },
    lg: { boxShadow: '8px 8px 0px 0px #000' },
  },
  default: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 6,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 10,
    },
  },
}) as Record<'sm' | 'md' | 'lg', any>;


// ─── Bento Grid Config ───────────────────────────────────────
export const BentoConfig = {
  gap: 12,
  columns: 2,
  paddingH: 16,
} as const;

// ─── Fonts ───────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
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
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});




