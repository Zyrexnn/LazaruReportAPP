import { BorderWidth, Radius, Shadows, Spacing } from '@/constants/theme';
import { useThemeColors, useIsDark } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import { Bookmark, ChartNoAxesCombined, Newspaper } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const colors = useThemeColors();
  const isDark = useIsDark();

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
            borderColor: colors.tabBorder,
          },
        ],
        tabBarShowLabel: false,
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
                focused && {
                  backgroundColor: colors.accent,
                  borderColor: colors.accent,
                },
              ]}
            >
              <Newspaper
                size={20}
                color={focused ? colors.badgeText : color}
                strokeWidth={focused ? 2.5 : 1.5}
              />
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
                focused && {
                  backgroundColor: colors.accent,
                  borderColor: colors.accent,
                },
              ]}
            >
              <ChartNoAxesCombined
                size={20}
                color={focused ? colors.badgeText : color}
                strokeWidth={focused ? 2.5 : 1.5}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && {
                  backgroundColor: colors.accent,
                  borderColor: colors.accent,
                },
              ]}
            >
              <Bookmark
                size={20}
                color={focused ? colors.badgeText : color}
                strokeWidth={focused ? 2.5 : 1.5}
              />
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
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: Spacing.lg,
    right: Spacing.lg,
    height: 60,
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.thick,
    ...Shadows.lg,
    paddingHorizontal: Spacing.sm,
    paddingBottom: 0,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
});
