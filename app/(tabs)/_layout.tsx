import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Bookmark, ChartNoAxesCombined, Newspaper } from 'lucide-react-native';
import React from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.icon,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={90} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'News',
          tabBarIcon: ({ color }) => <Newspaper size={20} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          tabBarIcon: ({ color }) => <ChartNoAxesCombined size={20} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => <Bookmark size={20} color={color} strokeWidth={1.5} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: 84,
    paddingTop: 8,
    paddingBottom: 28,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
  },
});
