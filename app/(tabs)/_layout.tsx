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
  
  // Brutalist constants
  const tabBarHeight = 70;
  const itemWidth = 46; 
  const itemHeight = 56;
  const iconSize = 22;

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
            backgroundColor: colors.surface,
            borderColor: colors.borderStrong,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 0,
            height: tabBarHeight + (insets.bottom > 0 ? insets.bottom : 0),
          },
        ],
        tabBarShowLabel: false,
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'News',
          tabBarIcon: ({ focused }) => (
            <View style={[
              styles.iconBox,
              { width: itemWidth, height: itemHeight },
              focused && {
                backgroundColor: colors.accent,
                borderWidth: BorderWidth.thick,
                borderColor: colors.borderStrong,
                ...Shadows.sm
              }
            ]}>
              <Compass
                size={iconSize}
                color={focused ? colors.badgeText : colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText }]} numberOfLines={1} adjustsFontSizeToFit>
                  NEWS
                </Text>
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
            <View style={[
              styles.iconBox,
              { width: itemWidth, height: itemHeight },
              focused && {
                backgroundColor: colors.accent,
                borderWidth: BorderWidth.thick,
                borderColor: colors.borderStrong,
                ...Shadows.sm
              }
            ]}>
              <TrendingUp
                size={iconSize}
                color={focused ? colors.badgeText : colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText }]} numberOfLines={1} adjustsFontSizeToFit>
                  MRKT
                </Text>
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
            <View style={[
              styles.iconBox,
              { width: itemWidth, height: itemHeight },
              focused && {
                backgroundColor: colors.accent,
                borderWidth: BorderWidth.thick,
                borderColor: colors.borderStrong,
                ...Shadows.sm
              }
            ]}>
              <Lightbulb
                size={iconSize}
                color={focused ? colors.badgeText : colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText }]} numberOfLines={1} adjustsFontSizeToFit>
                  IDEA
                </Text>
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
            <View style={[
              styles.iconBox,
              { width: itemWidth, height: itemHeight },
              focused && {
                backgroundColor: colors.accent,
                borderWidth: BorderWidth.thick,
                borderColor: colors.borderStrong,
                ...Shadows.sm
              }
            ]}>
              <Terminal
                size={iconSize}
                color={focused ? colors.badgeText : colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText }]} numberOfLines={1} adjustsFontSizeToFit>
                  CHAT
                </Text>
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
            <View style={[
              styles.iconBox,
              { width: itemWidth, height: itemHeight },
              focused && {
                backgroundColor: colors.accent,
                borderWidth: BorderWidth.thick,
                borderColor: colors.borderStrong,
                ...Shadows.sm
              }
            ]}>
              <Bookmark
                size={iconSize}
                color={focused ? colors.badgeText : colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText }]} numberOfLines={1} adjustsFontSizeToFit>
                  SAVE
                </Text>
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
            <View style={[
              styles.iconBox,
              { width: itemWidth, height: itemHeight },
              focused && {
                backgroundColor: colors.accent,
                borderWidth: BorderWidth.thick,
                borderColor: colors.borderStrong,
                ...Shadows.sm
              }
            ]}>
              <User
                size={iconSize}
                color={focused ? colors.badgeText : colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              {focused && (
                <Text style={[styles.activeText, { color: colors.badgeText }]} numberOfLines={1} adjustsFontSizeToFit>
                  ME
                </Text>
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
    borderTopWidth: BorderWidth.brutalist,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.xs,
    padding: 2,
    gap: 2,
  },
  activeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
});
