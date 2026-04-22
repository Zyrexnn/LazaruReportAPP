import { SkeletonBlock } from '@/components/Skeleton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { NewsCard } from '@/src/components/NewsCard';
import { addBookmark, getBookmarks, removeBookmark } from '@/src/services/db';
import { fetchUnifiedNews } from '@/src/services/newsApi';
import { useNewsStore } from '@/src/store/useNewsStore';
import { NewsArticle } from '@/src/types/news';
import { FlashList } from '@shopify/flash-list';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Clock, Search, TrendingUp } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const bookmarkQueryKey = ['bookmarks'];
const newsQueryKey = ['news-feed'];

function NewsSkeleton() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={{ paddingHorizontal: 16, backgroundColor: colors.background, flex: 1, paddingTop: 60 }}>
      <SkeletonBlock height={80} radius={12} style={{ marginBottom: 20 }} />
      <SkeletonBlock height={200} radius={12} style={{ marginBottom: 12 }} />
      <SkeletonBlock height={140} radius={12} style={{ marginBottom: 12 }} />
      <SkeletonBlock height={140} radius={12} />
    </View>
  );
}

function BreakingBanner() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  return (
    <View style={[styles.breakingBanner, { backgroundColor: colors.error }]}>
      <TrendingUp size={16} color="#FFFFFF" strokeWidth={2} />
      <Text style={styles.breakingText}>LIVE</Text>
      <Text style={styles.breakingMessage}>Markets updating in real-time</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setSelectedArticle } = useNewsStore();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [category, setCategory] = useState<'all' | 'markets' | 'crypto' | 'tech'>('all');

  const newsQuery = useQuery({
    queryKey: newsQueryKey,
    queryFn: () => fetchUnifiedNews(),
    refetchInterval: 60000, // Refresh every minute
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
    const allNews = newsQuery.data ?? [];
    if (category === 'all') return allNews;
    
    // Simple filtering based on keywords in title/summary
    const keywords: Record<string, string[]> = {
      markets: ['market', 'stock', 'trading', 'wall street', 'dow', 'nasdaq', 's&p'],
      crypto: ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'btc', 'eth'],
      tech: ['tech', 'technology', 'ai', 'software', 'apple', 'google', 'microsoft'],
    };
    
    return allNews.filter(article => {
      const text = `${article.title} ${article.summary}`.toLowerCase();
      return keywords[category]?.some(keyword => text.includes(keyword));
    });
  }, [newsQuery.data, category]);

  const featured = filteredNews.slice(0, 1);
  const latest = filteredNews.slice(1);

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
    // Open URL directly in browser
    const { openBrowserAsync } = await import('expo-web-browser');
    await openBrowserAsync(article.contentUrl);
  };

  if (newsQuery.isLoading) {
    return <NewsSkeleton />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <Image 
            source={require('@/assets/logolazarusreport.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Pressable style={[styles.searchButton, { backgroundColor: colors.card }]}>
            <Search size={20} color={colors.icon} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>News</Text>
            <View style={[styles.liveDot, { backgroundColor: colors.error }]} />
          </View>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {(['all', 'markets', 'crypto', 'tech'] as const).map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: category === cat ? colors.accent : colors.card,
                }
              ]}
            >
              <Text style={[
                styles.categoryText,
                { color: category === cat ? '#FFFFFF' : colors.text }
              ]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlashList
        data={latest}
        keyExtractor={(item) => item.id}
        estimatedItemSize={160}
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
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Story</Text>
                  <Clock size={14} color={colors.icon} strokeWidth={2} />
                </View>
                <NewsCard
                  featured
                  article={featured[0]}
                  isBookmarked={bookmarkedIds.has(featured[0].id)}
                  onPress={() => openArticle(featured[0])}
                  onToggleBookmark={() => toggleBookmark(featured[0])}
                />
              </View>
            )}
            
            {latest.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest Updates</Text>
                <Text style={[styles.sectionCount, { color: colors.icon }]}>
                  {latest.length} articles
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No articles found</Text>
            <Text style={[styles.emptyBody, { color: colors.icon }]}>
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 200,
    height: 52,
    marginBottom: 8,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    fontWeight: '700',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },
  categoryContainer: {
    marginTop: 8,
  },
  categoryContent: {
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  breakingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  breakingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  breakingMessage: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  featuredSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    paddingVertical: 100,
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
