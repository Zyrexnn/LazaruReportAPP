import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useThemeColors } from '@/hooks/use-color-scheme';
import { Typography, BorderWidth, Radius, Shadows, Spacing } from '@/constants/theme';

const STAR_PATH = "M24.9778 49C26.5743 49 27.8824 47.825 28.1041 46.162C30.299 31.3511 32.3167 29.2892 46.5513 27.6707C48.1918 27.4711 49.4557 26.0965 49.4557 24.5001C49.4557 22.8814 48.2141 21.5512 46.5733 21.3073C32.4276 19.334 30.6761 17.6045 28.1041 2.81596C27.8158 1.17521 26.552 0 24.9778 0C23.3594 0 22.0732 1.17521 21.8073 2.83801C19.6566 17.6268 17.639 19.6888 3.42667 21.3073C1.74159 21.5291 0.5 22.8594 0.5 24.5001C0.5 26.0965 1.69726 27.4268 3.38234 27.6707C17.5501 29.6883 19.2795 31.3955 21.8073 46.1843C22.1398 47.8471 23.4257 49 24.9778 49Z";

const DEFAULT_MESSAGES = [
  'FETCHING LATEST INTEL...',
  'SCANNING MARKET NODES...',
  'DECRYPTING DATA STREAMS...',
  'AGGREGATING GLOBAL SOURCES...',
  'ANALYZING SENTIMENT BIAS...',
  'VERIFYING TRUTH VECTORS...',
  'FINALIZING REPORT...'
];

export function NewsLoading({ messages = DEFAULT_MESSAGES }: { messages?: string[] }) {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const [messageIndex, setMessageIndex] = useState(0);

  const rotation = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );

    progressWidth.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0.5, { duration: 500 })
      ),
      -1,
      true
    );

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [messages.length]);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
        <Animated.View style={starStyle}>
          <Svg width="40" height="40" viewBox="0 0 50 49">
            <Path d={STAR_PATH} fill={colors.accent} />
          </Svg>
        </Animated.View>
        
        <View style={styles.content}>
          <Animated.Text key={messageIndex} style={[styles.message, { color: colors.text }, textStyle]}>
            {messages[messageIndex]}
          </Animated.Text>
          
          <View style={[styles.progressBg, { backgroundColor: colors.muted, borderColor: colors.borderStrong }]}>
            <Animated.View style={[styles.progressFill, { backgroundColor: colors.accent }, barStyle]} />
          </View>
          
          <Text style={[styles.subtext, { color: colors.textSecondary }]}>
            LAZARUS_REPORT_ENGINE v1.0.4
          </Text>
        </View>
      </View>
      
      {/* Decorative dots */}
      <View style={styles.dotsRow}>
        {[1, 2, 3].map((i) => (
          <View 
            key={i} 
            style={[
              styles.dot, 
              { 
                backgroundColor: i === 1 ? colors.accent : colors.surface,
                borderColor: colors.borderStrong 
              }
            ]} 
          />
        ))}
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
  card: {
    width: '100%',
    padding: Spacing['2xl'],
    borderWidth: BorderWidth.thick,
    borderRadius: Radius.none,
    alignItems: 'center',
    ...Shadows.md,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  message: {
    ...Typography.mono,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: Spacing.lg,
    textAlign: 'center',
    letterSpacing: 1,
  },
  progressBg: {
    width: '100%',
    height: 12,
    borderWidth: BorderWidth.normal,
    padding: 2,
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: '100%',
  },
  subtext: {
    ...Typography.overline,
    fontSize: 10,
    opacity: 0.6,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  dot: {
    width: 12,
    height: 12,
    borderWidth: BorderWidth.normal,
  },
});
