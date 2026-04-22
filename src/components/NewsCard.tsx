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
          { backgroundColor: colors.surface },
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
            <View style={[styles.sourceBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.sourceBadgeText}>{article.source}</Text>
            </View>
            {onToggleBookmark ? (
              <Pressable
                hitSlop={12}
                onPress={(event) => {
                  event.stopPropagation();
                  onToggleBookmark();
                }}
                style={[styles.bookmarkCircle, { backgroundColor: colors.background }]}>
                {isBookmarked ? 
                  <BookmarkCheck size={18} color={colors.accent} strokeWidth={2} /> : 
                  <Bookmark size={18} color={colors.icon} strokeWidth={2} />
                }
              </Pressable>
            ) : null}
          </View>

          <Text numberOfLines={3} style={[styles.featuredTitle, { color: colors.text }]}>
            {article.title}
          </Text>

          <View style={styles.metaRow}>
            <Clock3 size={12} color={colors.secondary} strokeWidth={2} />
            <Text style={[styles.metaText, { color: colors.secondary }]}>
              {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  if (compact) {
    return (
      <Pressable 
        onPress={onPress} 
        style={({ pressed }) => [
          styles.compactCard, 
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && styles.cardPressed,
        ]}
      >
        <Image
          source={article.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop'}
          contentFit="cover"
          cachePolicy="memory-disk"
          style={styles.compactImage}
        />
        <View style={styles.compactContent}>
          <Text style={[styles.source, { color: colors.accent }]}>{article.source}</Text>
          <Text numberOfLines={2} style={[styles.compactTitle, { color: colors.text }]}>
            {article.title}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.card, 
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.cardPressed, 
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.textContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.source, { color: colors.accent }]}>{article.source}</Text>
            {onToggleBookmark && (
              <Pressable
                hitSlop={12}
                onPress={(event) => {
                  event.stopPropagation();
                  onToggleBookmark();
                }}
              >
                {isBookmarked ? 
                  <BookmarkCheck size={16} color={colors.accent} strokeWidth={2} /> : 
                  <Bookmark size={16} color={colors.icon} strokeWidth={2} />
                }
              </Pressable>
            )}
          </View>
          
          <Text numberOfLines={2} style={[styles.title, { color: colors.text }]}>
            {article.title}
          </Text>

          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.secondary }]}>
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
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  textContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  featuredCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  featuredImage: {
    width: '100%',
    height: 240,
  },
  featuredContent: {
    padding: 20,
    gap: 8,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sourceBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  bookmarkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  compactCard: {
    width: 180,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  compactImage: {
    width: '100%',
    height: 110,
  },
  compactContent: {
    padding: 12,
    gap: 4,
  },
  compactTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  source: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
