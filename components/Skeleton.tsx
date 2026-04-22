import type { ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

export function SkeletonBlock({
  width = '100%',
  height = 16,
  radius = 999,
  style,
}: {
  width?: number | `${number}%` | '100%';
  height?: number;
  radius?: number;
  style?: ViewStyle;
}) {
  return <View style={[styles.block, { width, height, borderRadius: radius }, style]} />;
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#EEF2F7',
  },
});
