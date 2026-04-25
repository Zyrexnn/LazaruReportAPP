import { NewsLoading } from '@/components/NewsLoading';
import { BentoConfig, BorderWidth, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { useThemeColors, useIsDark } from '@/hooks/use-color-scheme';
import { NewsCard } from '@/src/components/NewsCard';
import { ThemeSwitcher } from '@/src/components/ThemeSwitcher';
import { addBookmark, getBookmarks, removeBookmark } from '@/src/services/db';
import { fetchUnifiedNews } from '@/src/services/newsApi';
import { useNewsStore } from '@/src/store/useNewsStore';
import { NewsArticle } from '@/src/types/news';
import { FlashList } from '@shopify/flash-list';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, Palette, Search, X } from 'lucide-react-native';
import { useMemo, useState, useEffect } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolateColor } from 'react-native-reanimated';

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

function SentimentBento({ value, classification }: { value: number; classification: string }) {
  const colors = useThemeColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(value / 100, { damping: 15 });
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.4, 0.5, 0.6, 1],
      ['#FF0033', '#FF9900', '#FFCC00', '#99FF00', '#00FF66']
    ),
  }));

  return (
    <View style={[styles.miniBento, { backgroundColor: colors.surface, borderColor: colors.borderStrong, overflow: 'hidden' }]}>
      <View style={styles.sentimentLabelRow}>
        <Text style={[styles.miniBentoLabel, { color: colors.textSecondary }]}>SENTIMENT</Text>
        <View style={[styles.sentimentIndicator, { 
          backgroundColor: value < 40 ? '#FF0033' : value < 60 ? '#FFCC00' : '#00FF66' 
        }]} />
      </View>
      <Text style={[styles.miniBentoValue, { fontSize: 16, color: colors.text }]} numberOfLines={1}>
        {classification.toUpperCase()}
      </Text>
      <View style={[styles.sentimentBarBg, { backgroundColor: colors.muted, height: 4, borderRadius: 2, marginTop: 8 }]}>
        <Animated.View style={[styles.sentimentBarFill, animatedStyle, { height: '100%', borderRadius: 2 }]} />
      </View>
    </View>
  );
}

