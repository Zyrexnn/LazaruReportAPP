import { BorderWidth, Radius, Shadows, Spacing } from '@/constants/theme';
import { useThemeColors, useIsDark } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import { Bookmark, Compass, TrendingUp, Terminal, Lightbulb } from 'lucide-react-native';
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
            backgroundColor: colors.tabBg,
            borderColor: colors.borderStrong,
          },
        ],
        tabBarShowLabel: false,
        tabBarSafeAreaInsets: { bottom: 0 },
        tabBarItemStyle: {
          height: 60,
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
                  backgroundColor: focused ? colors.accent : colors.surface,
                  borderColor: focused ? colors.borderStrong : colors.border,
                },
                focused && { transform: [{ translateY: -2 }, { translateX: -2 }], ...Shadows.sm }
              ]}
            >
              <Compass
                size={22}
                color={focused ? colors.badgeText : colors.textSecondary}
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
                {
                  backgroundColor: focused ? colors.accent : colors.surface,
                  borderColor: focused ? colors.borderStrong : colors.border,
                },
                focused && { transform: [{ translateY: -2 }, { translateX: -2 }], ...Shadows.sm }
              ]}
            >
              <TrendingUp
                size={22}
                color={focused ? colors.badgeText : colors.textSecondary}
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
        name="ideas"
        options={{
          title: 'Ideas',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
                {
                  backgroundColor: focused ? colors.accent : colors.surface,
                  borderColor: focused ? colors.borderStrong : colors.border,
                },
                focused && { transform: [{ translateY: -2 }, { translateX: -2 }], ...Shadows.sm }
              ]}
            >
              <Lightbulb
                size={22}
                color={focused ? colors.badgeText : colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText }]}>Ideas</Text>
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
                  backgroundColor: focused ? colors.accent : colors.surface,
                  borderColor: focused ? colors.borderStrong : colors.border,
                },
                focused && { transform: [{ translateY: -2 }, { translateX: -2 }], ...Shadows.sm }
              ]}
            >
              <Terminal
                size={22}
                color={focused ? colors.badgeText : colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText }]}>AI</Text>
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
                {
                  backgroundColor: focused ? colors.accent : colors.surface,
                  borderColor: focused ? colors.borderStrong : colors.border,
                },
                focused && { transform: [{ translateY: -2 }, { translateX: -2 }], ...Shadows.sm }
              ]}
            >
              <Bookmark
                size={22}
                color={focused ? colors.badgeText : colors.textSecondary}
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
    bottom: 34,
    left: '12%',
    right: '12%',
    height: 60,
    borderRadius: 30,
    borderWidth: BorderWidth.thick,
    paddingHorizontal: 8,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  iconContainer: {
    height: 42,
    minWidth: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: BorderWidth.thick,
  },
  iconContainerActive: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
    borderRadius: 22,
  },
  activeText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
});
