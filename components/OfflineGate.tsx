import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff, RefreshCcw } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/use-color-scheme';
import { BorderWidth, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { Pressable } from 'react-native';

interface OfflineGateProps {
  isOffline: boolean;
  children: React.ReactNode;
  onRetry?: () => void;
  message?: string;
}

export function OfflineGate({ isOffline, children, onRetry, message }: OfflineGateProps) {
  const colors = useThemeColors();

  if (!isOffline) return <>{children}</>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
        <View style={[styles.iconCircle, { backgroundColor: colors.error + '20' }]}>
          <WifiOff size={32} color={colors.error} strokeWidth={2.5} />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>CONNECTION LOST</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message || "Connection lost. This feature requires an active connection to fetch real-time data."}
        </Text>

        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryBtn,
            { backgroundColor: colors.accent, borderColor: colors.borderStrong },
            pressed && styles.retryBtnPressed
          ]}
        >
          <RefreshCcw size={18} color="#FFF" strokeWidth={2.5} />
          <Text style={styles.retryText}>RESTORE UPLINK</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  box: {
    padding: Spacing.xl,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    alignItems: 'center',
    width: '100%',
    ...Shadows.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    fontSize: 22,
    marginBottom: Spacing.sm,
    fontWeight: '900',
  },
  message: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    marginBottom: Spacing.xl,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    gap: 10,
    ...Shadows.sm,
  },
  retryBtnPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    ...Shadows.none,
  },
  retryText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
