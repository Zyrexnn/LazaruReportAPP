import { Link } from 'expo-router';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderWidth, Radius, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-color-scheme';
import { Info } from 'lucide-react-native';

export default function ModalScreen() {
  const colors = useThemeColors();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.accentSoft }]}>
          <Info size={32} color={colors.accent} strokeWidth={2.5} />
        </View>
        
        <ThemedText type="title" style={styles.title}>Lazarus Report</ThemedText>
        <ThemedText style={styles.body}>
          You are viewing the intelligence platform redesign. This modular Bento Grid interface is optimized for high-density information retrieval across all devices.
        </ThemedText>

        <Link href="/" dismissTo asChild>
          <Pressable style={[styles.button, { backgroundColor: colors.accent, borderColor: colors.accent }]}>
            <ThemedText style={[styles.buttonText, { color: colors.badgeText }]}>Return to Terminal</ThemedText>
          </Pressable>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    padding: Spacing['3xl'],
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.thick,
    alignItems: 'center',
    gap: Spacing.xl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.normal,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
