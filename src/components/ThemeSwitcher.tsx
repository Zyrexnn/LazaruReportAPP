import { Colors, THEME_LABELS, THEME_PREVIEW_COLORS, Radius, Spacing, BorderWidth } from '@/constants/theme';
import type { ThemeName } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-color-scheme';
import { useThemeStore } from '@/src/store/useThemeStore';
import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const THEMES: ThemeName[] = ['snow', 'obsidian', 'ocean', 'forest'];

export function ThemeSwitcher() {
  const colors = useThemeColors();
  const { themeName, setTheme } = useThemeStore();

  return (
    <View style={styles.container}>
      {THEMES.map((name) => {
        const preview = THEME_PREVIEW_COLORS[name];
        const isActive = themeName === name;

        return (
          <Pressable
            key={name}
            onPress={() => setTheme(name)}
            style={({ pressed }) => [
              styles.themeOption,
              {
                backgroundColor: preview.bg,
                borderColor: isActive ? preview.accent : colors.border,
                borderWidth: isActive ? BorderWidth.brutalist : BorderWidth.thin,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <View style={[styles.accentDot, { backgroundColor: preview.accent }]} />
            <Text
              style={[
                styles.themeLabel,
                { color: preview.text },
              ]}
            >
              {THEME_LABELS[name]}
            </Text>
            {isActive && (
              <View style={[styles.checkBadge, { backgroundColor: preview.accent }]}>
                <Check size={10} color={preview.bg} strokeWidth={3} />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    gap: Spacing.xs,
    position: 'relative',
  },
  accentDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  themeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
