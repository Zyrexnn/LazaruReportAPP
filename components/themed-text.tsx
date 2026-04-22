import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColors } from '@/hooks/use-color-scheme';
import { Typography } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'overline';
};

export function ThemedText({
  style,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const colors = useThemeColors();

  return (
    <Text
      style={[
        { color: colors.text },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? [styles.link, { color: colors.accent }] : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'overline' ? [styles.overline, { color: colors.textSecondary }] : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    ...Typography.body,
  },
  defaultSemiBold: {
    ...Typography.body,
    fontWeight: '700',
  },
  title: {
    ...Typography.h1,
  },
  subtitle: {
    ...Typography.h2,
  },
  link: {
    ...Typography.body,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  caption: {
    ...Typography.caption,
  },
  overline: {
    ...Typography.overline,
  },
});
