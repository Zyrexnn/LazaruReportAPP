import { useThemeStore } from '@/src/store/useThemeStore';

export function useColorScheme() {
  const themeMode = useThemeStore((state) => state.themeMode);
  return themeMode;
}
