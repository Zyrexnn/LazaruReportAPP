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
                  borderColor: '#000',
                  ...Shadows.sm,
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
                  borderColor: '#000',
                  ...Shadows.sm,
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
                  borderColor: '#000',
                  ...Shadows.sm,
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
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: Spacing.xl,
    right: Spacing.xl,
    height: 64,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.thick,
    borderTopWidth: BorderWidth.thick,
    paddingHorizontal: Spacing.sm,
    paddingBottom: 0,
    ...Shadows.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: BorderWidth.normal,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 20 : 0,
  },
});
