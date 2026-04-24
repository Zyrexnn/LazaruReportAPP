import { BorderWidth, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-color-scheme';
import type { NewsArticle } from '@/src/types/news';
import { Image } from 'expo-image';
import { Bookmark, BookmarkCheck, Clock3 } from 'lucide-react-native';
import React, { memo } from 'react';
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
          !pressed && Shadows.md,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={[styles.imageContainer, { borderBottomWidth: BorderWidth.normal }]}>
          <Image
            source={article.imageUrl || FALLBACK_IMAGE}
            contentFit="cover"
            cachePolicy="memory-disk"
            style={styles.featuredImage}
          />
          <View style={[styles.sourceBadge, { backgroundColor: colors.badge, borderLeftWidth: BorderWidth.normal, borderBottomWidth: BorderWidth.normal }]}>
            <Text style={[styles.sourceBadgeText, { color: colors.badgeText }]}>
              {article.source}
            </Text>
          </View>
        </View>

        <View style={styles.featuredContent}>
          <View style={styles.topRow}>
            <View style={styles.metaRow}>
              <Clock3 size={12} color={colors.textSecondary} strokeWidth={3} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {timeAgo(article.publishedAt)}
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
                  <BookmarkCheck size={18} color={colors.accent} strokeWidth={3} />
                ) : (
                  <Bookmark size={18} color={colors.text} strokeWidth={2.5} />
                )}
              </Pressable>
            ) : null}
          </View>

          <Text numberOfLines={3} style={[styles.featuredTitle, { color: colors.text }]}>
            {article.title}
          </Text>
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
          !pressed && Shadows.sm,
          pressed && styles.cardPressed,
        ]}
      >
        <Image
          source={article.imageUrl || FALLBACK_IMAGE}
          contentFit="cover"
          cachePolicy="memory-disk"
          style={styles.compactImage}
        />
        <View style={[styles.compactContent, { borderTopWidth: BorderWidth.thin }]}>
          <Text style={[styles.compactSource, { color: colors.accent }]}>
            {article.source}
          </Text>
          <Text numberOfLines={2} style={[styles.compactTitle, { color: colors.text }]}>
            {article.title}
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
        !pressed && Shadows.sm,
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
                  <BookmarkCheck size={18} color={colors.accent} strokeWidth={3} />
                ) : (
                  <Bookmark size={18} color={colors.text} strokeWidth={2.5} />
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
          <View style={[styles.thumbnailContainer, { borderColor: colors.border, borderWidth: BorderWidth.thin }]}>
            <Image
              source={article.imageUrl}
              contentFit="cover"
              cachePolicy="memory-disk"
              style={styles.thumbnail}
            />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export const NewsCard = memo(NewsCardComponent);

const styles = StyleSheet.create({
  // ── Default Card ───────────────────────────────────────────
  card: {
    marginBottom: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.normal,
    overflow: 'visible', // For shadows
  },
  cardPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
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
  thumbnailContainer: {
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 80,
    height: 80,
  },

  // ── Featured Card ──────────────────────────────────────────
  featuredCard: {
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.thick,
    overflow: 'visible', // For shadows
    marginBottom: Spacing.xl,
  },
  imageContainer: {
    position: 'relative',
    height: 220,
    overflow: 'hidden',
    borderTopLeftRadius: Radius.lg - BorderWidth.thick,
    borderTopRightRadius: Radius.lg - BorderWidth.thick,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredContent: {
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sourceBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  sourceBadgeText: {
    ...Typography.overline,
    fontSize: 10,
    fontWeight: '900',
  },
  bookmarkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: BorderWidth.normal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredTitle: {
    ...Typography.h1,
    fontSize: 24,
    lineHeight: 30,
  },

  // ── Compact Card ───────────────────────────────────────────
  compactCard: {
    width: 200,
    marginRight: Spacing.xl,
    borderRadius: Radius.md,
    overflow: 'visible', // For shadows
    borderWidth: BorderWidth.normal,
  },
  compactImage: {
    width: '100%',
    height: 110,
    borderTopLeftRadius: Radius.md - BorderWidth.normal,
    borderTopRightRadius: Radius.md - BorderWidth.normal,
  },
  compactContent: {
    padding: Spacing.md,
    gap: 4,
  },
  compactSource: {
    ...Typography.overline,
    fontSize: 9,
    fontWeight: '900',
  },
  compactTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  // ── Shared ─────────────────────────────────────────────────
  source: {
    ...Typography.overline,
    fontSize: 11,
    fontWeight: '900',
  },
  title: {
    ...Typography.h3,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
  },
});
