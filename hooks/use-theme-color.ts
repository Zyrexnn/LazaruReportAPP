import { useThemeColors } from '@/hooks/use-color-scheme';
import type { ThemeColors } from '@/constants/theme';

/**
 * Returns a specific theme color value.
 * @deprecated Use useThemeColors() directly for full color object
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors
) {
  const colors = useThemeColors();
  return colors[colorName];
}
