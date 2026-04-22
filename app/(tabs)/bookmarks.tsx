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
    <View style={{ paddingHorizontal: 20, paddingTop: 28, backgroundColor: colors.background, flex: 1 }}>
      <SkeletonBlock height={220} radius={28} style={{ marginBottom: 16 }} />
      <SkeletonBlock height={220} radius={28} />
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
    provider: 'marketaux',
  }));

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
            tintColor={colors.gold} 
          />
        }
        contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: colors.icon }]}>Saved</Text>
          <Text style={[styles.title, { color: colors.text }]}>Bookmarks</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No bookmarks yet</Text>
          <Text style={[styles.emptyBody, { color: colors.icon }]}>Save stories to read later</Text>
        </View>
      }
      renderItem={({ item }) => (
        <NewsCard
          article={item}
          isBookmarked
          onPress={() => {
            setSelectedArticle(item);
            router.push({ pathname: '/news/[id]', params: { id: item.id } });
          }}
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
    fontWeight: '700',
  },
  emptyState: {
    paddingVertical: 120,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  emptyBody: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
  },
});
