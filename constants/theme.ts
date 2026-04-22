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
  // ── Snow (Default White) ────────────────────────────────────
  snow: {
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    
    accent: '#FF2D55',
    accentSoft: 'rgba(255, 45, 85, 0.08)',
    primary: '#1A1A1A',
    
    border: '#E5E7EB',
    borderStrong: '#1A1A1A',
    
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    
    icon: '#9CA3AF',
    iconActive: '#1A1A1A',
    muted: '#F3F4F6',
    overlay: 'rgba(0, 0, 0, 0.5)',
    skeleton: '#E5E7EB',
    
    tabBg: '#FFFFFF',
    tabBorder: '#E5E7EB',
    tabActive: '#1A1A1A',
    tabInactive: '#9CA3AF',
    
    cardBg: '#FFFFFF',
    cardBorder: '#E5E7EB',
    
    chartLine: '#1A1A1A',
    chartBg: '#FFFFFF',
    
    badge: '#FF2D55',
    badgeText: '#FFFFFF',
  },
  
  // ── Obsidian (Dark) ─────────────────────────────────────────
  obsidian: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#0A0A0A',
    surface: '#141414',
    surfaceElevated: '#1C1C1C',
    
    accent: '#FFD700',
    accentSoft: 'rgba(255, 215, 0, 0.1)',
    primary: '#F9FAFB',
    
    border: '#262626',
    borderStrong: '#F9FAFB',
    
    success: '#22C55E',
    error: '#EF4444',
    warning: '#FBBF24',
    
    icon: '#6B7280',
    iconActive: '#F9FAFB',
    muted: '#1C1C1C',
    overlay: 'rgba(0, 0, 0, 0.7)',
    skeleton: '#262626',
    
    tabBg: '#0A0A0A',
    tabBorder: '#262626',
    tabActive: '#FFD700',
    tabInactive: '#6B7280',
    
    cardBg: '#141414',
    cardBorder: '#262626',
    
    chartLine: '#F9FAFB',
    chartBg: '#0A0A0A',
    
    badge: '#FFD700',
    badgeText: '#0A0A0A',
  },
  
  // ── Ocean (Midnight Blue) ───────────────────────────────────
  ocean: {
    text: '#E2E8F0',
    textSecondary: '#94A3B8',
    background: '#0B1929',
    surface: '#0F2237',
    surfaceElevated: '#132D46',
    
    accent: '#38BDF8',
    accentSoft: 'rgba(56, 189, 248, 0.1)',
    primary: '#E2E8F0',
    
    border: '#1E3A5F',
    borderStrong: '#38BDF8',
    
    success: '#34D399',
    error: '#FB7185',
    warning: '#FCD34D',
    
    icon: '#64748B',
    iconActive: '#E2E8F0',
    muted: '#132D46',
    overlay: 'rgba(11, 25, 41, 0.8)',
    skeleton: '#1E3A5F',
    
    tabBg: '#0B1929',
    tabBorder: '#1E3A5F',
    tabActive: '#38BDF8',
    tabInactive: '#64748B',
    
    cardBg: '#0F2237',
    cardBorder: '#1E3A5F',
    
    chartLine: '#38BDF8',
    chartBg: '#0B1929',
    
    badge: '#38BDF8',
    badgeText: '#0B1929',
  },
  
  // ── Forest (Green) ──────────────────────────────────────────
  forest: {
    text: '#ECFDF5',
    textSecondary: '#86EFAC',
    background: '#0C1F0F',
    surface: '#132917',
    surfaceElevated: '#1A3A1F',
    
    accent: '#4ADE80',
    accentSoft: 'rgba(74, 222, 128, 0.1)',
    primary: '#ECFDF5',
    
    border: '#1A4024',
    borderStrong: '#4ADE80',
    
    success: '#34D399',
    error: '#FB7185',
    warning: '#FCD34D',
    
    icon: '#4B6B52',
    iconActive: '#ECFDF5',
    muted: '#1A3A1F',
    overlay: 'rgba(12, 31, 15, 0.8)',
    skeleton: '#1A4024',
    
    tabBg: '#0C1F0F',
    tabBorder: '#1A4024',
    tabActive: '#4ADE80',
    tabInactive: '#4B6B52',
    
    cardBg: '#132917',
    cardBorder: '#1A4024',
    
    chartLine: '#4ADE80',
    chartBg: '#0C1F0F',
    
    badge: '#4ADE80',
    badgeText: '#0C1F0F',
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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 999,
} as const;

// ─── Border Widths (Brutalist) ───────────────────────────────
export const BorderWidth = {
  thin: 1,
  normal: 1.5,
  thick: 2,
  brutalist: 3,
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

// ─── Shadows ─────────────────────────────────────────────────
export const Shadows = Platform.select({
  web: {
    sm: { boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    md: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    lg: { boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
  },
  default: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
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
