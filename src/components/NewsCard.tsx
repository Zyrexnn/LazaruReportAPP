import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { NewsArticle } from '@/src/types/news';
import { Image } from 'expo-image';
import { Bookmark, BookmarkCheck, Clock3 } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type NewsCardProps = {
  article: NewsArticle;
  isBookmarked?: boolean;
  onPress: () => void;
  onToggleBookmark?: () => void;
  compact?: boolean;
  featured?: boolean;
};

const CARD_RADIUS = 12;

export function NewsCardComponent({
  article,
  isBookmarked = false,
  onPress,
  onToggleBookmark,
  compact = false,
  featured = false,
}: NewsCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (featured) {
    return (
      <Pressable 
        onPress={onPress} 
        style={({ pressed }) => [
          styles.featuredCard, 
          { backgroundColor: colors.card },
          pressed && styles.cardPressed,
        ]}
      >
        <Image
          source={article.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop'}
          contentFit="cover"
          cachePolicy="memory-disk"
          style={styles.featuredImage}
        />

        <View style={styles.featuredContent}>
          <View style={styles.topRow}>
            <Text style={[styles.source, { color: colors.accent }]}>{article.source}</Text>
            {onToggleBookmark ? (
              <Pressable
                hitSlop={12}
                onPress={(event) => {
                  event.stopPropagation();
                  onToggleBookmark();
                }}
                style={styles.bookmarkButton}>
                {isBookmarked ? 
                  <BookmarkCheck size={20} color={colors.accent} strokeWidth={1.5} /> : 
                  <Bookmark size={20} color={colors.icon} strokeWidth={1.5} />
                }
              </Pressable>
            ) : null}
          </View>

          <Text numberOfLines={3} style={[styles.featuredTitle, { color: colors.text }]}>
            {article.title}
          </Text>
          
          <Text numberOfLines={2} style={[styles.summary, { color: colors.icon }]}>
            {article.summary}
          </Text>

          <View style={styles.metaRow}>
            <Clock3 size={11} color={colors.icon} strokeWidth={1.5} />
            <Text style={[styles.metaText, { color: colors.icon }]}>
              {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.card, 
        { backgroundColor: colors.card },
        pressed && styles.cardPressed, 
        compact && styles.compactCard
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.textContent}>
          <View style={styles.topRow}>
            <Text style={[styles.source, { color: colors.icon }]}>{article.source}</Text>
            {onToggleBookmark ? (
              <Pressable
                hitSlop={12}
                onPress={(event) => {
                  event.stopPropagation();
                  onToggleBookmark();
                }}
                style={styles.bookmarkButton}>
                {isBookmarked ? 
                  <BookmarkCheck size={18} color={colors.accent} strokeWidth={1.5} /> : 
                  <Bookmark size={18} color={colors.icon} strokeWidth={1.5} />
                }
              </Pressable>
            ) : null}
          </View>

          <Text numberOfLines={3} style={[styles.title, { color: colors.text }]}>
            {article.title}
          </Text>

          <View style={styles.metaRow}>
            <Clock3 size={11} color={colors.icon} strokeWidth={1.5} />
            <Text style={[styles.metaText, { color: colors.icon }]}>
              {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {article.imageUrl && (
          <Image
            source={article.imageUrl}
            contentFit="cover"
            cachePolicy="memory-disk"
            style={styles.thumbnail}
          />
        )}
      </View>
    </Pressable>
  );
}

export const NewsCard = memo(NewsCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.7,
  },
  compactCard: {
    width: 260,
    marginRight: 12,
    marginBottom: 0,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  textContent: {
    flex: 1,
    gap: 8,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredContent: {
    padding: 16,
    gap: 8,
  },
  featuredTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  source: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookmarkButton: {
    padding: 4,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  compactTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  summary: {
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
