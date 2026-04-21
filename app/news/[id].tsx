import React from 'react';
import { StyleSheet, ScrollView, Image, View, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MOCK_NEWS } from '@/constants/MockData';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const item = MOCK_NEWS.find((n) => n.id === id);

  if (!item) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Article not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Article',
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={[styles.backButton, { backgroundColor: colors.background + 'CC' }]}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerTitle: '',
        }} 
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.content}>
          <ThemedText style={[styles.category, { color: colors.gold }]}>
            {item.category.toUpperCase()}
          </ThemedText>
          <ThemedText type="title" style={styles.title}>
            {item.title}
          </ThemedText>
          <View style={styles.meta}>
            <ThemedText style={styles.author}>By {item.author}</ThemedText>
            <ThemedText style={styles.date}>{item.date}</ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ThemedText style={styles.fullText}>
            {item.excerpt}
            {"\n\n"}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
            {"\n\n"}
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            {"\n\n"}
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: undefined, // Uses ThemedView's background
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  category: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    lineHeight: 34,
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  author: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    opacity: 0.5,
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  fullText: {
    fontSize: 18,
    lineHeight: 28,
    opacity: 0.9,
  },
});
