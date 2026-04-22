import { SkeletonBlock } from '@/components/Skeleton';
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
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

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
  const colors = useThemeColors();
  return (
    <View style={{ paddingHorizontal: BentoConfig.paddingH, backgroundColor: colors.background, flex: 1, paddingTop: 70 }}>
      <SkeletonBlock height={28} width={140} radius={Radius.sm} style={{ marginBottom: 8 }} />
      <SkeletonBlock height={16} width={200} radius={Radius.xs} style={{ marginBottom: 24 }} />
      <SkeletonBlock height={40} radius={Radius.md} style={{ marginBottom: 24 }} />
      <SkeletonBlock height={260} radius={Radius.xl} style={{ marginBottom: BentoConfig.gap }} />
      <View style={{ flexDirection: 'row', gap: BentoConfig.gap }}>
        <SkeletonBlock height={180} radius={Radius.lg} style={{ flex: 1 }} />
        <SkeletonBlock height={180} radius={Radius.lg} style={{ flex: 1 }} />
      </View>
    </View>
  );
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
        geopolitics: ['politics', 'geopolitics', 'world', 'election', 'war', 'government', 'biden', 'putin', 'china'],
        ai_tech: ['tech', 'technology', 'ai', 'software', 'apple', 'google', 'microsoft', 'nvidia', 'openai', 'cyber'],
        crypto: ['crypto', 'bitcoin', 'ethereum', 'btc', 'eth', 'solana', 'blockchain', 'binance', 'coinbase'],
        wall_street: ['market', 'stock', 'trading', 'wall street', 'dow', 'nasdaq', 's&p', 'fed', 'inflation', 'economy'],
        startups: ['startup', 'founder', 'funding', 'vc', 'venture', 'y combinator', 'seed', 'series'],
      };
      allNews = allNews.filter((article) => {
        const text = `${article.title} ${article.summary}`.toLowerCase();
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
            {/* Featured Bento Tile */}
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

            {/* Top Stories — Horizontal Bento Row */}
            {topStories.length > 0 && (
              <View style={styles.topStoriesSection}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Stories</Text>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContent}
                >
                  {topStories.map((item) => (
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

            {/* Read Later Header */}
            {readLater.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.accentSoft }]}>
                  <Text style={[styles.countText, { color: colors.accent }]}>{readLater.length}</Text>
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  dateText: {
    ...Typography.overline,
    marginBottom: 2,
  },
  mainTitle: {
    ...Typography.display,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.normal,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Theme Switcher ─────────────────────────────────────────
  themeSwitcherContainer: {
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.normal,
  },

  // ── Search ─────────────────────────────────────────────────
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.normal,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },

  // ── Categories ─────────────────────────────────────────────
  categoryContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.xl,
  },
  categoryPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: BorderWidth.normal,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // ── Content ────────────────────────────────────────────────
  content: {
    paddingHorizontal: BentoConfig.paddingH,
    paddingTop: Spacing.sm,
    paddingBottom: 100,
  },
  featuredSection: {
    marginBottom: Spacing.sm,
  },
  topStoriesSection: {
    marginBottom: Spacing['2xl'],
  },
  horizontalScrollContent: {
    paddingVertical: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  countText: {
    fontSize: 12,
    fontWeight: '800',
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
