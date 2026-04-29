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
        <View style={[styles.imageContainer, { borderBottomWidth: BorderWidth.thick }]}>
          <Image
            source={article.imageUrl || FALLBACK_IMAGE}
            contentFit="cover"
            cachePolicy="memory-disk"
            style={styles.featuredImage}
          />
          <View style={[styles.sourceBadge, { backgroundColor: colors.surfaceElevated, borderLeftWidth: BorderWidth.thick, borderBottomWidth: BorderWidth.thick }]}>
            <Text style={[styles.sourceBadgeText, { color: '#000' }]}>
              {article.source.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.featuredContent}>
          <View style={styles.topRow}>
            <View style={styles.metaRow}>
              <Clock3 size={12} color={colors.textSecondary} strokeWidth={3} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {timeAgo(article.publishedAt).toUpperCase()}
              </Text>
            </View>
            {onToggleBookmark && (
              <Pressable
                hitSlop={12}
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleBookmark();
                }}
                style={[
                  styles.bookmarkCircle,
                  { backgroundColor: isBookmarked ? colors.accent : colors.surface, borderColor: colors.borderStrong },
                ]}
              >
                {isBookmarked ? (
                  <BookmarkCheck size={18} color="#FFF" strokeWidth={3} />
                ) : (
                  <Bookmark size={18} color={colors.text} strokeWidth={2.5} />
                )}
              </Pressable>
            )}
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
            borderColor: colors.borderStrong,
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
        <View style={[styles.compactContent, { borderTopWidth: BorderWidth.thick }]}>
          <View style={styles.compactHeader}>
            <Text style={[styles.compactSource, { color: colors.accent }]}>
              {article.source.toUpperCase()}
            </Text>
            {onToggleBookmark && (
              <Pressable
                hitSlop={12}
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleBookmark();
                }}
              >
                {isBookmarked ? (
                  <BookmarkCheck size={16} color={colors.accent} strokeWidth={3} />
                ) : (
                  <Bookmark size={16} color={colors.text} strokeWidth={2.5} />
                )}
              </Pressable>
            )}
          </View>
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
          borderColor: colors.borderStrong,
        },
        !pressed && Shadows.sm,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.textContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.source, { color: colors.accent }]}>{article.source.toUpperCase()}</Text>
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
              {timeAgo(article.publishedAt).toUpperCase()}
            </Text>
          </View>
        </View>

        {article.imageUrl ? (
          <View style={[styles.thumbnailContainer, { borderColor: colors.borderStrong, borderWidth: BorderWidth.thick }]}>
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
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    overflow: 'visible',
  },
  cardPressed: {
    transform: [{ translateX: 3 }, { translateY: 3 }],
    ...Shadows.none,
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
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 90,
    height: 90,
  },

  // ── Featured Card ──────────────────────────────────────────
  featuredCard: {
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    overflow: 'visible',
    marginBottom: Spacing.xl,
  },
  imageContainer: {
    position: 'relative',
    height: 240,
    overflow: 'hidden',
    borderTopLeftRadius: Radius.xs,
    borderTopRightRadius: Radius.xs,
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
    width: 44,
    height: 44,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredTitle: {
    ...Typography.h1,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
  },

  // ── Compact Card ───────────────────────────────────────────
  compactCard: {
    width: 220,
    marginRight: Spacing.xl,
    borderRadius: Radius.xs,
    overflow: 'visible',
    borderWidth: BorderWidth.thick,
    marginBottom: Spacing.md,
  },
  compactImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: Radius.xs,
    borderTopRightRadius: Radius.xs,
    borderBottomWidth: BorderWidth.thick,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  compactContent: {
    padding: Spacing.md,
    gap: 6,
  },
  compactSource: {
    ...Typography.overline,
    fontSize: 9,
    fontWeight: '900',
  },
  compactTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
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
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
