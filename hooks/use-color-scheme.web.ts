import { useThemeStore } from '@/src/store/useThemeStore';
import { Colors } from '@/constants/theme';
import type { ThemeColors, ThemeName } from '@/constants/theme';

export function useColorScheme(): ThemeName {
  return useThemeStore((state) => state.themeName);
}

export function useThemeColors(): ThemeColors {
  const themeName = useThemeStore((state) => state.themeName);
  return Colors[themeName];
}

export function useIsDark(): boolean {
  const themeName = useThemeStore((state) => state.themeName);
  return themeName !== 'snow';
}
