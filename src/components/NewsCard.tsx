import { BorderWidth, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-color-scheme';
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

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NewsCardComponent({
  article,
  isBookmarked = false,
  onPress,
  onToggleBookmark,
  compact = false,
  featured = false,
}: NewsCardProps) {
  const colors = useThemeColors();

  // ── FEATURED CARD (Full-width bento hero) ───────────────────
  if (featured) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.featuredCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.borderStrong,
          },
          pressed && styles.cardPressed,
        ]}
      >
        <Image
          source={article.imageUrl || FALLBACK_IMAGE}
          contentFit="cover"
          cachePolicy="memory-disk"
          style={styles.featuredImage}
        />

        <View style={styles.featuredContent}>
          <View style={styles.topRow}>
            <View style={[styles.sourceBadge, { backgroundColor: colors.badge }]}>
              <Text style={[styles.sourceBadgeText, { color: colors.badgeText }]}>
                {article.source}
              </Text>
            </View>
            {onToggleBookmark ? (
              <Pressable
                hitSlop={12}
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleBookmark();
                }}
                style={[
                  styles.bookmarkCircle,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                {isBookmarked ? (
                  <BookmarkCheck size={16} color={colors.accent} strokeWidth={2.5} />
                ) : (
                  <Bookmark size={16} color={colors.icon} strokeWidth={2} />
                )}
              </Pressable>
            ) : null}
          </View>

          <Text numberOfLines={3} style={[styles.featuredTitle, { color: colors.text }]}>
            {article.title}
          </Text>

          <View style={styles.metaRow}>
            <Clock3 size={11} color={colors.textSecondary} strokeWidth={2.5} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {timeAgo(article.publishedAt)}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  // ── COMPACT CARD (Horizontal scroll tile) ───────────────────
  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.compactCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
          pressed && styles.cardPressed,
        ]}
      >
        <Image
          source={article.imageUrl || FALLBACK_IMAGE}
          contentFit="cover"
          cachePolicy="memory-disk"
          style={styles.compactImage}
        />
        <View style={styles.compactContent}>
          <Text style={[styles.compactSource, { color: colors.accent }]}>
            {article.source}
          </Text>
          <Text numberOfLines={2} style={[styles.compactTitle, { color: colors.text }]}>
            {article.title}
          </Text>
          <Text style={[styles.compactMeta, { color: colors.textSecondary }]}>
            {timeAgo(article.publishedAt)}
          </Text>
        </View>
      </Pressable>
    );
  }

  // ── DEFAULT CARD (List item — bento tile) ───────────────────
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.cardBorder,
        },
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
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleBookmark();
                }}
              >
                {isBookmarked ? (
                  <BookmarkCheck size={16} color={colors.accent} strokeWidth={2.5} />
                ) : (
                  <Bookmark size={16} color={colors.icon} strokeWidth={2} />
                )}
              </Pressable>
            )}
          </View>

          <Text numberOfLines={2} style={[styles.title, { color: colors.text }]}>
            {article.title}
          </Text>

          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {timeAgo(article.publishedAt)}
            </Text>
          </View>
        </View>

        {article.imageUrl ? (
          <Image
            source={article.imageUrl}
            contentFit="cover"
            cachePolicy="memory-disk"
            style={styles.thumbnail}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

export const NewsCard = memo(NewsCardComponent);

const styles = StyleSheet.create({
  // ── Default Card ───────────────────────────────────────────
  card: {
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.normal,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  cardContent: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  textContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  thumbnail: {
    width: 84,
    height: 84,
    borderRadius: Radius.md,
  },

  // ── Featured Card ──────────────────────────────────────────
  featuredCard: {
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.thick,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  featuredImage: {
    width: '100%',
    height: 220,
  },
  featuredContent: {
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  sourceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.xs,
  },
  sourceBadgeText: {
    ...Typography.overline,
    fontSize: 9,
  },
  bookmarkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: BorderWidth.thin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredTitle: {
    ...Typography.h1,
    fontSize: 22,
    lineHeight: 28,
  },

  // ── Compact Card ───────────────────────────────────────────
  compactCard: {
    width: 170,
    marginRight: Spacing.md,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: BorderWidth.normal,
  },
  compactImage: {
    width: '100%',
    height: 100,
  },
  compactContent: {
    padding: Spacing.md,
    gap: 3,
  },
  compactSource: {
    ...Typography.overline,
    fontSize: 9,
  },
  compactTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  compactMeta: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  // ── Shared ─────────────────────────────────────────────────
  source: {
    ...Typography.overline,
    fontSize: 10,
  },
  title: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.caption,
    fontSize: 11,
  },
});
