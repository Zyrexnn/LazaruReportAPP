import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Bookmark, ChartNoAxesCombined, Newspaper, Search } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';

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
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          }
        ],
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: 'transparent' }} />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: colors.accent }]}>
               <Newspaper size={20} color={focused ? (colorScheme === 'dark' ? '#000' : '#FFF') : color} strokeWidth={focused ? 2 : 1.5} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => focused ? null : <></>, 
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: colors.accent }]}>
              <ChartNoAxesCombined size={20} color={focused ? (colorScheme === 'dark' ? '#000' : '#FFF') : color} strokeWidth={focused ? 2 : 1.5} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
             <View style={[styles.iconContainer, focused && { backgroundColor: colors.accent }]}>
              <Bookmark size={20} color={focused ? (colorScheme === 'dark' ? '#000' : '#FFF') : color} strokeWidth={focused ? 2 : 1.5} />
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
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 20,
    right: 20,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    paddingHorizontal: 10,
    paddingBottom: 0, // Override default padding
  },
  iconContainer: {
    padding: 10,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8, // Adjust for centering
  }
});
