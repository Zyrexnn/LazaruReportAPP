import { SkeletonBlock } from '@/components/Skeleton';
import { BentoConfig, BorderWidth, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors, useIsDark } from '@/hooks/use-color-scheme';
import { NewsCard } from '@/src/components/NewsCard';
import { getBookmarks, removeBookmark } from '@/src/services/db';
import { useNewsStore } from '@/src/store/useNewsStore';
import { NewsArticle } from '@/src/types/news';
import { FlashList } from '@shopify/flash-list';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BookmarkX } from 'lucide-react-native';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

function BookmarkSkeleton() {
  const colors = useThemeColors();
  return (
    <View style={{ paddingHorizontal: BentoConfig.paddingH, paddingTop: 70, backgroundColor: colors.background, flex: 1 }}>
      <SkeletonBlock height={28} width={160} radius={Radius.sm} style={{ marginBottom: 8 }} />
      <SkeletonBlock height={14} width={100} radius={Radius.xs} style={{ marginBottom: 32 }} />
      {[1, 2, 3].map((i) => (
        <SkeletonBlock key={i} height={110} radius={Radius.lg} style={{ marginBottom: BentoConfig.gap }} />
      ))}
    </View>
  );
}

export default function BookmarksScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setSelectedArticle } = useNewsStore();
  const colors = useThemeColors();
  const isDark = useIsDark();

  const bookmarksQuery = useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarks,
  });

  if (bookmarksQuery.isLoading) {
    return <BookmarkSkeleton />;
  }

  const bookmarks = (bookmarksQuery.data ?? []).map<NewsArticle>((item) => ({
    ...item,
    provider: 'marketaux', // fallback provider
  }));

  const openArticle = async (article: NewsArticle) => {
    const { openBrowserAsync } = await import('expo-web-browser');
    await openBrowserAsync(article.contentUrl);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <FlashList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        estimatedItemSize={120}
        refreshControl={
          <RefreshControl
            refreshing={bookmarksQuery.isRefetching}
            onRefresh={bookmarksQuery.refetch}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Saved</Text>
            {bookmarks.length > 0 && (
              <View style={[styles.countBadge, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.countText, { color: colors.accent }]}>
                  {bookmarks.length} {bookmarks.length === 1 ? 'article' : 'articles'}
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <BookmarkX size={32} color={colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No bookmarks yet</Text>
            <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
              Tap the bookmark icon on any article to save it here for later reading
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <NewsCard
            article={item}
            isBookmarked
            onPress={() => openArticle(item)}
            onToggleBookmark={async () => {
              await removeBookmark(item.id);
              await queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
            }}
          />
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: BentoConfig.paddingH,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: Spacing['2xl'],
  },
  title: {
    ...Typography.display,
    fontSize: 32,
  },
  countBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.xs,
    marginTop: Spacing.sm,
  },
  countText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  emptyState: {
    paddingVertical: 100,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.thick,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.h2,
  },
  emptyBody: {
    ...Typography.body,
    textAlign: 'center',
    maxWidth: '75%',
    lineHeight: 22,
  },
});
