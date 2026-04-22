import { SkeletonBlock } from '@/components/Skeleton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { NewsCard } from '@/src/components/NewsCard';
import { getBookmarks, removeBookmark } from '@/src/services/db';
import { useNewsStore } from '@/src/store/useNewsStore';
import { NewsArticle } from '@/src/types/news';
import { FlashList } from '@shopify/flash-list';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

function BookmarkSkeleton() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 60, backgroundColor: colors.background, flex: 1 }}>
      <SkeletonBlock height={120} radius={12} style={{ marginBottom: 16 }} />
      <SkeletonBlock height={120} radius={12} style={{ marginBottom: 16 }} />
      <SkeletonBlock height={120} radius={12} />
    </View>
  );
}

export default function BookmarksScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setSelectedArticle } = useNewsStore();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
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
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <FlashList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={bookmarksQuery.isRefetching} 
            onRefresh={bookmarksQuery.refetch} 
            tintColor={colors.accent} 
          />
        }
        contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>Read Later</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.primary }]}>No bookmarks yet</Text>
          <Text style={[styles.emptyBody, { color: colors.secondary }]}>Save stories to read later</Text>
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
    />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1,
    fontWeight: '900',
  },
  emptyState: {
    paddingVertical: 120,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  emptyBody: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
    fontWeight: '500',
  },
});
