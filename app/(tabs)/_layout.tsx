import { BorderWidth, Radius, Shadows, Spacing } from '@/constants/theme';
import { useThemeColors, useIsDark } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import { Bookmark, ChartNoAxesCombined, Newspaper } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';

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
            backgroundColor: colors.text, // inverse of background for contrast
            borderColor: colors.borderStrong,
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
                focused && styles.iconContainerActive,
                focused && {
                  backgroundColor: colors.accent,
                  borderColor: colors.background, // contrast border
                },
              ]}
            >
              <Newspaper
                size={20}
                color={focused ? colors.badgeText : colors.background}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText }]}>News</Text>
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
                focused && {
                  backgroundColor: colors.accent,
                  borderColor: colors.background,
                },
                !focused && { backgroundColor: '#8B5CF6' } // Example distinct color for inactive
              ]}
            >
              <ChartNoAxesCombined
                size={20}
                color={focused ? colors.badgeText : colors.background}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText }]}>Market</Text>
              )}
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
                focused && styles.iconContainerActive,
                focused && {
                  backgroundColor: colors.accent,
                  borderColor: colors.background,
                },
                !focused && { backgroundColor: '#F59E0B' } // Another distinct color
              ]}
            >
              <Bookmark
                size={20}
                color={focused ? colors.badgeText : colors.background}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText }]}>Saved</Text>
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
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: Spacing.xl,
    right: Spacing.xl,
    height: 72,
    borderRadius: 36, // Floating pill
    borderWidth: BorderWidth.thick,
    paddingHorizontal: Spacing.md,
    paddingBottom: 0,
    ...Shadows.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24, // Perfect circle
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 24 : 0,
    borderWidth: BorderWidth.normal,
    borderColor: 'transparent',
  },
  iconContainerActive: {
    width: 'auto',
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 8,
    borderRadius: 24, // Expanded pill
    borderWidth: BorderWidth.normal,
  },
  activeText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