function NewsSkeleton() {
  return <NewsLoading />;
}

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setSelectedArticle } = useNewsStore();
  const colors = useThemeColors();
  const isDark = useIsDark();
  const { width: screenWidth } = useWindowDimensions();

  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  const newsQuery = useQuery({
    queryKey: newsQueryKey,
    queryFn: () => fetchUnifiedNews(),
    refetchInterval: 60000,
  });

  const bookmarksQuery = useQuery({
    queryKey: bookmarkQueryKey,
    queryFn: getBookmarks,
  });

  const sentimentQuery = useQuery({
    queryKey: ['market-sentiment'],
    queryFn: async () => {
      try {
        const res = await fetch('https://api.alternative.me/fng/');
        const data = await res.json();
        return data.data?.[0] ?? { value: '50', value_classification: 'Neutral' };
      } catch {
        return { value: '50', value_classification: 'Neutral' };
      }
    },
    refetchInterval: 3600000,
  });

  const bookmarkedIds = useMemo(
    () => new Set((bookmarksQuery.data ?? []).map((item) => item.id)),
    [bookmarksQuery.data]
  );

  const filteredNews = useMemo(() => {
    let allNews = newsQuery.data ?? [];
    allNews = [...allNews].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      allNews = allNews.filter(
        (article) =>
          article.title.toLowerCase().includes(q) ||
          article.summary?.toLowerCase().includes(q) ||
          article.source.toLowerCase().includes(q)
      );
    } else if (category !== 'all') {
      const keywords: Record<string, string[]> = {
        geopolitics: ['politics', 'geopolitics', 'world', 'election', 'war', 'government', 'biden', 'putin', 'china', 'middle east', 'nato', 'diplomacy', 'foreign policy', 'israel', 'ukraine', 'russia', 'un'],
        ai_tech: ['tech', 'technology', 'ai', 'software', 'apple', 'google', 'microsoft', 'nvidia', 'openai', 'cyber', 'robotics', 'silicon', 'digital', 'internet', 'computing', 'meta', 'amazon', 'semiconductor'],
        crypto: ['crypto', 'bitcoin', 'ethereum', 'btc', 'eth', 'solana', 'blockchain', 'binance', 'coinbase', 'defi', 'nft', 'mining', 'wallet', 'token', 'altcoin', 'doge'],
        wall_street: ['market', 'stock', 'trading', 'wall street', 'dow', 'nasdaq', 's&p', 'fed', 'inflation', 'economy', 'finance', 'investing', 'bank', 'interest rate', 'yield', 'bond', 'gold'],
        startups: ['startup', 'founder', 'funding', 'vc', 'venture', 'y combinator', 'seed', 'series', 'entrepreneur', 'equity', 'ipo', 'unicorn', 'pitch', 'saas'],
      };
      allNews = allNews.filter((article) => {
        // Stricter relevance: check title, summary, source, and provider-provided category
        const text = `${article.title} ${article.summary} ${article.source} ${article.category || ''}`.toLowerCase();
        return keywords[category]?.some((keyword) => text.includes(keyword));
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
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ── Header ────────────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>{currentDate}</Text>
            <Text style={[styles.mainTitle, { color: colors.text }]}>Lazarus</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setShowThemes(!showThemes)}
              style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Palette size={18} color={colors.accent} strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={() => {
                setIsSearching(!isSearching);
                if (isSearching) setSearchQuery('');
              }}
              style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              {isSearching ? (
                <X size={18} color={colors.text} strokeWidth={2} />
              ) : (
                <Search size={18} color={colors.text} strokeWidth={2} />
              )}
            </Pressable>
          </View>
        </View>

        {/* Theme Switcher */}
        {showThemes && (
          <View style={[styles.themeSwitcherContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemeSwitcher />
          </View>
        )}

        {/* Search */}
        {isSearching && (
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={16} color={colors.textSecondary} strokeWidth={2} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search news..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        )}

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => {
                  setCategory(cat.id);
                  setSearchQuery('');
                }}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: active ? colors.accent : colors.surface,
                    borderColor: active ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: active ? colors.badgeText : colors.textSecondary },
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Content ───────────────────────────────────────────── */}
      <FlashList
        data={readLater}
        keyExtractor={(item) => item.id}
        estimatedItemSize={140}
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
            {/* Bento Grid Header */}
            <View style={styles.bentoGrid}>
              {/* Main Featured Tile (2x2 ish) */}
              {featured.length > 0 && (
                <View style={styles.featuredContainer}>
                  <NewsCard
                    featured
                    article={featured[0]}
                    isBookmarked={bookmarkedIds.has(featured[0].id)}
                    onPress={() => openArticle(featured[0])}
                    onToggleBookmark={() => toggleBookmark(featured[0])}
                  />
                </View>
              )}

              {/* Decorative / Stat Tiles */}
              <View style={styles.bentoRow}>
                <SentimentBento 
                  value={parseInt(sentimentQuery.data?.value ?? '50')} 
                  classification={sentimentQuery.data?.value_classification ?? 'Neutral'} 
                />
                <View style={[styles.miniBento, { backgroundColor: colors.accent, borderColor: colors.borderStrong }]}>
                  <Text style={[styles.miniBentoLabel, { color: '#FFF' }]}>LATEST</Text>
                  <Text style={[styles.miniBentoValue, { color: '#FFF' }]}>{filteredNews.length} UPDATES</Text>
                </View>
              </View>
            </View>

            {/* Top Stories — Horizontal Bento Row */}
            {topStories.length > 0 && (
              <View style={styles.topStoriesSection}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionTitleBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>TOP STORIES</Text>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContent}
                  snapToInterval={220}
                  decelerationRate="fast"
                >
                  {topStories.map((item) => (
                    <NewsCard
                      key={item.id}
                      compact
                      article={item}
                      isBookmarked={bookmarkedIds.has(item.id)}
                      onPress={() => openArticle(item)}
                      onToggleBookmark={() => toggleBookmark(item)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Read Later Header */}
            {readLater.length > 0 && (
              <View style={styles.sectionHeader}>
                 <View style={[styles.sectionTitleBox, { backgroundColor: '#00FF66', borderColor: colors.borderStrong }]}>
                    <Text style={[styles.sectionTitle, { color: '#000' }]}>LATEST FEED</Text>
                  </View>
                <View style={[styles.countBadge, { backgroundColor: colors.surface, borderColor: colors.borderStrong, borderWidth: BorderWidth.normal }]}>
                  <Text style={[styles.countText, { color: colors.text }]}>{readLater.length}</Text>
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No articles found</Text>
            <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
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
  // ── Header ─────────────────────────────────────────────────
  header: {
    paddingHorizontal: BentoConfig.paddingH,
    paddingTop: 60,
    paddingBottom: Spacing.md,
    borderBottomWidth: BorderWidth.thick,
    borderBottomColor: '#000',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  dateText: {
    ...Typography.overline,
    marginBottom: 0,
    fontWeight: '900',
    color: '#000',
  },
  mainTitle: {
    ...Typography.display,
    fontSize: 48,
    lineHeight: 52,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },

  // ── Theme Switcher ─────────────────────────────────────────
  themeSwitcherContainer: {
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    ...Shadows.md,
  },

  // ── Search ─────────────────────────────────────────────────
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Categories ─────────────────────────────────────────────
  categoryContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.xl,
    paddingVertical: Spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    ...Shadows.md,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ── Bento Grid ─────────────────────────────────────────────
  bentoGrid: {
    gap: BentoConfig.gap,
    marginBottom: Spacing.lg,
  },
  featuredContainer: {
    width: '100%',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: BentoConfig.gap,
  },
  miniBento: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    justifyContent: 'center',
    ...Shadows.md,
  },
  miniBentoLabel: {
    ...Typography.overline,
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
  },
  miniBentoValue: {
    ...Typography.h3,
    fontSize: 16,
    marginTop: 2,
  },
  sentimentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  sentimentIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  sentimentBarBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  sentimentBarFill: {
    height: '100%',
    borderRadius: 3,
  },
 
  // ── Content ────────────────────────────────────────────────
  content: {
    paddingHorizontal: BentoConfig.paddingH,
    paddingTop: Spacing.lg,
    paddingBottom: 100,
  },
  topStoriesSection: {
    marginBottom: Spacing['2xl'],
    marginTop: Spacing.sm,
  },
  horizontalScrollContent: {
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.xl,
  },
  sectionHeader: {
    lexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitleBox: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: BorderWidth.thick,
    borderRadius: Radius.xs,
    ...Shadows.md,
  },
  sectionTitle: {
    ...Typography.overline,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  countBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    borderWidth: BorderWidth.thick,
    ...Shadows.md,
  },
  countText: {
    fontSize: 12,
    fontWeight: '900',
  },

  // ── Empty State ────────────────────────────────────────────
  emptyState: {
    paddingVertical: 120,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h2,
  },
  emptyBody: {
    ...Typography.body,
    textAlign: 'center',
    maxWidth: '80%',
  },
}); 
