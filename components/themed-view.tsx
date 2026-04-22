import { View, type ViewProps } from 'react-native';
import { useThemeColors } from '@/hooks/use-color-scheme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, ...otherProps }: ThemedViewProps) {
  const colors = useThemeColors();

  return <View style={[{ backgroundColor: colors.background }, style]} {...otherProps} />;
}
