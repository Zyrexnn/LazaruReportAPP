import { BorderWidth, Radius, Shadows, Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import { Compass, TrendingUp, Terminal, Lightbulb, User, Bookmark } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const isCompact = width < 380;
  const tabBarHorizontal = width < 360 ? Spacing.sm : width < 420 ? Spacing.md : Spacing.lg;
  const tabBarBottom = Math.max(insets.bottom + Spacing.sm, Spacing.lg);
  
  // Adjusted sizes for 6-tab layout
  const tabBarHeight = isCompact ? 60 : 68;
  const iconBoxHeight = isCompact ? 40 : 44;
  const iconSize = isCompact ? 18 : 20;
  const activeLabelSize = isCompact ? 11 : 12;
  const activeLabelSpacing = isCompact ? 4 : 6;

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
          tabBarIcon: ({ focused }) => (
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
          tabBarIcon: ({ focused }) => (
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
          tabBarIcon: ({ focused }) => (
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
          tabBarIcon: ({ focused }) => (
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
        name="bookmarks"
        options={{
          title: 'Saved',
          tabBarIcon: ({ focused }) => (
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
              <Bookmark
                size={iconSize}
                color={focused ? colors.badgeText : colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText, fontSize: activeLabelSize }]}>Saved</Text>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ focused }) => (
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
                <Text style={[styles.activeText, { color: colors.badgeText, fontSize: activeLabelSize }]}>Me</Text>
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
    paddingHorizontal: 8,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  iconContainer: {
    height: 44,
    minWidth: 40,
    borderRadius: Radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: BorderWidth.thick,
  },
  iconContainerActive: {
    paddingHorizontal: 10,
    flexDirection: 'row',
  },
  activeText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
});
