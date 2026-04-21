import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { NewsItem } from '@/constants/MockData';

interface NewsCardProps {
  item: NewsItem;
  onPress: () => void;
}

export function NewsCard({ item, onPress }: NewsCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <ThemedView style={[styles.container, { borderColor: colors.border }]}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.content}>
          <View style={styles.categoryContainer}>
            <ThemedText style={[styles.category, { color: colors.gold }]}>
              {item.category.toUpperCase()}
            </ThemedText>
            <ThemedText style={styles.date}>{item.date}</ThemedText>
          </View>
          <ThemedText type="subtitle" numberOfLines={2} style={styles.title}>
            {item.title}
          </ThemedText>
          <ThemedText numberOfLines={3} style={styles.excerpt}>
            {item.excerpt}
          </ThemedText>
          <ThemedText style={styles.author}>By {item.author}</ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  title: {
    marginBottom: 8,
    lineHeight: 24,
  },
  excerpt: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
    lineHeight: 20,
  },
  author: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.6,
  },
});
