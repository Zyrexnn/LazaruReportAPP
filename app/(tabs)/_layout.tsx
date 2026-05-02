import { BorderWidth, Radius, Shadows, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import { Compass, TrendingUp, Terminal, Lightbulb, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isCompact = width < 380;
  const tabBarHorizontal = width < 360 ? Spacing.md : Spacing.lg;
  const tabBarBottom = Math.max(insets.bottom + Spacing.sm, Spacing.lg);
  const tabBarHeight = isCompact ? 64 : 72;
  const iconBoxHeight = isCompact ? 44 : 48;
  const iconSize = isCompact ? 20 : 22;
  const activeLabelSize = isCompact ? 12 : 14;
  const activeLabelSpacing = isCompact ? 6 : 10;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.tabBg,
            borderColor: colors.borderStrong,
            left: tabBarHorizontal,
            right: tabBarHorizontal,
            bottom: tabBarBottom,
            height: tabBarHeight,
          },
        ],
        tabBarShowLabel: false,
        tabBarSafeAreaInsets: { bottom: insets.bottom },
        tabBarItemStyle: {
          height: tabBarHeight - 10,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: 'transparent' }} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
                {
                  height: iconBoxHeight,
                  backgroundColor: focused ? colors.accent : colors.surface,
                  borderColor: focused ? colors.borderStrong : colors.border,
                },
                focused && { gap: activeLabelSpacing },
                focused && { transform: [{ translateY: -2 }, { translateX: -2 }], ...Shadows.sm }
              ]}
            >
              <Compass
                size={iconSize}
                color={focused ? colors.badgeText : colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText, fontSize: activeLabelSize }]}>News</Text>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
                {
                  height: iconBoxHeight,
                  backgroundColor: focused ? colors.accent : colors.surface,
                  borderColor: focused ? colors.borderStrong : colors.border,
                },
                focused && { gap: activeLabelSpacing },
                focused && { transform: [{ translateY: -2 }, { translateX: -2 }], ...Shadows.sm }
              ]}
            >
              <TrendingUp
                size={iconSize}
                color={focused ? colors.badgeText : colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText, fontSize: activeLabelSize }]}>Market</Text>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ideas"
        options={{
          title: 'Ideas',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
                {
                  height: iconBoxHeight,
                  backgroundColor: focused ? colors.accent : colors.surface,
                  borderColor: focused ? colors.borderStrong : colors.border,
                },
                focused && { gap: activeLabelSpacing },
                focused && { transform: [{ translateY: -2 }, { translateX: -2 }], ...Shadows.sm }
              ]}
            >
              <Lightbulb
                size={iconSize}
                color={focused ? colors.badgeText : colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText, fontSize: activeLabelSize }]}>Ideas</Text>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
                {
                  height: iconBoxHeight,
                  backgroundColor: focused ? colors.accent : colors.surface,
                  borderColor: focused ? colors.borderStrong : colors.border,
                },
                focused && { gap: activeLabelSpacing },
                focused && { transform: [{ translateY: -2 }, { translateX: -2 }], ...Shadows.sm }
              ]}
            >
              <Terminal
                size={iconSize}
                color={focused ? colors.badgeText : colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText, fontSize: activeLabelSize }]}>AI</Text>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
                {
                  height: iconBoxHeight,
                  backgroundColor: focused ? colors.accent : colors.surface,
                  borderColor: focused ? colors.borderStrong : colors.border,
                },
                focused && { gap: activeLabelSpacing },
                focused && { transform: [{ translateY: -2 }, { translateX: -2 }], ...Shadows.sm }
              ]}
            >
              <User
                size={iconSize}
                color={focused ? colors.badgeText : colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText, fontSize: activeLabelSize }]}>Profile</Text>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.brutalist,
    paddingHorizontal: 12,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  iconContainer: {
    height: 48,
    minWidth: 48,
    borderRadius: Radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: BorderWidth.thick,
  },
  iconContainerActive: {
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  activeText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
});
