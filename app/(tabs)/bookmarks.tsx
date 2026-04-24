import { SkeletonBlock } from '@/components/Skeleton';
import { BentoConfig, BorderWidth, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
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
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>SAVED</Text>
        {bookmarks.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: '#FFE600', borderColor: '#000', borderWidth: BorderWidth.normal }]}>
            <Text style={[styles.countText, { color: '#000' }]}>
              {bookmarks.length} {bookmarks.length === 1 ? 'STORY' : 'STORIES'}
            </Text>
          </View>
        )}
      </View>

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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surface, borderColor: '#000' }, Shadows.md]}>
              <BookmarkX size={40} color={colors.text} strokeWidth={2.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>NOTHING SAVED</Text>
            <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
              TAB THE BOOKMARK ICON ON ANY ARTICLE TO SYNC IT HERE.
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
        ListFooterComponent={<View style={{ height: 120 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: BentoConfig.paddingH,
    paddingTop: 60,
    paddingBottom: Spacing.md,
    borderBottomWidth: BorderWidth.thick,
    borderBottomColor: '#000',
  },
  title: {
    ...Typography.display,
    fontSize: 48,
    lineHeight: 52,
  },
  content: {
    paddingHorizontal: BentoConfig.paddingH,
    paddingTop: Spacing.lg,
  },
  countBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  countText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyState: {
    paddingVertical: 100,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.thick,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.h2,
    fontWeight: '900',
  },
  emptyBody: {
    ...Typography.body,
    textAlign: 'center',
    maxWidth: '75%',
    fontWeight: '800',
    lineHeight: 20,
  },
});
