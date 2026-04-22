import { useThemeColors } from '@/hooks/use-color-scheme';
import { useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import { Animated, StyleSheet, View } from 'react-native';

export function SkeletonBlock({
  width = '100%',
  height = 16,
  radius = 12,
  style,
}: {
  width?: number | `${number}%` | '100%';
  height?: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const colors = useThemeColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
}
