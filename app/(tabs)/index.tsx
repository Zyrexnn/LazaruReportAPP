import { SkeletonBlock } from '@/components/Skeleton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { NewsCard } from '@/src/components/NewsCard';
import { addBookmark, getBookmarks, removeBookmark } from '@/src/services/db';
import { fetchUnifiedNews } from '@/src/services/newsApi';
import { useNewsStore } from '@/src/store/useNewsStore';
import { useThemeStore } from '@/src/store/useThemeStore';
import { NewsArticle } from '@/src/types/news';
import { FlashList } from '@shopify/flash-list';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, Search, Sun, Moon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const bookmarkQueryKey = ['bookmarks'];
const newsQueryKey = ['news-feed'];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'geopolitics', label: 'Geopolitics' },
  { id: 'ai_tech', label: 'AI & Tech' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'wall_street', label: 'Wall Street' },
  { id: 'startups', label: 'Startups' },
];

function NewsSkeleton() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={{ paddingHorizontal: 16, backgroundColor: colors.background, flex: 1, paddingTop: 60 }}>
      <SkeletonBlock height={40} radius={8} style={{ marginBottom: 20 }} />
      <SkeletonBlock height={200} radius={12} style={{ marginBottom: 12 }} />
      <SkeletonBlock height={140} radius={12} style={{ marginBottom: 12 }} />
      <SkeletonBlock height={140} radius={12} />
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setSelectedArticle } = useNewsStore();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { toggleTheme } = useThemeStore();
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const newsQuery = useQuery({
    queryKey: newsQueryKey,
    queryFn: () => fetchUnifiedNews(),
    refetchInterval: 60000,
  });

  const bookmarksQuery = useQuery({
    queryKey: bookmarkQueryKey,
    queryFn: getBookmarks,
  });

  const bookmarkedIds = useMemo(
    () => new Set((bookmarksQuery.data ?? []).map((item) => item.id)),
    [bookmarksQuery.data]
  );

  const filteredNews = useMemo(() => {
    let allNews = newsQuery.data ?? [];
    
    // Ensure sorted by newest
    allNews = [...allNews].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      allNews = allNews.filter(article => 
        article.title.toLowerCase().includes(q) || 
        article.summary?.toLowerCase().includes(q) || 
        article.source.toLowerCase().includes(q)
      );
    } else if (category !== 'all') {
      const keywords: Record<string, string[]> = {
        geopolitics: ['politics', 'geopolitics', 'world', 'election', 'war', 'government', 'biden', 'putin', 'china'],
        ai_tech: ['tech', 'technology', 'ai', 'software', 'apple', 'google', 'microsoft', 'nvidia', 'openai', 'cyber'],
        crypto: ['crypto', 'bitcoin', 'ethereum', 'btc', 'eth', 'solana', 'blockchain', 'binance', 'coinbase'],
        wall_street: ['market', 'stock', 'trading', 'wall street', 'dow', 'nasdaq', 's&p', 'fed', 'inflation', 'economy'],
        startups: ['startup', 'founder', 'funding', 'vc', 'venture', 'y combinator', 'seed', 'series'],
      };
      
      allNews = allNews.filter(article => {
        const text = `${article.title} ${article.summary}`.toLowerCase();
        return keywords[category]?.some(keyword => text.includes(keyword));
      });
    }
    return allNews;
  }, [newsQuery.data, category, searchQuery]);

  const featured = filteredNews.slice(0, 1);
  const topStories = filteredNews.slice(1, 5);
  const readLater = filteredNews.slice(5);

  const toggleBookmark = async (article: NewsArticle) => {
    if (bookmarkedIds.has(article.id)) {
      await removeBookmark(article.id);
    } else {
      await addBookmark({
        id: article.id,
        title: article.title,
        source: article.source,
        imageUrl: article.imageUrl,
        contentUrl: article.contentUrl,
        publishedAt: article.publishedAt,
        summary: article.summary,
      });
    }
    await queryClient.invalidateQueries({ queryKey: bookmarkQueryKey });
  };

  const openArticle = async (article: NewsArticle) => {
    const { openBrowserAsync } = await import('expo-web-browser');
    await openBrowserAsync(article.contentUrl);
  };

  if (newsQuery.isLoading) {
    return <NewsSkeleton />;
  }

  const currentDate = new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.dateText, { color: colors.secondary }]}>{currentDate}</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Pressable onPress={toggleTheme}>
               {colorScheme === 'dark' ? <Sun size={24} color={colors.primary} /> : <Moon size={24} color={colors.primary} />}
            </Pressable>
            <Pressable onPress={() => setIsSearching(!isSearching)}>
               <Search size={24} color={colors.primary} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        {isSearching ? (
          <TextInput
            style={[styles.searchInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
            placeholder="Search news..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        ) : (
          <Text style={[styles.mainTitle, { color: colors.primary }]}>Breaking News</Text>
        )}

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => {
                setCategory(cat.id);
                setSearchQuery('');
              }}
              style={[
                styles.categoryButton,
                category === cat.id && { borderBottomWidth: 2, borderBottomColor: colors.primary }
              ]}
            >
              <Text style={[
                styles.categoryText,
                { color: category === cat.id ? colors.primary : colors.secondary, fontWeight: category === cat.id ? '700' : '500' }
              ]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlashList
        data={readLater}
        keyExtractor={(item) => item.id}
        estimatedItemSize={120}
        refreshControl={
          <RefreshControl 
            refreshing={newsQuery.isRefetching} 
            onRefresh={newsQuery.refetch} 
            tintColor={colors.accent} 
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            {featured.length > 0 && (
              <View style={styles.featuredSection}>
                <NewsCard
                  featured
                  article={featured[0]}
                  isBookmarked={bookmarkedIds.has(featured[0].id)}
                  onPress={() => openArticle(featured[0])}
                  onToggleBookmark={() => toggleBookmark(featured[0])}
                />
              </View>
            )}
            
            {topStories.length > 0 && (
              <View style={styles.topStoriesSection}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.primary }]}>Top Stories</Text>
                  <ChevronRight size={20} color={colors.primary} />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
                  {topStories.map(item => (
                    <NewsCard
                      key={item.id}
                      compact
                      article={item}
                      onPress={() => openArticle(item)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

             {readLater.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Read Later</Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No articles found</Text>
            <Text style={[styles.emptyBody, { color: colors.secondary }]}>
              Try a different category or pull to refresh
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
        renderItem={({ item }) => (
          <NewsCard
            article={item}
            isBookmarked={bookmarkedIds.has(item.id)}
            onPress={() => openArticle(item)}
            onToggleBookmark={() => toggleBookmark(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mainTitle: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1,
    fontWeight: '900',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1,
    fontWeight: '900',
    marginBottom: 20,
  },
  searchInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  categoryContainer: {
    marginBottom: 4,
  },
  categoryScroll: {
    marginBottom: 4,
  },
  categoryContent: {
    gap: 12,
    paddingRight: 20,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  featuredSection: {
    marginBottom: 12,
  },
  topStoriesSection: {
    marginBottom: 32,
  },
  horizontalScrollContent: {
    paddingVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
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
